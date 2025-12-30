import React, { useState } from 'react';
import { FaLinkedin, FaGithub, FaEnvelope, FaBriefcase, FaGraduationCap, FaTools, FaRocket, FaTimes } from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';
import profileData from './profile.json';
import WorkExperienceCard from './components/WorkExperienceCard';
import EducationCard from './components/EducationCard';
import ProjectCard from './components/ProjectCard';
import './Profile.css';

const Profile: React.FC = () => {
  const { personal, professional_qualifications, statement, work, education, skills, projects } = profileData;
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  // Extract skill usage from work experience
  const getSkillUsage = (skill: string) => {
    const usage: any[] = [];

    if (!work || !Array.isArray(work)) {
      console.error('Work data is not available or not an array');
      return usage;
    }

    try {
      work.forEach((job: any) => {
        if (!job || !job.positions) return;

        job.positions.forEach((position: any) => {
          if (!position) return;

          const examples: string[] = [];

          // Check technical examples
          if (position.detail?.technical_examples && Array.isArray(position.detail.technical_examples)) {
            position.detail.technical_examples.forEach((exampleGroup: any) => {
              if (exampleGroup && typeof exampleGroup === 'object') {
                Object.values(exampleGroup).forEach((exampleList: any) => {
                  if (Array.isArray(exampleList)) {
                    exampleList.forEach((example: string) => {
                      if (typeof example === 'string' && example.toLowerCase().includes(skill.toLowerCase())) {
                        examples.push(example);
                      }
                    });
                  }
                });
              }
            });
          }

          // Check management examples
          if (position.detail?.management_examples && Array.isArray(position.detail.management_examples)) {
            position.detail.management_examples.forEach((exampleGroup: any) => {
              if (exampleGroup && typeof exampleGroup === 'object') {
                Object.values(exampleGroup).forEach((exampleList: any) => {
                  if (Array.isArray(exampleList)) {
                    exampleList.forEach((example: string) => {
                      if (typeof example === 'string' && example.toLowerCase().includes(skill.toLowerCase())) {
                        examples.push(example);
                      }
                    });
                  }
                });
              }
            });
          }

          // Check formal description
          if (position.detail?.formal && typeof position.detail.formal === 'string') {
            if (position.detail.formal.toLowerCase().includes(skill.toLowerCase())) {
              examples.push(position.detail.formal);
            }
          }

          if (examples.length > 0) {
            usage.push({
              company: job.employer?.name || job.company || 'Unknown Company',
              position: position.title || 'Unknown Position',
              dates: `${position.start || ''} - ${position.end || ''}`,
              examples: examples
            });
          }
        });
      });
    } catch (error) {
      console.error('Error extracting skill usage:', error);
    }

    return usage;
  };

  const handleSkillClick = (skill: string) => {
    if (selectedSkill === skill) {
      setSelectedSkill(null); // Close if clicking same skill
    } else {
      setSelectedSkill(skill);
    }
  };

  // Helper function to render credentials with links
  const renderCredentials = () => {
    if (!personal.name.letters) return null;

    const letters = personal.name.letters.split(',').map(l => l.trim());
    const qualMap = new Map(
      (professional_qualifications || []).map((q: any) => [q.abbreviation, q])
    );

    return (
      <p className="credentials">
        {letters.map((letter, index) => {
          const qual = qualMap.get(letter);
          const isLast = index === letters.length - 1;

          if (qual && qual.url) {
            return (
              <React.Fragment key={index}>
                <a
                  href={qual.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="neon-glow-cyan"
                  title={`${qual.name} - ${qual.institution}`}
                  style={{ textDecoration: 'none' }}
                >
                  {letter}
                </a>
                {!isLast && ', '}
              </React.Fragment>
            );
          }
          return (
            <React.Fragment key={index}>
              <span>{letter}</span>
              {!isLast && ', '}
            </React.Fragment>
          );
        })}
      </p>
    );
  };

  return (
    <div className="profile-container">
      <header className="profile-header">
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '3rem',
          marginBottom: '1.5rem',
          flexWrap: 'wrap'
        }}>
          <div style={{ textAlign: 'left', flex: 1, minWidth: '300px' }}>
            <h1>{personal.name.short_first || personal.name.first} {personal.name.last}</h1>
            {renderCredentials()}
            <p className="location">{personal.vague_address.text}</p>
            {statement?.formal && (
              <p style={{
                marginTop: '1rem',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--color-body-text)'
              }}>
                {statement.formal}
              </p>
            )}
          </div>

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
              flexShrink: 0
            }}
          />

          {/*
          <img
            src="/assets/cyber-portrait.jpeg"
            alt={`${personal.name.first} ${personal.name.last} - Cyber`}
            style={{
              width: '150px',
              height: '150px',
              borderRadius: '50%',
              objectFit: 'cover',
              border: '3px solid var(--color-secondary-accent)',
              boxShadow: '0 0 30px rgba(90, 214, 255, 0.6), 0 0 60px rgba(90, 214, 255, 0.3)',
            }}
          />
         */}
        </div>

        <div className="profile-links">
          <a href={personal.linkedin.url} target="_blank" rel="noopener noreferrer" className="profile-link">
            <FaLinkedin size={20} />
            LinkedIn
          </a>
          <a href={personal.github.url} target="_blank" rel="noopener noreferrer" className="profile-link">
            <FaGithub size={20} />
            GitHub
          </a>
          {personal.huggingface && (
            <a href={personal.huggingface.url} target="_blank" rel="noopener noreferrer" className="profile-link">
              <SiHuggingface size={20} />
              Hugging Face
            </a>
          )}
          <a href={`mailto:${personal.email}`} className="profile-link">
            <FaEnvelope size={20} />
            Email
          </a>
        </div>

        <div className="circuit-border-top"></div>
      </header>

      <section className="profile-section">
        <h2 className="section-heading">
          <FaTools className="heading-accent" />
          Skills
          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem', color: 'var(--color-subtle-text)' }}>
            (click to see usage examples)
          </span>
        </h2>
        <div className="skills-grid">
          {(skills as string[]).map((skill, index) => (
            <span
              key={index}
              className={`skill-tag-cyber ${selectedSkill === skill ? 'skill-tag-selected' : ''}`}
              onClick={() => handleSkillClick(skill)}
              style={{ cursor: 'pointer' }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>

      {projects && projects.length > 0 && (
        <section className="profile-section">
          <h2 className="section-heading">
            <FaRocket className="heading-accent" />
            Projects
          </h2>
          <div className="section-content">
            {projects.map((project, index) => (
              <ProjectCard key={index} project={project} />
            ))}
          </div>
        </section>
      )}

      <section className="profile-section">
        <h2 className="section-heading">
          <FaBriefcase className="heading-accent" />
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
          <FaGraduationCap className="heading-accent" />
          Education
        </h2>
        <div className="section-content">
          {education.map((edu, index) => (
            <EducationCard key={index} edu={edu} />
          ))}
        </div>
      </section>

      {/* Skill Detail Modal */}
      {selectedSkill && (() => {
        const skillUsage = getSkillUsage(selectedSkill);
        return (
          <div className="skill-modal-overlay" onClick={() => setSelectedSkill(null)}>
            <div className="skill-modal" onClick={(e) => e.stopPropagation()}>
              <div className="skill-modal-header">
                <h2>{selectedSkill}</h2>
                <button className="skill-modal-close" onClick={() => setSelectedSkill(null)}>
                  <FaTimes />
                </button>
              </div>
              <div className="skill-modal-content">
                {skillUsage.length > 0 ? (
                  skillUsage.map((usage, idx) => (
                    <div key={idx} className="skill-usage-item">
                      <h3>{usage.position}</h3>
                      <h4>{usage.company}</h4>
                      <p className="skill-usage-dates">{usage.dates}</p>
                      <ul>
                        {usage.examples && usage.examples.length > 0 ? (
                          usage.examples.map((example: string, i: number) => (
                            <li key={i}>{example}</li>
                          ))
                        ) : null}
                      </ul>
                    </div>
                  ))
                ) : (
                  <p>No detailed examples found for this skill in work experience.</p>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default Profile;
