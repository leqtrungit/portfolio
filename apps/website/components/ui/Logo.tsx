export interface LogoProps {
  size?: number;
}

/**
 * "LT" mark — a static image (apps/website/public/logo.svg) so the exact
 * same artwork is reused as the favicon (apps/website/app/icon.svg), not
 * just drawn inline for the header.
 */
export function Logo({ size = 36 }: LogoProps) {
  return <img src="/logo.svg" width={size} height={size} alt="Lê Quốc Trung logo" style={{ display: "block" }} />;
}
