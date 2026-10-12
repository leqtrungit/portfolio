import Image from "next/image";

export interface PortraitProps {
  src: string;
  alt: string;
}

/** Portrait photo with the offset gold hairline frame. */
export function Portrait({ src, alt }: PortraitProps) {
  return (
    <div className="portrait">
      <div className="portrait-frame">
        <Image src={src} alt={alt} fill priority fetchPriority="high" sizes="(max-width: 860px) 360px, 300px" />
      </div>
    </div>
  );
}
