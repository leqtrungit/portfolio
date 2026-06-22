import { z } from "zod";

/**
 * Based on the JSON Resume schema (https://jsonresume.org/schema/) with
 * minor extensions (highlights ordering, tags for tailoring) used across
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

export const profileSchema = z.object({
  basics: basicsSchema,
  work: z.array(workSchema).default([]),
  education: z.array(educationSchema).default([]),
  skills: z.array(skillSchema).default([]),
  projects: z.array(projectSchema).default([]),
  languages: z.array(languageSchema).default([]),
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
