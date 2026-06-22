import { getProfile } from "@/lib/profile";

export default function HomePage() {
  const profile = getProfile();

  return (
    <main>
      <h1>{profile.basics.name}</h1>
      {profile.basics.label && <p>{profile.basics.label}</p>}
      {profile.basics.summary && <p>{profile.basics.summary}</p>}

      {profile.work.length > 0 && (
        <section>
          <h2>Experience</h2>
          <ul>
            {profile.work.map((job) => (
              <li key={`${job.name}-${job.startDate}`}>
                <strong>{job.position}</strong> @ {job.name} ({job.startDate}
                {job.endDate ? ` – ${job.endDate}` : " – Present"})
              </li>
            ))}
          </ul>
        </section>
      )}

      {profile.projects.length > 0 && (
        <section>
          <h2>Projects</h2>
          <ul>
            {profile.projects.map((project) => (
              <li key={project.name}>{project.name}</li>
            ))}
          </ul>
        </section>
      )}
    </main>
  );
}
