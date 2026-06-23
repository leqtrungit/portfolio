export interface NavLinkProps {
  href: string;
  children: string;
}

export function NavLink({ href, children }: NavLinkProps) {
  return (
    <a href={href} className="navlink" style={{ textDecoration: "none", color: "inherit" }}>
      {children}
    </a>
  );
}
