import {
  Document,
  Image,
  Link,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

import { getTemplateMeta } from "@/lib/templates/registry";
import { getVisibleSections, selectedEntryIds } from "@/lib/templates/sections";
import { normalizeExternalUrl } from "@/lib/resume/schema";
import { highlightMarker } from "@/lib/resume/highlights";
import type { ResumeContentInput, ResumeSelectionInput } from "@/lib/resume/schema";
import { SECTION_LABELS } from "@/lib/resume/types";
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
  pageHarvard: { padding: "44 44 24 44" },
  header: { borderBottomWidth: 1, borderBottomColor: "#9d9d95", paddingBottom: 14, marginBottom: 18 },
  headerAts: { textAlign: "center" },
  headerModern: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end" },
  headerMinimalist: { borderBottomWidth: 0 },
  headerHarvard: { textAlign: "center", borderBottomWidth: 0 },
  harvardRule: { borderTopWidth: 1, borderTopColor: "#252622", marginVertical: 7 },
  name: { fontSize: 27, fontWeight: 700, lineHeight: 1 },
  nameAts: { fontSize: 24 },
  nameMinimalist: { fontSize: 34 },
  nameHarvard: { fontSize: 22, letterSpacing: 0.4 },
  headline: { marginTop: 6, color: "#6f7069", fontSize: 10 },
  contact: { marginTop: 6, color: "#6f7069", fontSize: 7.5 },
  contactModern: { width: 150, textAlign: "right", lineHeight: 1.5 },
  contactHarvard: { marginTop: 7, color: "#252622", fontSize: 7.5 },
  section: { marginBottom: 15 },
  sectionHeading: { marginBottom: 7, paddingBottom: 3, borderBottomWidth: 1, borderBottomColor: "#9d9d95", color: "#373832", fontSize: 7.5, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase" },
  sectionHeadingModern: { borderBottomWidth: 0, color: "#e65d35" },
  sectionHeadingMinimalist: { borderBottomWidth: 0, color: "#6f7069" },
  sectionHeadingHarvard: { textAlign: "center", borderBottomWidth: 0, color: "#252622", fontSize: 8, letterSpacing: 1.4, marginBottom: 9 },
  summary: { color: "#4d4e48", fontSize: 8.5, lineHeight: 1.55 },
  entry: { marginBottom: 10 },
  entryHeading: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  entryTitle: { fontSize: 9, fontWeight: 700 },
  entryMeta: { color: "#777871", fontSize: 7.5 },
  entryDate: { color: "#777871", fontSize: 7, textAlign: "right" },
  entryNote: { marginTop: 2, color: "#4d4e48", fontSize: 8 },
  bullets: { marginTop: 4, paddingLeft: 10, color: "#4d4e48", fontSize: 8, lineHeight: 1.45 },
  bulletModern: { paddingLeft: 0 },
  skillWrap: { flexDirection: "row", flexWrap: "wrap", alignItems: "flex-start", gap: 5 },
  skill: { maxWidth: "100%", borderWidth: 1, borderColor: "#c8c8c0", padding: "3 5", color: "#4d4e48", fontSize: 7.5, lineHeight: 1.2 },
  skillGroup: { marginBottom: 4, color: "#4d4e48", fontSize: 8 },
  // Harvard-specific entry styles
  harvardEntryTitle: { fontSize: 9.5, fontWeight: 700 },
  harvardEntryMeta: { fontSize: 8.5, fontWeight: 700 },
  harvardEntryDate: { fontSize: 8.5, color: "#252622", textAlign: "right" },
  harvardRole: { fontSize: 8.5, fontStyle: "italic", color: "#252622" },
  // Classic Tech / Awesome CV / Two-Column styles
  headerClassicTech: { textAlign: "center" },
  nameClassicTech: { fontSize: 24, fontFamily: "Times-Bold" },
  headerAwesomeCv: { flexDirection: "row", alignItems: "center", gap: 14, borderBottomWidth: 0 },
  awesomeCvText: { flexGrow: 1, alignItems: "flex-end" },
  nameAwesomeCv: { fontSize: 26, textAlign: "right" },
  contactAwesomeCv: { marginTop: 5, color: "#6f7069", fontSize: 7.5 },
  photoAwesomeCv: { width: 64, height: 64, borderRadius: 32 },
  headlineAccent: { marginTop: 4, color: "#e65d35", fontSize: 10, fontWeight: 700 },
  sectionHeadingAwesomeCv: { borderBottomWidth: 1, borderBottomColor: "#dcdcd4", color: "#e65d35", letterSpacing: 1.2 },
  twoColWrap: { flexDirection: "row", gap: 18 },
  twoColMain: { flexGrow: 1, flexBasis: "62%", minWidth: 0 },
  twoColSide: { flexBasis: "34%", paddingTop: 4 },
  sidePhoto: { width: 96, height: 96, borderRadius: 48, marginBottom: 10 },
  sideHeading: { marginTop: 12, marginBottom: 5, color: "#373832", fontSize: 7.5, fontWeight: 700, letterSpacing: 1.1, textTransform: "uppercase" },
  sideText: { marginBottom: 3, color: "#4d4e48", fontSize: 7.5, lineHeight: 1.4 },
});

