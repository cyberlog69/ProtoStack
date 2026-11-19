# Deploying ProtoStack

ProtoStack is a stateless Next.js application: no database, no object storage, no
background workers. Any host that can run a Node.js process or an OCI container
can serve it.

## Choose a target

| Target | Cost | Container | Notes |
| :--- | :--- | :---: | :--- |
| GCP Compute Engine VM | Free tier / paid | optional | Full control; systemd + Caddy walkthrough below |
| Docker / Podman locally | Free | yes | Simplest way to verify the production image |
| GCP Cloud Run | Free tier | yes | Scales to zero; build args need a manual image build |
| Fly.io | Free allowance | yes | `fly.toml` included |
| Render | Free plan | yes | Sleeps when idle; `render.yaml` included |
| Koyeb / Railway / Northflank | Free allowances | yes | Dockerfile auto-detected |
| Oracle Cloud Always Free | Free ARM VM | yes | Use the arm64 image or build on the VM |
| Vercel | Free hobby | no | Native Next.js host; no config needed |
| Netlify | Free plan | optional | `netlify.toml` included; runtime support must track Next 16 |
| GitHub Pages / S3 | Free | no | Not suitable: dynamic API routes would be lost |

Free tiers change regularly; treat the table as a starting point, not a contract.

## Requirements

| Requirement | Value |
| :--- | :--- |
| Node.js | 20.9 or newer (22 LTS recommended) |
| Memory | 512 MB to run, 1–2 GB to build |
| Disk | ~500 MB for dependencies and build output |
| Outbound network | DNS (53) and HTTPS (443) for the live sandboxes |
| Inbound ports | 80/443 via a reverse proxy, or 3000 internally |

## Build-time vs runtime configuration

| Variable | When | Why |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_SITE_URL` | **Build** | Baked into canonical URLs, Open Graph metadata, `sitemap.xml` and `robots.txt`. Rebuild to change it. |
| `NEXT_OUTPUT` | **Build** | Set to `standalone` when building the container image. |
| `HTTP_TEST_ALLOWED_HOSTS` | **Runtime** | Comma-separated allowlist for `/api/http-test`; read per request. |

If `NEXT_PUBLIC_SITE_URL` is omitted, the build uses `http://localhost:3000`.
The site still works, but canonical URLs and the sitemap will point at localhost.

## Health endpoint

`GET /api/health` returns:

```json
{ "status": "ok", "uptimeSeconds": 42, "timestamp": "2026-11-18T12:00:00.000Z" }
```

Use it for container health checks and platform probes. It exposes no versions,
hostnames or environment values.

---

## Docker

```bash
docker build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://proto.example.com \
  -t protostack .

docker run --rm -p 3000:3000 \
  -e HTTP_TEST_ALLOWED_HOSTS=example.com,httpbin.org \
  protostack
```

Open <http://localhost:3000>.

The image is multi-stage, runs as a non-root user and uses Next.js standalone
output (approximately 200 MB). Because the app is served over plain HTTP in this
example, the image does not send HSTS or `upgrade-insecure-requests`; both switch
on automatically when `NEXT_PUBLIC_SITE_URL` starts with `https://`.

### Docker Compose

```bash
cp .env.example .env          # edit NEXT_PUBLIC_SITE_URL
docker compose up -d --build
docker compose logs -f
```

Change `PROTOSTACK_PORT` to publish a different host port.

### Prebuilt image

`.github/workflows/container.yml` publishes `ghcr.io/cyberlog69/protostack`
(`latest`, branch, SHA and semver tags) on pushes to `main` and on tags.

```bash
docker run --rm -p 3000:3000 ghcr.io/cyberlog69/protostack:latest
```

The published image is built with the default `http://localhost:3000` canonical
URL unless the repository variable `NEXT_PUBLIC_SITE_URL` is set. For a public
site, build your own image with the correct build argument.

GHCR packages are private by default even when the repository is public. To pull
anonymously, open the package settings on GitHub and change its visibility to
public, or authenticate with a personal access token that has `read:packages`.

### Continuous Deployment (CD) to Oracle VM

`.github/workflows/container.yml` automatically builds the multi-arch container image and deploys updates to the Oracle VM via SSH on pushes to `main`.

To enable automatic deployment, configure these GitHub repository secrets under **Settings** ➔ **Secrets and variables** ➔ **Actions**:

- `ORACLE_VM_HOST`: The public IP or domain of your VM (e.g. `protostack.online` or `68.233.97.9`).
- `ORACLE_VM_USER`: The SSH user (defaults to `ubuntu`).
- `ORACLE_VM_KEY`: The private SSH key used to connect to the VM.

---

## Podman

The same Dockerfile works without changes.

```bash
podman build \
  --build-arg NEXT_PUBLIC_SITE_URL=https://proto.example.com \
  -t protostack .

podman run --rm -p 8080:3000 \
  -e HTTP_TEST_ALLOWED_HOSTS=example.com,httpbin.org \
  protostack
```

Rootless Podman cannot bind ports below 1024 by default, hence `8080`. Use a
reverse proxy (Caddy, Nginx) for 80/443.

### Podman Compose

```bash
podman-compose up -d --build
```

### Podman Quadlet (systemd-managed)

