import { SubpageNav, type SubpageNavProps } from "@/components/ui/SubpageNav";
import { getProfile } from "@/lib/profile";
import { getDictionary } from "@/lib/i18n/getDictionary";

export type SubpageHeaderProps = Omit<SubpageNavProps, "name" | "dict">;

export function SubpageHeader(props: SubpageHeaderProps) {
  return (
    <SubpageNav
      {...props}
      name={getProfile(props.locale).basics.name}
      dict={getDictionary(props.locale).nav}
    />
  );
}
