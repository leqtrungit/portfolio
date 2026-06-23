import { StyleSheet, Text, View } from "@react-pdf/renderer";
import type { ReactNode } from "react";
import { theme } from "../theme.js";

const styles = StyleSheet.create({
  title: {
    fontSize: theme.fontSize.sectionTitle,
    fontWeight: 700,
    marginTop: theme.spacing.sectionTitleMarginTop,
    marginBottom: theme.spacing.sectionTitleMarginBottom,
    borderBottom: `1pt solid ${theme.color.border}`,
  },
});

export interface SectionProps {
  title: string;
  children: ReactNode;
}

export function Section({ title, children }: SectionProps) {
  return (
    <View>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  );
}