type Variant = "ats" | "modern" | "minimalist" | "harvard" | "classic-tech" | "awesome-cv" | "two-column";

function contactValues(variant: Variant, personalInfo: ResumeContentInput["personalInfo"]) {
  if (variant === "harvard") {
    return [personalInfo.address, personalInfo.location, personalInfo.email, personalInfo.phone].filter(Boolean).join("  •  ");
  }
  if (variant === "classic-tech") {
    return [personalInfo.website, personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean).join("  |  ");
  }
  return [personalInfo.email, personalInfo.phone, personalInfo.location, personalInfo.website].filter(Boolean).join("  /  ");
}
function Header({ content, variant, photoUrl }: { content: ResumeContentInput; variant: Variant; photoUrl?: string }) {
  const { personalInfo } = content;
  const contact = contactValues(variant, personalInfo);

  if (variant === "awesome-cv") {
    return (
      <View style={[styles.header, styles.headerAwesomeCv]}>
        <View style={styles.awesomeCvText}>
          <Text style={[styles.name, styles.nameAwesomeCv]}>{personalInfo.fullName || "Your Name"}</Text>
          {personalInfo.headline ? <Text style={styles.headlineAccent}>{personalInfo.headline}</Text> : null}
          {contact ? <Text style={styles.contactAwesomeCv}>{contact}</Text> : null}
        </View>
        {photoUrl ? (
          /* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/Image has no alt prop */
          <Image style={styles.photoAwesomeCv} src={photoUrl} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={[styles.header, variant === "ats" || variant === "classic-tech" ? styles.headerAts : undefined, variant === "classic-tech" ? styles.headerClassicTech : undefined, variant === "modern" ? styles.headerModern : undefined, variant === "minimalist" ? styles.headerMinimalist : undefined, variant === "harvard" ? styles.headerHarvard : undefined]}>
      <View>
        {variant === "modern" ? <Text style={{ color: "#e65d35", fontSize: 7, letterSpacing: 1 }}>RESUME / 2026</Text> : null}
        <Text style={[styles.name, variant === "ats" ? styles.nameAts : undefined, variant === "minimalist" ? styles.nameMinimalist : undefined, variant === "harvard" ? styles.nameHarvard : undefined, variant === "classic-tech" ? styles.nameClassicTech : undefined]}>{personalInfo.fullName || "Your Name"}</Text>
        {variant !== "harvard" && personalInfo.headline ? <Text style={variant === "two-column" ? styles.headlineAccent : styles.headline}>{personalInfo.headline}</Text> : null}
      </View>
      {variant === "harvard" ? <View style={styles.harvardRule} /> : null}
      {contact ? <Text style={[styles.contact, variant === "modern" ? styles.contactModern : undefined, variant === "harvard" ? styles.contactHarvard : undefined]}>{contact}</Text> : null}
    </View>
  );
}

function EntryHeading({ title, meta, date, variant }: { title: string; meta?: string; date?: string; variant: Variant }) {
  const harvard = variant === "harvard";
  return <View style={styles.entryHeading}><View><Text style={harvard ? styles.harvardEntryTitle : styles.entryTitle}>{title}</Text>{meta ? <Text style={harvard ? styles.harvardEntryMeta : styles.entryMeta}>{meta}</Text> : null}</View>{date ? <Text style={harvard ? styles.harvardEntryDate : styles.entryDate}>{date}</Text> : null}</View>;
}

function HarvardRoleLine({ role, date }: { role: string; date?: string }) {
  return <View style={{ flexDirection: "row", justifyContent: "space-between" }}><Text style={styles.harvardRole}>{role}</Text>{date ? <Text style={styles.harvardRole}>{date}</Text> : null}</View>;
}

function HarvardEducationEntry({ entry }: { entry: ResumeContentInput["education"][number] }) {
  const study = entry.studyAbroad;
  const hs = entry.highSchool;
  const degreeLine = [entry.degree, entry.field].filter(Boolean).join(", ");
  return (
    <View style={styles.entry}>
      <View style={styles.entryHeading}>
        <Text style={styles.harvardEntryTitle}>{entry.school || "School"}</Text>
        {entry.location ? <Text style={styles.harvardEntryDate}>{entry.location}</Text> : null}
      </View>
      <View style={styles.entryHeading}>
        <Text style={styles.harvardRole}>{degreeLine || "Degree"}{entry.cgpa ? `, CGPA ${entry.cgpa}` : ""}</Text>
        {entry.endDate || entry.startDate ? <Text style={styles.harvardEntryDate}>{entry.endDate || entry.startDate}</Text> : null}
      </View>
      {entry.thesis ? <Text style={styles.entryNote}><Text style={{ fontStyle: "italic" }}>Thesis:</Text> {entry.thesis}</Text> : null}
      {entry.coursework ? <Text style={styles.entryNote}><Text style={{ fontStyle: "italic" }}>Relevant Coursework:</Text> {entry.coursework}</Text> : null}
      {study && (study.program || study.location || study.details || study.startDate || study.endDate) ? (
        <View>
          <View style={styles.entryHeading}>
            <Text style={styles.harvardRole}><Text style={{ fontStyle: "italic" }}>Study Abroad</Text></Text>
            {study.location ? <Text style={styles.harvardEntryDate}>{study.location}</Text> : null}
          </View>
          <View style={styles.entryHeading}>
            <Text style={styles.entryMeta}>{[study.program, study.details].filter(Boolean).join(" — ")}</Text>
            {study.startDate || study.endDate ? <Text style={styles.harvardEntryDate}>{[study.startDate, study.endDate].filter(Boolean).join(" – ")}</Text> : null}
          </View>
        </View>
      ) : null}
      {hs && (hs.name || hs.location || hs.details || hs.graduationDate) ? (
        <View>
          <View style={styles.entryHeading}>
            <Text style={styles.harvardRole}>{hs.name}</Text>
            {hs.location ? <Text style={styles.harvardEntryDate}>{hs.location}</Text> : null}
          </View>
          <View style={styles.entryHeading}>
            <Text style={styles.entryMeta}>{hs.details}</Text>
            {hs.graduationDate ? <Text style={styles.harvardEntryDate}>Graduation: {hs.graduationDate}</Text> : null}
          </View>
        </View>
      ) : null}
    </View>
  );
}

function PdfSection({ section, content, variant, selection }: { section: SectionKey; content: ResumeContentInput; variant: Variant; selection?: ResumeSelectionInput }) {
  const headingStyle = [styles.sectionHeading, variant === "modern" ? styles.sectionHeadingModern : undefined, variant === "minimalist" ? styles.sectionHeadingMinimalist : undefined, variant === "harvard" ? styles.sectionHeadingHarvard : undefined, variant === "awesome-cv" ? styles.sectionHeadingAwesomeCv : undefined];
  const marker = highlightMarker(variant, selection);
  let body = null;

  if (section === "summary") body = <Text style={styles.summary}>{content.summary}</Text>;

  if (section === "experience") {
    const ids = selectedEntryIds("experience", selection, content.experience.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.experience.filter((entry) => allowed.has(entry.id) && (entry.company || entry.role || entry.bullets.some(Boolean))).map((entry) => <View style={styles.entry} key={entry.id}>{variant === "harvard" ? <View><EntryHeading title={entry.company || "Company"} meta={entry.location} date={undefined} variant={variant} /><HarvardRoleLine role={entry.role || "Role"} date={[entry.startDate, entry.current ? "Present" : entry.endDate].filter(Boolean).join(" — ")} /></View> : <EntryHeading title={entry.role || "Role"} meta={entry.company} date={[[entry.startDate, entry.current ? "Present" : entry.endDate].filter(Boolean).join(" — "), entry.location].filter(Boolean).join("\n")} variant={variant} />}{entry.bullets.filter(Boolean).length ? <View style={[styles.bullets, variant === "modern" ? styles.bulletModern : undefined]}>{entry.bullets.filter(Boolean).map((bullet, index) => <Text key={`${entry.id}-${index}`}>{marker}{bullet}</Text>)}</View> : null}</View>)}</View>;
  }

  if (section === "education") {
    const ids = selectedEntryIds("education", selection, content.education.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.education.filter((entry) => allowed.has(entry.id) && (entry.school || entry.degree || entry.field || entry.cgpa)).map((entry) => variant === "harvard" ? <HarvardEducationEntry entry={entry} key={entry.id} /> : <View style={styles.entry} key={entry.id}><EntryHeading title={entry.school || "Education"} meta={[entry.degree, entry.field].filter(Boolean).join(", ")} date={[entry.endDate || entry.startDate, entry.location].filter(Boolean).join("\n")} variant={variant} />{entry.cgpa ? <Text style={styles.entryNote}>CGPA {entry.cgpa}</Text> : null}{entry.thesis ? <Text style={styles.entryNote}><Text style={{ fontStyle: "italic" }}>Thesis:</Text> {entry.thesis}</Text> : null}{entry.coursework ? <Text style={styles.entryNote}><Text style={{ fontStyle: "italic" }}>Relevant Coursework:</Text> {entry.coursework}</Text> : null}</View>)}</View>;
  }

  if (section === "skills") {
    const hasGroups = content.skillGroups.some((group) => group.skills.some(Boolean));
    if (variant === "harvard" && hasGroups) {
      body = <View>{content.skillGroups.filter((group) => group.skills.some(Boolean)).map((group) => <Text style={styles.skillGroup} key={group.id}><Text style={{ fontWeight: 700 }}>{group.name}:</Text> {group.skills.filter(Boolean).join(", ")}</Text>)}</View>;
    } else {
      body = <View style={styles.skillWrap}>{content.skills.filter(Boolean).map((skill) => <Text style={styles.skill} key={skill}>{skill}</Text>)}</View>;
    }
  }

  if (section === "projects") {
    const ids = selectedEntryIds("projects", selection, content.projects.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.projects.filter((entry) => allowed.has(entry.id) && (entry.name || entry.description)).map((project) => <View style={styles.entry} key={project.id}><View style={styles.entryHeading}><View>{project.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(project.url)}>{project.name}</Link> : <Text style={styles.entryTitle}>{project.name}</Text>}{project.technologies.filter(Boolean).length ? <Text style={styles.entryMeta}>{project.technologies.filter(Boolean).join(" · ")}</Text> : null}</View>{project.liveUrl ? <Link style={styles.entryDate} src={normalizeExternalUrl(project.liveUrl)}>Live site</Link> : null}</View>{project.description ? <Text style={styles.summary}>{project.description}</Text> : null}</View>)}</View>;
  }

  if (section === "certifications") {
    const ids = selectedEntryIds("certifications", selection, content.certifications.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.certifications.filter((entry) => allowed.has(entry.id) && (entry.name || entry.issuer)).map((certification) => <View style={styles.entry} key={certification.id}><View style={styles.entryHeading}><View>{certification.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(certification.url)}>{certification.name}</Link> : <Text style={styles.entryTitle}>{certification.name}</Text>}<Text style={styles.entryMeta}>{certification.issuer}</Text></View>{certification.date ? <Text style={styles.entryDate}>{certification.date}</Text> : null}</View></View>)}</View>;
  }

  if (section === "leadership") {
    const ids = selectedEntryIds("leadership", selection, content.leadership.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.leadership.filter((entry) => allowed.has(entry.id) && (entry.role || entry.organization || entry.bullets.some(Boolean))).map((entry) => <View style={styles.entry} key={entry.id}><EntryHeading title={entry.organization || "Organization"} meta={[entry.role, entry.location].filter(Boolean).join(", ")} date={[entry.startDate, entry.current ? "Present" : entry.endDate].filter(Boolean).join(" — ")} variant={variant} />{entry.bullets.filter(Boolean).length ? <View style={styles.bullets}>{entry.bullets.filter(Boolean).map((bullet, index) => <Text key={`${entry.id}-${index}`}>{marker}{bullet}</Text>)}</View> : null}</View>)}</View>;
  }

  if (section === "publications") {
    const ids = selectedEntryIds("publications", selection, content.publications.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.publications.filter((entry) => allowed.has(entry.id) && (entry.title || entry.venue)).map((entry) => <View style={styles.entry} key={entry.id}><View style={styles.entryHeading}><View>{entry.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(entry.url)}>{entry.title}</Link> : <Text style={styles.entryTitle}>{entry.title}</Text>}{entry.venue || entry.authors ? <Text style={styles.entryMeta}>{[entry.venue, entry.authors].filter(Boolean).join(" · ")}</Text> : null}</View>{entry.year ? <Text style={styles.entryDate}>{entry.year}</Text> : null}</View></View>)}</View>;
  }

  if (section === "research") {
    const ids = selectedEntryIds("research", selection, content.research.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.research.filter((entry) => allowed.has(entry.id) && (entry.title || entry.organization || entry.bullets.some(Boolean))).map((entry) => <View style={styles.entry} key={entry.id}><EntryHeading title={entry.title || "Research"} meta={[entry.organization, entry.location].filter(Boolean).join(", ")} date={[entry.startDate, entry.endDate].filter(Boolean).join(" — ")} variant={variant} />{entry.bullets.filter(Boolean).length ? <View style={styles.bullets}>{entry.bullets.filter(Boolean).map((bullet, index) => <Text key={`${entry.id}-${index}`}>{marker}{bullet}</Text>)}</View> : null}</View>)}</View>;
  }

  if (section === "teaching") {
    const ids = selectedEntryIds("teaching", selection, content.teaching.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.teaching.filter((entry) => allowed.has(entry.id) && (entry.course || entry.institution)).map((entry) => <View style={styles.entry} key={entry.id}><EntryHeading title={entry.course || "Course"} meta={[entry.institution, entry.location].filter(Boolean).join(", ")} date={[entry.startDate, entry.endDate].filter(Boolean).join(" — ")} variant={variant} />{entry.description ? <Text style={styles.summary}>{entry.description}</Text> : null}</View>)}</View>;
  }

  if (section === "awards") {
    const ids = selectedEntryIds("awards", selection, content.awards.map((entry) => entry.id));
    const allowed = new Set(ids);
    body = <View>{content.awards.filter((entry) => allowed.has(entry.id) && (entry.title || entry.issuer)).map((award) => <View style={styles.entry} key={award.id}><View style={styles.entryHeading}><View>{award.url ? <Link style={styles.entryTitle} src={normalizeExternalUrl(award.url)}>{award.title}</Link> : <Text style={styles.entryTitle}>{award.title}</Text>}{award.issuer ? <Text style={styles.entryMeta}>{award.issuer}</Text> : null}</View>{award.year ? <Text style={styles.entryDate}>{award.year}</Text> : null}</View>{award.description ? <Text style={styles.summary}>{award.description}</Text> : null}</View>)}</View>;
  }

  return <View style={styles.section}><Text style={headingStyle}>{variant === "harvard" && section === "skills" ? "Skills & Interests" : SECTION_LABELS[section]}</Text>{body}</View>;
}

