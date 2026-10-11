import Link from "next/link";

export interface NotFoundContentProps {
  homeHref: string;
  title: string;
  body: string;
  homeLabel: string;
}

export function NotFoundContent({ homeHref, title, body, homeLabel }: NotFoundContentProps) {
  return (
    <section className="wrap nf">
      <div className="nf-box">
        <div className="nf-inner">
          <div className="nf-code" aria-hidden="true">
            4<span>0</span>4
          </div>
          <div className="nf-body">
            <div className="kicker" style={{ color: "var(--gold-soft)" }}>
              404
            </div>
            <h1 className="nf-title">
              <span className="hl-red">{title}</span>
            </h1>
            <p className="nf-text">{body}</p>
            <Link href={homeHref} className="cta-link">
              {homeLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
