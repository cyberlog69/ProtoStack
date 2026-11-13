const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

export const SITE_URL = (rawSiteUrl || 'http://localhost:3000').replace(/\/+$/, '');
export const SITE_NAME = 'ProtoStack';
export const SITE_DESCRIPTION =
  'Explore 52 computer networking, internet, and IoT protocols through step-by-step packet animations, honest simulations, and interactive request benches.';

export function absoluteUrl(path = '/'): string {
  return new URL(path, `${SITE_URL}/`).toString();
}