function TwoColumnSidebar({ content, visibleSections, photoUrl }: { content: ResumeContentInput; visibleSections: SectionKey[]; photoUrl?: string }) {
  const { personalInfo } = content;
  const contacts = [personalInfo.email, personalInfo.phone, personalInfo.location].filter(Boolean);
  const links = [personalInfo.website, personalInfo.linkedin].filter(Boolean);
  const showSkills = visibleSections.includes("skills");
  return (
    <View style={styles.twoColSide}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/Image has no alt prop */}
      {photoUrl ? <Image style={styles.sidePhoto} src={photoUrl} /> : null}
      <Text style={styles.sideHeading}>Contact</Text>
      {contacts.map((value) => <Text key={value} style={styles.sideText}>{value}</Text>)}
      {links.length ? (
        <View>
          <Text style={styles.sideHeading}>Links</Text>
          {links.map((value) => <Text key={value} style={styles.sideText}>{value}</Text>)}
        </View>
      ) : null}
      {showSkills ? (
        <View>
          <Text style={styles.sideHeading}>Skills</Text>
          <View style={styles.skillWrap}>{content.skills.filter(Boolean).map((skill) => <Text key={skill} style={styles.skill}>{skill}</Text>)}</View>
        </View>
      ) : null}
    </View>
  );
}

