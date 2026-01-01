import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Section } from "@/components/ui/section";
import { RESUME_DATA } from "@/data/resume-data";

type Certification = (typeof RESUME_DATA)["certifications"][number];

interface CertificationLinkProps {
  name: string;
  link?: {
    label: string;
    href?: string;
  };
}

/**
 * Renders certification name with optional link
 */
function CertificationLink({ name, link }: CertificationLinkProps) {
  if (!link?.href) {
    return <span>{name}</span>;
  }

  return (
    <a
      href={link.href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 hover:underline"
      aria-label={`${name} certificate (opens in new tab)`}
    >
      {name}
      <span className="sr-only">(opens in new tab)</span>
    </a>
  );
}

interface CertificationItemProps {
  certification: Certification;
}

/**
 * Individual certification card component
 */
function CertificationItem({ certification }: CertificationItemProps) {
  const { name, issuer, date, description, link } = certification;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-x-2 text-base">
          <div className="space-y-1 flex-1">
            <h3
              className="font-semibold leading-none"
              id={`certification-${name.toLowerCase().replace(/\s+/g, "-")}`}
            >
              <CertificationLink name={name} link={link} />
            </h3>
            <div className="text-sm text-gray-600 print:text-[11px]">
              {issuer}
            </div>
          </div>
          <div
            className="text-sm tabular-nums text-gray-500 print:text-[11px]"
            aria-label={`Issued: ${date}`}
          >
            {date}
          </div>
        </div>
      </CardHeader>
      {description && (
        <CardContent
          className="mt-2 text-xs text-foreground/70 print:text-[10px]"
          aria-labelledby={`certification-${name
            .toLowerCase()
            .replace(/\s+/g, "-")}`}
        >
          {description}
        </CardContent>
      )}
    </Card>
  );
}

interface CertificationsListProps {
  certifications: readonly Certification[];
}

/**
 * Main certifications section component
 * Renders a list of certifications
 */
export function Certifications({ certifications }: CertificationsListProps) {
  if (!certifications || certifications.length === 0) {
    return null;
  }

  return (
    <Section>
      <h2 className="text-xl font-bold" id="certifications-section">
        Certifications
      </h2>
      <div
        className="space-y-4 print:space-y-2"
        role="feed"
        aria-labelledby="certifications-section"
      >
        {certifications.map((item) => (
          <article key={item.name} role="article">
            <CertificationItem certification={item} />
          </article>
        ))}
      </div>
    </Section>
  );
}

