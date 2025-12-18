import React from 'react';
import profileData from './profile.json';

const Profile: React.FC = () => {
  const { personal, work, education, skills, projects } = profileData;

  return (
    <div>
      <header>
        <h1>{personal.name.first} {personal.name.last}</h1>
        <p>{personal.based_address}</p>
        <p>
          <a href={personal.linkedin.url} target="_blank" rel="noopener noreferrer">LinkedIn</a> | 
          <a href={personal.github.url} target="_blank" rel="noopener noreferrer">GitHub</a> | 
          <a href={`mailto:${personal.email}`}>{personal.email}</a>
        </p>
      </header>

      <section>
        <h2>Work Experience</h2>
        {work.map((job, index) => (
          <div key={index}>
            <h3>{job.positions[0].title} at {job.company}</h3>
            <p>{job.positions[0].dates.start} - {job.positions[0].dates.end}</p>
            <p>{job.positions[0].description}</p>
            <ul>
              {job.positions[0].highlights?.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
            <p>Technologies: {job.positions[0].technologies?.join(', ')}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Education</h2>
        {education.map((edu, index) => (
          <div key={index}>
            <h3>{edu.degree} in {edu.school}</h3>
            <p>{edu.year}</p>
            <p>{edu.description}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Skills</h2>
        {Object.entries(skills).map(([category, skillList]) => (
          <div key={category}>
            <h3>{category}</h3>
            <p>{(skillList as string[]).join(', ')}</p>
          </div>
        ))}
      </section>

      <section>
        <h2>Projects</h2>
        {projects.map((project, index) => (
          <div key={index}>
            <h3><a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a></h3>
            <p>{project.description}</p>
            <p>Technologies: {project.technologies?.join(', ')}</p>
          </div>
        ))}
      </section>
    </div>
  );
};

export default Profile;