[`deploy/podman/protostack.container`](../deploy/podman/protostack.container) is a
Quadlet unit for rootless Podman 4.4+:

```bash
cp deploy/podman/protostack.container ~/.config/containers/systemd/
systemctl --user daemon-reload
systemctl --user enable --now protostack
systemctl --user status protostack
```

Set `Image=` to your own image if you build locally. `AutoUpdate=registry`
pulls newer images when `podman auto-update` runs.

---

## GCP Compute Engine VM

```bash
# Node 22 on Ubuntu/Debian
sudo apt update && sudo apt install -y git curl
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo mkdir -p /opt/protostack && sudo chown "$USER" /opt/protostack
git clone https://github.com/cyberlog69/ProtoStack.git /opt/protostack
cd /opt/protostack

printf 'NEXT_PUBLIC_SITE_URL=https://proto.example.com\nHTTP_TEST_ALLOWED_HOSTS=example.com,httpbin.org\n' > .env.production
npm ci
npm run build
npm start -- -H 127.0.0.1 -p 3000
```

`/etc/systemd/system/protostack.service`:

```ini
[Unit]
Description=ProtoStack
After=network.target

[Service]
Type=simple
User=proto
WorkingDirectory=/opt/protostack
Environment=NODE_ENV=production
ExecStart=/usr/bin/npm start -- -H 127.0.0.1 -p 3000
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

Caddy on the same VM terminates TLS automatically:

```
proto.example.com {
    reverse_proxy 127.0.0.1:3000
}
```

Open only 80/443 in the VPC firewall:

```bash
gcloud compute firewall-rules create allow-web \
  --allow tcp:80,tcp:443 --target-tags=http-server
gcloud compute instances add-tags YOUR_VM --tags=http-server --zone=YOUR_ZONE
```

A 1 GB `e2-micro` builds the site only with swap enabled; `e2-small` is safer.

### GCP Cloud Run

Cloud Run builds from the Dockerfile and scales to zero.

```bash
gcloud run deploy protostack \
  --source . \
  --region europe-west1 \
  --port 3000 \
  --memory 512Mi \
  --allow-unauthenticated
```

Cloud Run does not pass build arguments from `--set-env-vars`. If canonical URLs
matter, build and push the image yourself with
`--build-arg NEXT_PUBLIC_SITE_URL=https://your-service.run.app`, then deploy that
image with `gcloud run deploy --image`.

---

## Fly.io

```bash
fly launch --no-deploy --copy-config
# edit fly.toml: app name and the NEXT_PUBLIC_SITE_URL build arg
fly deploy
fly open
```

`fly.toml` includes a `/api/health` check and stops machines when idle.

## Render

Commit `render.yaml` and create a Blueprint in the Render dashboard. The free
plan sleeps when idle. Replace the placeholder service URL in `render.yaml` with
the real one after the first deploy so canonical URLs are correct.

## Railway, Koyeb, Northflank

All three detect the `Dockerfile` automatically. When creating the service:

- expose port **3000**
- health check path **`/api/health`** (where supported)
- set `HTTP_TEST_ALLOWED_HOSTS` at runtime
- pass `NEXT_PUBLIC_SITE_URL` as a build argument if the platform supports it;
  otherwise the canonical URL falls back to localhost

## Oracle Cloud Always Free

The Always Free Ampere A1 VM is arm64. Use the published multi-arch image:

```bash
podman run -d --name protostack -p 8080:3000 \
  -e HTTP_TEST_ALLOWED_HOSTS=example.com,httpbin.org \
  ghcr.io/cyberlog69/protostack:latest
```

or build on the VM with `podman build -t protostack .`. The Quadlet unit above
works on arm64 without changes.

## Vercel

Import the repository; no extra configuration is required. Set
`NEXT_PUBLIC_SITE_URL` to the production domain before the first build.

## Netlify

`netlify.toml` enables Netlify's Next.js runtime. If that runtime does not yet
support the installed Next.js version, deploy the container image instead.

## GitHub Pages, S3 static hosting

Not suitable as-is: the site has three dynamic API routes (`/api/dns`,
`/api/http-demo`, `/api/http-test`) and server-rendered metadata. A static export
would lose the DNS resolver and HTTP sandbox.

---

## Operational notes

- **Canonical URL is build-time.** Each environment needs its own build if its
  public origin differs.
- **Rate limiting is per process and in memory.** A single container or VM is
  fine; horizontally scaled deployments multiply the effective limit per IP.
- **No persistent state.** Progress, bookmarks and quiz scores live in the
  visitor's browser. Containers can be replaced freely.
- **Outbound access required.** The DNS resolver and HTTP sandbox need outbound
  DNS/HTTPS. Air-gapped deployments lose those two sandboxes but the rest of the
  site works.
- **Proxy headers.** Rate limiting reads `X-Forwarded-For` / `X-Real-IP`; make
  sure your proxy overwrites them rather than appending client-supplied values.
- **TLS is expected in production.** Put Caddy, Nginx, a cloud load balancer or a
  platform edge in front. HSTS is only emitted when `NEXT_PUBLIC_SITE_URL` is
  HTTPS.
- **Free tiers change.** Provider limits and availability are outside this
  repository; check them before relying on a free instance for a class or demo.
