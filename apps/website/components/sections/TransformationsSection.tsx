import { SectionHeading } from "@/components/ui/SectionHeading";
import type { Dictionary } from "@/lib/i18n/getDictionary";

export interface TransformationsSectionProps {
  dict: Dictionary["transformations"];
}

type Item = Dictionary["transformations"]["items"][number];

// Fishbone (Ishikawa) layout from the design, in px within the 1166×620 diagram.
// Items 0/2 hang above the spine, 1/3 below it.
const BONES = [
  { dir: "up", bone: 300, cause: 95, tag: { left: 210, top: 322 } },
  { dir: "down", bone: 500, cause: 295, tag: { left: 410, top: 265 } },
  { dir: "up", bone: 700, cause: 495, tag: { left: 610, top: 322 } },
  { dir: "down", bone: 860, cause: 655, tag: { left: 755, top: 265 } },
] as const;

function Cause({ item }: { item: Item }) {
  return (
    <>
      <span className="tf-from">{item.from}</span>
      <span className="tf-arrow" aria-hidden="true" />
      <span className="tf-to">{item.to}</span>
    </>
  );
}

export function TransformationsSection({ dict }: TransformationsSectionProps) {
  const items = dict.items.slice(0, BONES.length);

  return (
    <section className="tf-band">
      <div className="wrap tf-frame" style={{ paddingLeft: 16, paddingRight: 16 }}>
        <div className="tf-box">
          <SectionHeading number="02" tone="dark">
            {dict.label}
          </SectionHeading>

          {/* Desktop: fishbone diagram (decorative layout of the list below). */}
          <div className="fish" aria-hidden="true">
            <div className="fish-spine" />
            {items.map((item, i) => {
              const b = BONES[i];
              return (
                <div key={item.tag}>
                  <div className={`fish-bone ${b.dir}`} style={{ left: b.bone }} />
                  <div className={`fish-cause ${b.dir}`} style={{ left: b.cause }}>
                    <Cause item={item} />
                  </div>
                  <div className="fish-tag" style={b.tag}>
                    <span className="tf-tag">{item.tag}</span>
                  </div>
                </div>
              );
            })}
            <div className="fish-effect">
              <span className="effect-label">{dict.effectLabel}</span>
              <span className="effect-text">{dict.effectText}</span>
            </div>
          </div>

          {/* Narrow screens (and screen readers): the same content as a list. */}
          <ul className="tf-list" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {items.map((item) => (
              <li key={item.tag} className="tf-item">
                <span className="tf-tag">{item.tag}</span>
                <Cause item={item} />
              </li>
            ))}
            <li className="tf-effect">
              <span className="effect-label">{dict.effectLabel}</span>
              <span className="effect-text">{dict.effectText}</span>
            </li>
          </ul>
        </div>
      </div>
    </section>
  );
}
