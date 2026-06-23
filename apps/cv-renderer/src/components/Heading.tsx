import { StyleSheet, Text } from "@react-pdf/renderer";
import { theme } from "../theme.js";

const styles = StyleSheet.create({
  name: { fontSize: theme.fontSize.name, fontWeight: 700 },
  label: {
    fontSize: theme.fontSize.label,
    color: theme.color.label,
    marginBottom: theme.spacing.labelMarginBottom,
  },
});

export interface HeadingProps {
  name: string;
  label?: string;
  summary?: string;
}

export function Heading({ name, label, summary }: HeadingProps) {
  return (
    <>
      <Text style={styles.name}>{name}</Text>
      {label && <Text style={styles.label}>{label}</Text>}
      {summary ? <Text>{summary}</Text> : null}
    </>
  );
}
