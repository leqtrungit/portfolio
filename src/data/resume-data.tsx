import { GitHubIcon, LinkedInIcon, XIcon, SubstackIcon } from "@/components/icons";
import { MediumIcon } from "@/components/icons/MediumIcon";

export const RESUME_DATA = {
  name: "Trung Le",
  initials: "TL",
  location: "Ho Chi Minh City, Vietnam",
  locationLink: "https://www.google.com/maps/place/Ho+Chi+Minh+City",
  about:
    "A Software Engineer passionate about creativity, technology, and finding solutions to make everyday life more convenient.",
  summary: (
    <>
      Software Engineer with 3+ years of experience delivering end-to-end solutions, from client discussions to deployment. Passionate about tech, project management, finance, and self-hosted innovations that improve everyday life.
    </>
  ),
  avatarUrl: "https://avatars.githubusercontent.com/u/70500374?v=4",
  personalWebsiteUrl: undefined,
  contact: {
    email: "leqtrungit@gmail.com",
    tel: "+84 908103573",
    social: [
      {
        name: "GitHub",
        url: "https://github.com/lequoctrung-it",
        icon: GitHubIcon,
      },
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leqtrungit/",
        icon: LinkedInIcon,
      },
      {
        name: "X",
        url: "https://x.com/leqtrungit",
        icon: XIcon,
      },
      {
        name: "Medium",
        url: "https://leqtrungit.medium.com/",
        icon: MediumIcon,
      },
      {
        name: "Substack",
        url: "https://substack.com/@leqtrungit",
        icon: SubstackIcon,
      },
    ],
  },
  education: [
    {
      school: "Ton Duc Thang University",
      degree: "Bachelor's Degree in Computer Networks and Data Communications",
      start: "Sep 2019",
      end: "Sep 2024",
    },
  ],
  work: [
    {
      company: "Bosch Global Software Technologies Vietnam",
      link: "https://www.bosch.com.vn/our-company/bosch-in-vietnam/ho-chi-minh-city-rbvh/",
      badges: ["On Site", "Angular", "Spring Boot", "Oracle DB", "OpenShift"],
      title: "Software Engineer",
      // logo: BoschLogo,
      start: "Dec 2022",
      end: null,
      description: (
        <>
          Led a full lifecycle web application project for German internal clients, from requirement gathering to release.
          <ul className="list-inside list-disc">
            <li>Reduced critical API response time from 5s to 1–2s by optimizing backend performance</li>
            <li>Integrated third-party APIs and streamlined cross-project data processing</li>
            <li>Enhanced UI with scalable columns and Excel-like filtering after 2 years of backlog</li>
            <li>Improved CI/CD with optimized Dockerfiles, GitHub Actions, and local/dev containers</li>
            <li>Demonstrated strong end-to-end delivery and problem-solving in a global environment</li>
          </ul>
        </>
      ),
    },
    {
      company: "Bosch Global Software Technologies Vietnam",
      link: "https://www.bosch.com.vn/our-company/bosch-in-vietnam/ho-chi-minh-city-rbvh/",
      badges: ["On Site", "Angular", "Spring Boot", "Agile"],
      title: "Frontend Developer Intern",
      // logo: BoschLogo,
      start: "Jun 2022",
      end: "Dec 2022",
      description: (
        <>
          Internship focused on developing internal tools and dashboards with Angular and Power BI.
          <ul className="list-inside list-disc">
            <li>Embedded Microsoft Power BI into a web app for enhanced data visualization</li>
            <li>Built a logging and job scheduling system from scratch</li>
            <li>Followed Scrum process and collaborated with customers to refine requirements</li>
            <li>Improved teamwork, communication, and requirement analysis skills</li>
          </ul>
        </>
      ),
    },
  ],  
  skills: [
    // 🧠 Industry Knowledge
    "Software Development",
    "Agile Methodologies",
    "Project Management",
    "End-to-End Project Delivery",
    "Cross-Functional Collaboration",
    "Independent Problem-Solving",
    "Leadership and Management",
    "Strategy and Operations",
    "Business Communication",
    "Entrepreneurship",
  
    // 🛠️ Tools & Technologies
    "Angular",
    "React.js",
    "Angular Material",
    "PrimeNG",
    "Spring Boot",
    "Oracle Database",
    "Microsoft Entra ID",
    "Docker",
    "OpenShift",
    "GitHub Actions",
    "DevOps",
    "Power BI",
    "Unix Shell",
  
    // ⚙️ General Engineering
    "System Architecture",
    "Scrum",
    "Problem Solving",
    "Communication",
    "Collaboration",
  ],  
  projects: [
    {
      title: "HGM Orders",
      techStack: ["Hasura", "NestJS", "PostgreSQL", "GraphQL"],
      description:
        "Business Process Management application for tracking and managing workflows in a media outsourcing company. Covers order tracking, task assignments, and production monitoring.",
      logo: null,
      link: {
        label: "Internal Project",
        href: undefined,
      },
    },
    {
      title: "HomeLab",
      techStack: ["Docker", "Linux", "Prometheus", "Grafana", "n8n", "Cloudflare"],
      description:
        "Self-hosted home infrastructure project for automating and enhancing daily life. Includes AI Agent, Home Assistant, workflow automation, monitoring, and secure remote access.",
      logo: null,
      link: {
        label: "homelab.local",
        href: undefined,
      },
    },
  ],
} as const;
