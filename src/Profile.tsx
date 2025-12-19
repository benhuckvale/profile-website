import React from 'react';
import profileData from './profile.json';
import WorkExperienceCard from './components/WorkExperienceCard';
import EducationCard from './components/EducationCard';
import ProjectCard from './components/ProjectCard'; // Import ProjectCard
import './Profile.css';

const Profile: React.FC = () => {
  const { personal, work, education, skills, projects } = profileData;

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div style={{ marginBottom: '1.5rem' }}>
          <img
            src="/assets/portrait.jpeg"
            alt={`${personal.name.first} ${personal.name.last}`}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--color-primary-accent)',
              boxShadow: '0 0 30px rgba(47, 155, 255, 0.6), 0 0 60px rgba(47, 155, 255, 0.3)',
            }}
          />
        </div>
        <h1>{personal.name.first} {personal.name.last}</h1>
        <p className="credentials">{personal.name.letters}</p>
        <p className="location">📍 {personal.vague_address.text}</p>

        <div className="profile-links">
          <a href={personal.linkedin.url} target="_blank" rel="noopener noreferrer" className="profile-link">
            💼 LinkedIn
          </a>
          <a href={personal.github.url} target="_blank" rel="noopener noreferrer" className="profile-link">
            🔗 GitHub
          </a>
          <a href={`mailto:${personal.email}`} className="profile-link">
            ✉️ Email
          </a>
        </div>

        <div className="circuit-border-top"></div>
      </header>

      <section className="profile-section">
        <h2 className="section-heading">
          <span className="heading-accent">⚡</span>
          Work Experience
        </h2>
        <div className="section-content">
          {work.map((job, index) => (
            <WorkExperienceCard key={index} job={job} />
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-heading">
          <span className="heading-accent">🎓</span>
          Education
        </h2>
        <div className="section-content">
          {education.map((edu, index) => (
            <EducationCard key={index} edu={edu} />
          ))}
        </div>
      </section>

      <section className="profile-section">
        <h2 className="section-heading">
          <span className="heading-accent">🛠️</span>
          Skills
        </h2>
        <div className="skills-grid">
          {(skills as string[]).map((skill, index) => (
            <span key={index} className="skill-tag-cyber">{skill}</span>
          ))}
        </div>
      </section>

      {projects && projects.length > 0 && (
        <section className="profile-section">
          <h2 className="section-heading">
            <span className="heading-accent">🚀</span>
            Projects
          </h2>
          <div className="section-content">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Profile;