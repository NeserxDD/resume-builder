import {
  Document,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { getTemplateMeta } from "@/lib/templates/registry";
import { getVisibleSections } from "@/lib/templates/sections";
import { normalizeExternalUrl } from "@/lib/resume/schema";
import type { ResumeContentInput } from "@/lib/resume/schema";
import type { SectionKey, TemplateMeta } from "@/lib/resume/types";

const styles = StyleSheet.create({
  page: {
    padding: 48,
    color: "#252622",
    fontFamily: "Helvetica",
    fontSize: 9,
    lineHeight: 1.45,
  },
  pageModern: { borderTopWidth: 7, borderTopColor: "#e65d35" },
  pageMinimalist: { paddingTop: 58 },
  header: { borderBottomWidth: 1, borderBottomColor: "#9d9d95", paddingBottom: 14, marginBottom: 18 },
  headerAts: { textAlign: "center" },
  headerModern: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerMinimalist: { borderBottomWidth: 0 },
  name: { fontSize: 27, fontWeight: 700, lineHeight: 1 },
  nameAts: { fontSize: 24 },
  nameMinimalist: { fontSize: 34 },
  headline: { marginTop: 6, color: "#6f7069", fontSize: 10 },
  contact: { marginTop: 6, color: "#6f7069", fontSize: 7.5 },
  contactModern: { width: 150, textAlign: "right", lineHeight: 1.5 },
  section: { marginBottom: 15 },
  sectionHeading: { marginBottom: 7, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: "#9d9d95", color: "#373832", fontSize: 7.5, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase" },
  sectionHeadingModern: { borderBottomWidth: 0, color: "#e65d35" },
  sectionHeadingMinimalist: { borderBottomWidth: 0, color: "#6f7069" },
  summary: { color: "#4d4e48", fontSize: 8.5, lineHeight: 1.55 },
  entry: { marginBottom: 10 },
  entryHeading: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  entryTitle: { fontSize: 9, fontWeight: 700 },
  entryMeta: { color: "#777871", fontSize: 7.5 },
  entryDate: { color: "#777871", fontSize: 7, textAlign: "right" },
  bullets: { marginTop: 4, paddingLeft: 10, color: "#4d4e48", fontSize: 8, lineHeight: 1.45 },
  bulletModern: { paddingLeft: 0 },
  skillWrap: { flexDirection: "row", flexWrap: "wrap", gap: 5 },
  skill: { borderWidth: 1, borderColor: "#c8c8c0", padding: "4 5", color: "#4d4e48", fontSize: 7.5 },
});

type Variant = "ats" | "modern" | "minimalist";

function Header({ content, variant }: { content: ResumeContentInput; variant: Variant }) {
  const { personalInfo } = content;
  const contact = [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean).join("  /  ");
  return (
    <View style={[styles.header, variant === "ats" ? styles.headerAts : undefined, variant === "modern" ? styles.headerModern : undefined, variant === "minimalist" ? styles.headerMinimalist : undefined]}>
      <View>
        {variant === "modern" ? <Text style={{ color: "#e65d35", fontSize: 7, letterSpacing: 1 }}>RESUME / 2026</Text> : null}
        <Text style={[styles.name, variant === "ats" ? styles.nameAts : undefined, variant === "minimalist" ? styles.nameMinimalist : undefined]}>{personalInfo.fullName || "Your Name"}</Text>
        {personalInfo.headline ? <Text style={styles.headline}>{personalInfo.headline}</Text> : null}
      </View>
      {contact ? <Text style={[styles.contact, variant === "modern" ? styles.contactModern : undefined]}>{contact}</Text> : null}
    </View>
  );
}

function EntryHeading({ title, meta, date }: { title: string; meta?: string; date?: string }) {
  return <View style={styles.entryHeading}><View><Text style={styles.entryTitle}>{title}</Text>{meta ? <Text style={styles.entryMeta}>{meta}</Text> : null}</View>{date ? <Text style={styles.entryDate}>{date}</Text> : null}</View>;
}

function PdfSection({ section, content, variant }: { section: SectionKey; content: ResumeContentInput; variant: Variant }) {
  const headingStyle = [styles.sectionHeading, variant === "modern" ? styles.sectionHeadingModern : undefined, variant === "minimalist" ? styles.sectionHeadingMinimalist : undefined];
  let body = null;

  if (section === "summary") body = <Text style={styles.summary}>{content.summary}</Text>;
  if (section === "experience") body = <View>{content.experience.filter((entry) => entry.company || entry.role || entry.bullets.some(Boolean)).map((entry) => <View style={styles.entry} key={entry.id}><EntryHeading title={entry.role || "Role"} meta={[entry.company, entry.location].filter(Boolean).join(", ")} date={[entry.startDate, entry.current ? "Present" : entry.endDate].filter(Boolean).join(" — ")} />{entry.bullets.filter(Boolean).length ? <View style={[styles.bullets, variant === "modern" ? styles.bulletModern : undefined]}>{entry.bullets.filter(Boolean).map((bullet, index) => <Text key={`${entry.id}-${index}`}>{variant === "modern" ? "— " : "• "}{bullet}</Text>)}</View> : null}</View>)}</View>;
  if (section === "education") body = <View>{content.education.filter((entry) => entry.school || entry.degree || entry.field || entry.cgpa).map((entry) => <View style={styles.entry} key={entry.id}><EntryHeading title={[entry.degree, entry.field].filter(Boolean).join(", ") || "Education"} meta={[entry.school, entry.location, entry.cgpa ? `CGPA ${entry.cgpa}` : ""].filter(Boolean).join(", ")} date={entry.endDate || entry.startDate} /></View>)}</View>;
  if (section === "skills") body = <View style={styles.skillWrap}>{content.skills.filter(Boolean).map((skill) => <Text style={styles.skill} key={skill}>{skill}</Text>)}</View>;
  if (section === "projects") body = <View>{content.projects.filter((entry) => entry.name || entry.description).map((project) => <View style={styles.entry} key={project.id}><View style={styles.entryHeading}><View>{project.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(project.url)}>{project.name}</Link> : <Text style={styles.entryTitle}>{project.name}</Text>}{project.technologies.filter(Boolean).length ? <Text style={styles.entryMeta}>{project.technologies.filter(Boolean).join(" · ")}</Text> : null}</View>{project.liveUrl ? <Link style={styles.entryDate} src={normalizeExternalUrl(project.liveUrl)}>Live site</Link> : null}</View>{project.description ? <Text style={styles.summary}>{project.description}</Text> : null}</View>)}</View>;
  if (section === "certifications") body = <View>{content.certifications.filter((entry) => entry.name || entry.issuer).map((certification) => <View style={styles.entry} key={certification.id}><View style={styles.entryHeading}><View>{certification.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(certification.url)}>{certification.name}</Link> : <Text style={styles.entryTitle}>{certification.name}</Text>}<Text style={styles.entryMeta}>{certification.issuer}</Text></View>{certification.date ? <Text style={styles.entryDate}>{certification.date}</Text> : null}</View></View>)}</View>;

  return <View style={styles.section}><Text style={headingStyle}>{section}</Text>{body}</View>;
}

export function ResumePdfDocument({ content, templateId }: { content: ResumeContentInput; templateId: string }) {
  const meta: TemplateMeta = getTemplateMeta(templateId);
  const variant = meta.id as Variant;
  return <Document title={`${content.personalInfo.fullName || "Resume"} - ${meta.name}`}><Page size="A4" style={[styles.page, variant === "modern" ? styles.pageModern : undefined, variant === "minimalist" ? styles.pageMinimalist : undefined]}><Header content={content} variant={variant} />{getVisibleSections(meta, content).map((section) => <PdfSection key={section} section={section} content={content} variant={variant} />)}</Page></Document>;
}
