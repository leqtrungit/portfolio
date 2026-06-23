/**
 * Single source of style values for cv-renderer templates. When a new
 * reference design (e.g. the Python-script layout) needs to be matched,
 * update these values rather than hardcoding styles in components/templates.
 */
export const theme = {
  fontFamily: "Helvetica",
  fontSize: {
    base: 11,
    name: 22,
    label: 13,
    sectionTitle: 13,
  },
  color: {
    label: "#444",
    meta: "#555",
    border: "#ccc",
  },
  spacing: {
    pagePadding: 40,
    labelMarginBottom: 12,
    sectionTitleMarginTop: 16,
    sectionTitleMarginBottom: 6,
    itemMarginBottom: 8,
    itemMarginBottomSmall: 6,
    metaMarginBottom: 2,
    highlightMarginLeft: 8,
  },
} as const;
