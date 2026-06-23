import { Document, Page, StyleSheet, Text } from "@react-pdf/renderer";
import type { Profile } from "@new-portfolio/profile-schema";
import { theme } from "../theme.js";
import { Heading } from "../components/Heading.js";
import { Section } from "../components/Section.js";
import { ListItem } from "../components/ListItem.js";

const styles = StyleSheet.create({
  page: {
    padding: theme.spacing.pagePadding,
    fontSize: theme.fontSize.base,
    fontFamily: theme.fontFamily,
  },
});

export function MasterCV({ profile }: { profile: Profile }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Heading name={profile.basics.name} label={profile.basics.label} summary={profile.basics.summary} />

        {profile.work.length > 0 && (
          <Section title="Experience">
            {profile.work.map((job) => (
              <ListItem
                key={`${job.name}-${job.startDate}`}
                title={
                  <>
                    {job.position} — {job.name}
                  </>
                }
                meta={`${job.startDate} – ${job.endDate ?? "Present"}`}
                highlights={job.highlights}
                marginBottom={theme.spacing.itemMarginBottom}
              />
            ))}
          </Section>
        )}

        {profile.projects.length > 0 && (
          <Section title="Projects">
            {profile.projects.map((project) => (
              <ListItem
                key={project.name}
                title={project.name}
                body={project.description}
                marginBottom={theme.spacing.itemMarginBottomSmall}
              />
            ))}
          </Section>
        )}

        {profile.education.length > 0 && (
          <Section title="Education">
            {profile.education.map((edu) => (
              <ListItem
                key={edu.institution}
                title={edu.institution}
                meta={`${edu.studyType} ${edu.area}`}
                marginBottom={theme.spacing.itemMarginBottomSmall}
              />
            ))}
          </Section>
        )}

        {profile.skills.length > 0 && (
          <Section title="Skills">
            <Text>{profile.skills.map((skill) => skill.name).join(", ")}</Text>
          </Section>
        )}
      </Page>
    </Document>
  );
}