export function ResumePdfDocument({ content, templateId, selection, photoUrl }: { content: ResumeContentInput; templateId: string; selection?: ResumeSelectionInput; photoUrl?: string }) {
  const meta: TemplateMeta = getTemplateMeta(templateId);
  const variant = meta.id as Variant;

  if (variant === "two-column") {
    const visible = getVisibleSections(meta, content, selection);
    const mainSections = visible.filter((section) => section !== "skills");
    return (
      <Document title={`${content.personalInfo.fullName || "Resume"} - ${meta.name}`}>
        <Page size="A4" style={styles.page}>
          <View style={styles.twoColWrap}>
            <View style={styles.twoColMain}>
              <View style={[styles.header, styles.headerMinimalist]}>
                <Text style={styles.name}>{content.personalInfo.fullName || "Your Name"}</Text>
                {content.personalInfo.headline ? <Text style={styles.headlineAccent}>{content.personalInfo.headline}</Text> : null}
              </View>
              {mainSections.map((section) => <PdfSection key={section} section={section} content={content} variant={variant} selection={selection} />)}
            </View>
            <TwoColumnSidebar content={content} visibleSections={visible} photoUrl={photoUrl} />
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`${content.personalInfo.fullName || "Resume"} - ${meta.name}`}>
      <Page size="A4" style={[styles.page, variant === "modern" ? styles.pageModern : undefined, variant === "minimalist" ? styles.pageMinimalist : undefined, variant === "harvard" ? styles.pageHarvard : undefined, variant === "classic-tech" ? { fontFamily: "Times-Roman" } : undefined]}>
        <Header content={content} variant={variant} photoUrl={photoUrl} />
        {getVisibleSections(meta, content, selection).map((section) => <PdfSection key={section} section={section} content={content} variant={variant} selection={selection} />)}
      </Page>
    </Document>
  );
}