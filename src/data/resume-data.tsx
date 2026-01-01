import { GitHubIcon, LinkedInIcon, XIcon, SubstackIcon } from "@/components/icons";
import { MediumIcon } from "@/components/icons/MediumIcon";

export const RESUME_DATA = {
  name: "Trung Le",
  initials: "TL",
  location: "Ho Chi Minh City, Vietnam",
  locationLink: "https://www.google.com/maps/place/Ho+Chi+Minh+City",
  about:
    "Tech Lead with 3+ years of experience delivering scalable web applications and leading end-to-end project development in cross-functional teams.",
  summary: (
    <>
      Results-driven Software Engineer with 3+ years of experience in delivering scalable web applications and leading end-to-end project development in cross-functional teams. Proven track record of optimizing system performance, managing full project lifecycles, and aligning technology solutions with business goals. Strong communication and problem-solving skills with a clear focus on user experience and team collaboration. Currently transitioning into Tech Lead to leverage both technical and leadership capabilities.
    </>
  ),
  avatarUrl: "https://avatars.githubusercontent.com/u/70500374?v=4",
  personalWebsiteUrl: undefined,
  contact: {
    email: "leqtrungit@gmail.com",
    tel: "+84 908 103 573",
    social: [
      {
        name: "LinkedIn",
        url: "https://www.linkedin.com/in/leqtrungit/",
        icon: LinkedInIcon,
      },
      {
        name: "GitHub",
        url: "https://github.com/leqtrungit",
        icon: GitHubIcon,
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
      description: (
        <>
          <ul className="list-inside list-disc">
            <li>Gained a strong foundation in software development and network systems, contributing to hands-on projects during coursework</li>
            <li>Contributed to a team project that won 2nd place in a website design competition celebrating Vietnamese Teachers&apos; Day, showcasing creativity and technical skills in web development</li>
          </ul>
        </>
      ),
    },
  ],
  work: [
    {
      company: "DAT Software Solutions",
      link: undefined,
      badges: ["Co-Founder", "Tech Lead", "Remote"],
      title: "Co-Founder & Tech Lead",
      start: "Mar 2025",
      end: null,
      description: (
        <>
          Co-founded company, spearheading technology strategy and engineering team development.
          <ul className="list-inside list-disc">
            <li>Led project management, requirements analysis, and technical consulting to deliver tailored client solutions</li>
            <li>Architected scalable systems, selected optimal technology stacks, and managed full-cycle development</li>
            <li>Recruited and mentored engineering talent, fostering improved collaboration and delivery efficiency</li>
          </ul>
        </>
      ),
    },
    {
      company: "Bosch Global Software Technologies Vietnam",
      link: "https://www.bosch-softwaretechnologies.com/en/locations/vietnam/vechungtoi.html",
      badges: ["On Site", "Angular", "Spring Boot", "Oracle DB", "OpenShift"],
      title: "Software Engineer",
      start: "Dec 2022",
      end: null,
      description: (
        <>
          Independently led an acquisition process web application project from Feb 2023, managing the full lifecycle.
          <ul className="list-inside list-disc">
            <li>Gathered requirements with German internal clients, designed solutions, developed using Angular, Spring Boot, Oracle DB, and deployed on OpenShift with Azure Entra ID authentication (migrated from WAM)</li>
            <li>Optimized performance of multiple APIs, with a standout achievement of reducing one critical API&apos;s response time from 5 minutes to 1-2 seconds</li>
            <li>Integrated third-party APIs for data fetching, handled cross-project business logic, and streamlined data processing</li>
            <li>Enhanced UI with scalable columns and Excel-like filters (unachieved by previous developers for over 2 years), earning high praise from clients who had awaited these features</li>
            <li>Successfully migrated a mid-sized project from Angular v10 and PrimeNG v11 to Angular v18 and PrimeNG v18, significantly enhancing performance and maintainability</li>
            <li>Improved deployment efficiency by optimizing Dockerfiles, automating builds with GitHub Actions, and setting up local and containerized dev environments</li>
            <li>Demonstrated strong problem-solving and end-to-end project management skills in a global setting</li>
          </ul>
        </>
      ),
    },
    {
      company: "Bosch Global Software Technologies Vietnam",
      link: "https://www.bosch-softwaretechnologies.com/en/locations/vietnam/vechungtoi.html",
      badges: ["On Site", "Angular", "Spring Boot", "Agile"],
      title: "Frontend Developer Intern",
      start: "Jun 2022",
      end: "Dec 2022",
      description: (
        <>
          Collaborated with customers and teammates to deliver internal tools and dashboards.
          <ul className="list-inside list-disc">
            <li>Integrated Microsoft Power BI into a website as a third-party application (embedded)</li>
            <li>Developed a logging and scheduled job project from scratch</li>
            <li>Developed software following Scrum development process</li>
            <li>Improved teamwork, communication skills, and analyze user requirements</li>
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
      title: "Media AI Automation Pipeline",
      techStack: ["n8n", "Microservices", "Queue", "OpenAI", "Ollama", "Selenium", "Docker", "YouTube API"],
      description:
        "Led 3-person team to build YouTube video factory → 1,500 videos/day, 10K+ AI assets, zero manual edits. Architected scalable system integrating n8n, microservices, and queue infrastructure for over 10 AI APIs, processing 10,000+ assets daily and over 10TB of storage with 80% success rate in YouTube API uploads.",
      logo: null,
      link: {
        label: "May 2025 - Present",
        href: undefined,
      },
    },
    {
      title: "HGM Orders – BPM Platform",
      techStack: ["React", "Hasura", "PostgreSQL", "GraphQL", "Docker"],
      description:
        "Delivered 3 customized BPM platforms for 70-person media ops → Cut order cycle 60%, 0 manual errors, 5TB+ media storage. Designed and implemented core platform using React, Hasura, and PostgreSQL, customized into three tailored versions for departments with 5TB+ storage system achieving 100% data integrity and sub-2-second latency.",
      logo: null,
      link: {
        label: "Dec 2024 - Present",
        href: undefined,
      },
    },
    {
      title: "D365 AI Agent PoC",
      techStack: ["AI", "AutoGen", "RAG", "LLM", "D365", "Docker", "Python"],
      description:
        "Solo-built RAG-powered AI agent in 3 weeks → Enabled instant D365 how-to answers for end-users. Designed and deployed AutoGen with local LLM RAG system, enabling accurate, context-aware responses from Microsoft Docs. Containerized solution with Docker and created desktop executable for seamless local deployment.",
      logo: null,
      link: {
        label: "Oct 2024 - Nov 2024",
        href: undefined,
      },
    },
    {
      title: "HomeLab",
      techStack: ["Docker", "Prometheus", "Grafana", "Home Assistant", "AI Agent", "Linux", "Cloudflare", "Ollama"],
      description:
        "Self-built AI-powered home infrastructure → Automated 5 daily workflows, 99.9% uptime. Developed AI Agent integrated with Home Assistant to automate lighting, system backups, and real-time alerts. Containerized over 10 services enabling secure remote access from any location.",
      logo: null,
      link: {
        label: "Nov 2024 - Present",
        href: undefined,
      },
    },
  ],
  certifications: [
    {
      name: "Google Project Management: Professional Certificate",
      issuer: "Google",
      date: "Nov 2024",
      description: "Business Communication · Collaboration · Agile Software Development · Software Engineering · Strategy and Operations · Leadership and Management · Project Management · Scrum (Software Development) · Entrepreneurship · Project Management Basics · Communication",
      link: {
        label: "View Certificate",
        href: "https://www.coursera.org/account/accomplishments/professional-cert/A6BULOJ9JGUS",
      },
    },
    {
      name: "B1 Preliminary - Level B1",
      issuer: "Cambridge University Press & Assessment",
      date: "Mar 2023",
      description: "Credential ID C1495111",
      link: {
        label: "Credential ID C1495111",
        href: undefined,
      },
    },
    {
      name: "CCNA: Introduction to Networks",
      issuer: "Cisco Networking Academy",
      date: "Jun 2020",
      description: undefined,
      link: {
        label: "View Certificate",
        href: "https://www.credly.com/badges/fddf5c3b-0b8a-4221-b673-352266aa7e0a/linked_in",
      },
    },
    {
      name: "Starter Programming Scholarship",
      issuer: "INTEK Training JSC",
      date: "Jun 2020",
      description: "Unix Shell basic · Git basic · Python basic",
      link: {
        label: "View Certificate",
        href: "https://www.linkedin.com/in/leqtrungit/details/certifications/2053511233/multiple-media-viewer/?profileId=ACoAADFgsusBpxiD-KZwPsKkF4pBM8QajVfLuiA&treasuryMediaId=1741515266694",
      },
    },
  ],
  volunteer: [
    {
      organization: "Local Political Organization",
      position: "Residential Group Leader",
      location: "Ho Chi Minh City, Vietnam",
      start: "Jul 2021",
      end: "Apr 2024",
      description: (
        <>
          <ul className="list-inside list-disc">
            <li>Built strong relationships with local residents and community organizations</li>
            <li>Identified and addressed community needs, especially during times of COVID-19</li>
            <li>Leveraged technology to enhance communication, collaboration, and outreach efforts</li>
            <li>Implemented digital tools for remote work, virtual meetings, and data management</li>
            <li>Coordinated with local government officials to ensure compliance with regulations and access available resources</li>
            <li>Led and advised the team supporting the deployment of government digital technology to local people (VNeID, VNPT SmartCA)</li>
          </ul>
        </>
      ),
    },
  ],
} as const;
