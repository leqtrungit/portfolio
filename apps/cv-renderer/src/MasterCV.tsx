import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import type { Profile } from "@new-portfolio/profile-schema";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, fontFamily: "Helvetica" },
  name: { fontSize: 22, fontWeight: 700 },
  label: { fontSize: 13, color: "#444", marginBottom: 12 },
  sectionTitle: { fontSize: 13, fontWeight: 700, marginTop: 16, marginBottom: 6, borderBottom: "1pt solid #ccc" },
  itemTitle: { fontWeight: 700 },
  itemMeta: { color: "#555", marginBottom: 2 },
  highlight: { marginLeft: 8 },
});

export function MasterCV({ profile }: { profile: Profile }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{profile.basics.name}</Text>
        {profile.basics.label && <Text style={styles.label}>{profile.basics.label}</Text>}
        {profile.basics.summary ? <Text>{profile.basics.summary}</Text> : null}

        {profile.work.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Experience</Text>
            {profile.work.map((job) => (
              <View key={`${job.name}-${job.startDate}`} style={{ marginBottom: 8 }}>
                <Text style={styles.itemTitle}>
                  {job.position} — {job.name}
                </Text>
                <Text style={styles.itemMeta}>
                  {job.startDate} – {job.endDate ?? "Present"}
                </Text>
                {job.highlights.map((highlight, idx) => (
                  <Text key={idx} style={styles.highlight}>
                    • {highlight}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {profile.projects.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Projects</Text>
            {profile.projects.map((project) => (
              <View key={project.name} style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{project.name}</Text>
                {project.description && <Text>{project.description}</Text>}
              </View>
            ))}
          </View>
        )}

        {profile.education.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Education</Text>
            {profile.education.map((edu) => (
              <View key={edu.institution} style={{ marginBottom: 6 }}>
                <Text style={styles.itemTitle}>{edu.institution}</Text>
                <Text style={styles.itemMeta}>
                  {edu.studyType} {edu.area}
                </Text>
              </View>
            ))}
          </View>
        )}

        {profile.skills.length > 0 && (
          <View>
            <Text style={styles.sectionTitle}>Skills</Text>
            <Text>{profile.skills.map((skill) => skill.name).join(", ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}
