import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { theme } from "../theme.js";

const styles = StyleSheet.create({
  title: { fontWeight: 700 },
  meta: { color: theme.color.meta, marginBottom: theme.spacing.metaMarginBottom },
  highlight: { marginLeft: theme.spacing.highlightMarginLeft },
});

export interface ListItemProps {
  title: ReactNode;
  meta?: ReactNode;
  body?: ReactNode;
  highlights?: string[];
  marginBottom: number;
}

export function ListItem({ title, meta, body, highlights, marginBottom }: ListItemProps) {
  return (
    <View style={{ marginBottom }}>
      <Text style={styles.title}>{title}</Text>
      {meta && <Text style={styles.meta}>{meta}</Text>}
      {body ? <Text>{body}</Text> : null}
      {highlights?.map((highlight, idx) => (
        <Text key={idx} style={styles.highlight}>
          • {highlight}
        </Text>
      ))}
    </View>
  );
}
