type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : { readonly [K in keyof T]: Widen<T[K]> };

export const en = {
  nav: { work: "work", projects: "projects", stack: "stack", blog: "blog", contact: "contact", portfolio: "portfolio", language: "Language" },
  hero: {
    lead: "I turn root-cause analysis into",
    accent: "scalable solutions",
    middle: "and teams into",
    underline: "independent problem-solvers.",
    available: "available for select work",
    portraitAlt: "{name} — portrait photo",
  },
  transformations: {
    label: "SELECTED TRANSFORMATIONS",
    items: [
      { from: "manual 1st-level support", to: "AI agent, 60% less dev effort", tag: "BOSCH" },
      { from: "manual video edits", to: "1,500 auto-shipped / day", tag: "MEDIA AI" },
      { from: "60-step order cycle", to: "60% faster, 0 errors", tag: "HGM BPM" },
      { from: "siloed engineers", to: "100% proactive owners", tag: "DAT · BOSCH" },
    ],
  },
  sections: {
    experience: "EXPERIENCE",
    projects: "SELECTED PROJECTS",
    stack: "STACK",
    education: "EDUCATION",
    certificates: "CERTIFICATES",
    latestBlog: "LATEST FROM THE BLOG",
    allPosts: "all posts →",
  },
  contact: {
    kicker: "→ LET'S BUILD SOMETHING",
    headingLead: "Got a system that needs a",
    headingAccent: "root-cause fix",
    headingTail: "? Let's talk.",
    privacy: "Privacy",
  },
  blog: {
    siteName: "{name}'s Blog",
    kicker: "→ WRITING — NOTES FROM THE BUILD",
    titleLead: "The",
    titleAccent: "Blog",
    description:
      "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships. Written by me, irregularly, honestly.",
    metaDescription:
      "A personal log of root-cause hunts, systems I build, and the lessons that only show up after something ships.",
    countOne: "{count} POST",
    countMany: "{count} POSTS",
    updated: "UPDATED {date}",
    empty: "No posts yet.",
    loadMore: "load more →",
    loading: "loading…",
    allPostsBack: "← all posts",
    readMore: "← read more posts",
    tagged: "TAGGED",
    share: "SHARE",
    shareButton: "Share",
    copyLink: "Copy link",
    copied: "Copied!",
    toc: "CONTENTS",
    tocAria: "Contents",
    related: "RELATED POSTS",
    prev: "← PREVIOUS",
    next: "NEXT →",
    postNavAria: "Previous and next posts",
    backToPortfolio: "← back to portfolio",
    privacy: "Privacy",
    notFound: "Post not found",
  },
  privacy: {
    title: "Privacy",
    kicker: "PRIVACY",
    intro: "How this site handles first-party analytics and visitor data.",
    home: "← home",
    backHome: "← back home",
    sections: [
      { heading: "WHAT IS COLLECTED", body: "This site uses first-party analytics only. When you load a page, we record the page path, referring URL, query string (including UTM parameters when present), approximate engagement (time on page and scroll depth), your IP address, and your browser User-Agent string." },
      { heading: "WHY", body: "These measurements support traffic analysis, bot and spam detection, and content improvement. They are not used for advertising or ad targeting." },
      { heading: "SHARING", body: "There are no third-party analytics vendors. Analytics data stays on infrastructure controlled by the site operator and is not sold or shared for marketing purposes." },
      { heading: "NO CROSS-SITE TRACKING", body: "This site does not use ad pixels, third-party tracking cookies, or shared advertising identifiers. Analytics does not follow you across other websites." },
      { heading: "RETENTION", body: "Raw analytics events are retained only as long as operationally needed. A more specific retention period will be published here if the backend defines one." },
    ],
  },
  notFound: { title: "Page not found", body: "The page you're looking for doesn't exist.", home: "← back home" },
} as const;

export type Dictionary = Widen<typeof en>;
