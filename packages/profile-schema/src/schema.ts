import { z } from "zod";

/**
 * Implements the full JSON Resume schema (https://jsonresume.org/schema/),
 * plus a `tags` extension on work/projects used for tailoring. Used across
 * the website, master CV, and AI-tailored CV.
 */

const iso8601 = z.string().regex(/^\d{4}(-\d{2}(-\d{2})?)?$/, "Expected YYYY, YYYY-MM, or YYYY-MM-DD");

export const basicsSchema = z.object({
  name: z.string(),
  label: z.string().optional(),
  image: z.string().url().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  url: z.string().url().optional(),
  summary: z.string().optional(),
  location: z
    .object({
      address: z.string().optional(),
      postalCode: z.string().optional(),
      city: z.string().optional(),
      countryCode: z.string().optional(),
      region: z.string().optional(),
    })
    .partial()
    .optional(),
  profiles: z
    .array(
      z.object({
        network: z.string(),
        username: z.string().optional(),
        url: z.string().url(),
      }),
    )
    .default([]),
});

export const workSchema = z.object({
  name: z.string(),
  position: z.string(),
  url: z.string().url().optional(),
  startDate: iso8601,
  endDate: iso8601.optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
});

export const educationSchema = z.object({
  institution: z.string(),
  url: z.string().url().optional(),
  area: z.string().optional(),
  studyType: z.string().optional(),
  startDate: iso8601.optional(),
  endDate: iso8601.optional(),
  score: z.string().optional(),
  courses: z.array(z.string()).default([]),
});

export const skillSchema = z.object({
  name: z.string(),
  level: z.string().optional(),
  keywords: z.array(z.string()).default([]),
});

export const projectSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  highlights: z.array(z.string()).default([]),
  url: z.string().url().optional(),
  startDate: iso8601.optional(),
  endDate: iso8601.optional(),
  tags: z.array(z.string()).default([]),
});

export const languageSchema = z.object({
  language: z.string(),
  fluency: z.string().optional(),
});

export const volunteerSchema = z.object({
  organization: z.string(),
  position: z.string().optional(),
  url: z.string().url().optional(),
  startDate: iso8601.optional(),
  endDate: iso8601.optional(),
  summary: z.string().optional(),
  highlights: z.array(z.string()).default([]),
});

export const certificateSchema = z.object({
  name: z.string(),
  date: iso8601.optional(),
  issuer: z.string().optional(),
  url: z.string().url().optional(),
});

export const awardSchema = z.object({
  title: z.string(),
  date: iso8601.optional(),
  awarder: z.string().optional(),
  summary: z.string().optional(),
});

export const publicationSchema = z.object({
  name: z.string(),
  publisher: z.string().optional(),
  releaseDate: iso8601.optional(),
  url: z.string().url().optional(),
  summary: z.string().optional(),
});

export const interestSchema = z.object({
  name: z.string(),
  keywords: z.array(z.string()).default([]),
});

export const referenceSchema = z.object({
  name: z.string(),
  reference: z.string().optional(),
});

export const profileSchema = z.object({
  basics: basicsSchema,
  work: z.array(workSchema).default([]),
  volunteer: z.array(volunteerSchema).default([]),
  education: z.array(educationSchema).default([]),
  awards: z.array(awardSchema).default([]),
  certificates: z.array(certificateSchema).default([]),
  publications: z.array(publicationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  languages: z.array(languageSchema).default([]),
  interests: z.array(interestSchema).default([]),
  references: z.array(referenceSchema).default([]),
  projects: z.array(projectSchema).default([]),
  meta: z
    .object({
      lastModified: z.string().optional(),
      version: z.string().optional(),
    })
    .optional(),
});

export type Profile = z.infer<typeof profileSchema>;
export type Basics = z.infer<typeof basicsSchema>;
export type Work = z.infer<typeof workSchema>;
export type Education = z.infer<typeof educationSchema>;
export type Skill = z.infer<typeof skillSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Language = z.infer<typeof languageSchema>;
export type Volunteer = z.infer<typeof volunteerSchema>;
export type Certificate = z.infer<typeof certificateSchema>;
export type Award = z.infer<typeof awardSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type Interest = z.infer<typeof interestSchema>;
export type Reference = z.infer<typeof referenceSchema>;
