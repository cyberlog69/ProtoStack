import assert from 'node:assert/strict';
import test from 'node:test';
import {
  DEFAULT_ALLOWED_TARGET_HOSTS,
  getAllowedTargetHosts,
  validateOutboundUrl,
} from '../src/lib/url-safety.ts';

const allowed = new Set(DEFAULT_ALLOWED_TARGET_HOSTS);

async function expectRejection(url: string, message: RegExp) {
  await assert.rejects(() => validateOutboundUrl(url, allowed), message);
}

test('rejects non-HTTP schemes', async () => {
  await expectRejection('ftp://example.com/file', /HTTP and HTTPS/i);
  await expectRejection('file:///etc/passwd', /HTTP and HTTPS/i);
  await expectRejection('javascript:alert(1)', /Invalid URL|HTTP and HTTPS/i);
});

test('rejects embedded credentials', async () => {
  await expectRejection('https://user:pass@example.com/', /credentials/i);
});

test('rejects non-standard ports', async () => {
  await expectRejection('https://example.com:8443/', /ports 80 and 443/i);
});

test('rejects localhost and single-label hosts', async () => {
  await expectRejection('http://localhost/', /Local and single-label/i);
  await expectRejection('http://intranet/', /Local and single-label/i);
  await expectRejection('http://printer.local/', /Local and single-label/i);
  await expectRejection('http://metadata.internal/', /Local and single-label/i);
});

test('rejects loopback, private, link-local, and metadata IPs', async () => {
  await expectRejection('http://127.0.0.1/', /private or reserved/i);
  await expectRejection('http://127.1/', /private or reserved/i);
  await expectRejection('http://10.0.0.8/', /private or reserved/i);
  await expectRejection('http://172.16.4.2/', /private or reserved/i);
  await expectRejection('http://192.168.1.1/', /private or reserved/i);
  await expectRejection('http://169.254.169.254/latest/meta-data/', /private or reserved/i);
  await expectRejection('http://100.64.0.1/', /private or reserved/i);
  await expectRejection('http://[::1]/', /private or reserved/i);
  await expectRejection('http://[fe80::1]/', /private or reserved/i);
});

test('rejects encoded and alternative IPv4 notations', async () => {
  await expectRejection('http://2130706433/', /private or reserved/i);
  await expectRejection('http://0x7f000001/', /private or reserved/i);
  await expectRejection('http://0177.0.0.1/', /private or reserved/i);
});

test('rejects hosts outside the allowlist before DNS resolution', async () => {
  await expectRejection('https://not-on-the-list.example.org/', /not on the allowlist/i);
});

test('allowlist can be overridden by HTTP_TEST_ALLOWED_HOSTS', () => {
  const previous = process.env.HTTP_TEST_ALLOWED_HOSTS;
  process.env.HTTP_TEST_ALLOWED_HOSTS = ' Example.COM , api.example.net ';
  try {
    const hosts = getAllowedTargetHosts();
    assert.deepEqual([...hosts].sort(), ['api.example.net', 'example.com']);
  } finally {
    if (previous === undefined) delete process.env.HTTP_TEST_ALLOWED_HOSTS;
    else process.env.HTTP_TEST_ALLOWED_HOSTS = previous;
  }
});
