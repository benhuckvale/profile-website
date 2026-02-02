import React, { useState, useEffect } from 'react';
import { FaLinkedin, FaGithub, FaBriefcase, FaGraduationCap, FaTools, FaRocket, FaTimes, FaInfoCircle, FaHeart } from 'react-icons/fa';
import { SiHuggingface } from 'react-icons/si';
import demoData from './profile.json';
import WorkExperienceCard from './components/WorkExperienceCard';
import EducationCard from './components/EducationCard';
import ProjectCard from './components/ProjectCard';
import { renderTextWithLinks } from './utils/markdownLink';
import './Profile.css';

const SEO_DEFAULT_DESCRIPTION = 'Professional profile showcasing career history, projects, skills, and blog';

const Profile: React.FC = () => {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, ''); // Remove trailing slash
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [showSkillTooltip, setShowSkillTooltip] = useState(false);
  const [portraitError, setPortraitError] = useState(false);

  // Fetch production data, fallback to demo data
  useEffect(() => {
    fetch(`${baseUrl}/profile.json`)
      .then(res => res.json())
      .then(data => {
        setProfileData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log('Using demo data (production data not available):', err);
        setProfileData(demoData);
        setIsLoading(false);
      });
  }, [baseUrl]);

  // Don't render content until data is loaded
  if (isLoading || !profileData) {
    return (
      <div className="profile-container" style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh'
      }}>
        <div style={{
          color: 'var(--color-primary-accent)',
          fontSize: '1.2rem'
        }}>
          Loading...
        </div>
      </div>
    );
  }

  const { personal, professions, professional_qualifications, statement, work, education, skills, skill_aliases, projects: rawProjects, unicode_replacements, interests } = profileData;
  const projects = Array.isArray(rawProjects) ? rawProjects : [];

  useEffect(() => {
    const nameData = personal?.name;
    if (!nameData) return;

    const shortFirst = nameData.short_first || nameData.first || '';
    const last = nameData.last || '';
    const displayName = [shortFirst, last].filter(Boolean).join(' ').trim();
    const pageTitle = displayName ? `${displayName} · Personal Profile` : 'Personal Profile';
    const description = displayName
      ? `${displayName}'s professional profile showcasing career history, projects, skills, and blog`
      : SEO_DEFAULT_DESCRIPTION;

    document.title = pageTitle;

    const setMetaContent = (selector: string, value: string) => {
      const element = document.querySelector(selector) as HTMLMetaElement | null;
      if (element) {
        element.setAttribute('content', value);
      }
    };

    setMetaContent('meta[name="description"]', description);
    setMetaContent('meta[property="og:title"]', pageTitle);
    setMetaContent('meta[property="og:description"]', description);
    setMetaContent('meta[name="twitter:title"]', pageTitle);
    setMetaContent('meta[name="twitter:description"]', description);
  }, [personal]);

  const resolveEmployerName = (job: any) => {
    if (!job) return 'Unknown Company';
    if (typeof job.employer === 'string') return job.employer;
    return job.employer?.name || job.company || 'Unknown Company';
  };

  // Group work entries by employer name for display
  const groupedWork = React.useMemo(() => {
    const grouped = new Map<string, any>();

    work.forEach((job: any) => {
      // Skip hidden employers
      if (job.hide) return;

      // Handle both string and object employer formats
      const employerName = resolveEmployerName(job);

      // Filter out hidden positions
      const visiblePositions = (job.positions || []).filter((pos: any) => !pos.hide);
      if (visiblePositions.length === 0) return;

      if (grouped.has(employerName)) {
        // Merge positions into existing employer entry (create new object)
        const existing = grouped.get(employerName);
        grouped.set(employerName, {
          ...existing,
          positions: [...existing.positions, ...visiblePositions]
        });
      } else {
        // Create new employer entry
        grouped.set(employerName, {
          ...job,
          positions: [...visiblePositions]
        });
      }
    });

    return Array.from(grouped.values());
  }, [work]);

  // Extract skill usage from work experience
  const getSkillUsage = (skill: string) => {
    // Get search terms: skill name + aliases
    const searchTerms = [skill.toLowerCase()];
    const aliases = skill_aliases as Record<string, string[]>;
    if (aliases && aliases[skill]) {
      searchTerms.push(...aliases[skill].map((alias: string) => alias.toLowerCase()));
    }
    const termMatchers = searchTerms
      .map(term => term.trim())
      .filter(Boolean)
      .map(term => {
        const escapedTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        const isWordLike = /^[a-z0-9_\\s]+$/i.test(term);
        const pattern = isWordLike ? `\\b${escapedTerm}\\b` : escapedTerm;
        return new RegExp(pattern, 'i');
      });
    const matchesAnyTerm = (text?: string) => {
      if (typeof text !== 'string' || !text.trim()) return false;
      return termMatchers.some(regex => regex.test(text));
    };
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

          // Check impact examples
          if (position.detail?.impact_examples && Array.isArray(position.detail.impact_examples)) {
            position.detail.impact_examples.forEach((example: string) => {
              if (typeof example === 'string' && matchesAnyTerm(example)) {
                examples.push(example);
              }
            });
          }

          // Check impact examples more
          if (position.detail?.impact_examples_more && Array.isArray(position.detail.impact_examples_more)) {
            position.detail.impact_examples_more.forEach((example: string) => {
              if (typeof example === 'string' && matchesAnyTerm(example)) {
                examples.push(example);
              }
            });
          }

          // Check formal description
          if (position.detail?.formal && typeof position.detail.formal === 'string') {
            if (matchesAnyTerm(position.detail.formal)) {
              examples.push(position.detail.formal);
            }
          }

          if (examples.length > 0) {
            usage.push({
              company: resolveEmployerName(job),
              position: position.title || 'Unknown Position',
              dates: `${position.start || ''} - ${position.end || ''}`,
              examples: examples
            });
          }
        });
      });

      // Also check education entries
      if (education && Array.isArray(education)) {
        education.forEach((edu: any) => {
          if (!edu) return;

          const examples: string[] = [];

          // Check formal description
          if (edu.detail?.formal && typeof edu.detail.formal === 'string') {
            if (matchesAnyTerm(edu.detail.formal)) {
              examples.push(edu.detail.formal);
            }
          }

          // Check tech field
          if (edu.detail?.tech && typeof edu.detail.tech === 'string') {
            if (matchesAnyTerm(edu.detail.tech)) {
              examples.push(`Technologies: ${edu.detail.tech}`);
            }
          }

          if (examples.length > 0) {
            usage.push({
              company: edu.institution || 'Education',
              position: edu.qualification || 'Academic Study',
              dates: `${edu.start || ''} - ${edu.end || ''}`,
              examples: examples
            });
          }
        });
      }
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

    const letters = personal.name.letters.split(',').map((l: string) => l.trim());
    const qualMap = new Map(
      (professional_qualifications || []).map((q: any) => [q.abbreviation, q])
    );

    return (
      <p className="credentials">
        {letters.map((letter: string, index: number) => {
          const qual: any = qualMap.get(letter);
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
            {professions && professions.length > 0 && (
              <p style={{
                fontSize: '1rem',
                color: 'var(--color-secondary-accent)',
                marginTop: '0.5rem',
                marginBottom: '0.5rem'
              }}>
                {professions.join(' - ')}
              </p>
            )}
            <p className="location">{personal.vague_address.text}</p>
            {statement?.impact && (
              <p style={{
                marginTop: '1rem',
                fontSize: '0.95rem',
                lineHeight: '1.6',
                color: 'var(--color-body-text)'
              }}>
                {statement.impact}
              </p>
            )}
          </div>

          {!portraitError ? (
            <img
              src={`${baseUrl}/portrait.jpeg`}
              alt={`${personal.name.first} ${personal.name.last}`}
              onError={() => setPortraitError(true)}
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
          ) : (
            <svg
              width="150"
              height="150"
              viewBox="0 0 150 150"
              style={{
                borderRadius: '50%',
                border: '3px solid var(--color-primary-accent)',
                boxShadow: '0 0 30px rgba(47, 155, 255, 0.6), 0 0 60px rgba(47, 155, 255, 0.3)',
                flexShrink: 0
              }}
            >
              <rect width="150" height="150" fill="rgba(47, 155, 255, 0.1)" />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                style={{
                  fontSize: '48px',
                  fontWeight: 'bold',
                  fill: 'var(--color-primary-accent)',
                  fontFamily: 'var(--font-heading)'
                }}
              >
                {personal.name.first[0]}{personal.name.last[0]}
              </text>
            </svg>
          )}
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
        </div>

        <div className="circuit-border-top"></div>
      </header>

      <section className="profile-section">
        <h2 className="section-heading">
          <FaTools className="heading-accent" />
          Skills
          <span style={{ fontSize: '0.8rem', fontWeight: 'normal', marginLeft: '1rem', color: 'var(--color-subtle-text)' }}>
            (click to see usage examples)
            <span style={{ position: 'relative', display: 'inline-block', marginLeft: '0.5rem' }}>
              <FaInfoCircle
                size={14}
                style={{ cursor: 'pointer', color: 'var(--color-secondary-accent)' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowSkillTooltip(!showSkillTooltip);
                }}
              />
              {showSkillTooltip && (
                <div
                  style={{
                    position: 'absolute',
                    top: '1.5rem',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    backgroundColor: 'rgba(6, 13, 27, 0.95)',
                    border: '1px solid var(--color-primary-accent)',
                    borderRadius: '8px',
                    padding: '0.75rem',
                    fontSize: '0.85rem',
                    color: 'var(--color-body-text)',
                    width: '280px',
                    zIndex: 1000,
                    boxShadow: '0 4px 16px rgba(0, 0, 0, 0.5)',
                    lineHeight: '1.4'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <strong>Note:</strong> I am still working on this skills cross-reference feature, but I hope you can find it useful in highlighting selected examples from my work experience. Not all relevant usage may be shown.
                  <div style={{ marginTop: '0.5rem', textAlign: 'right' }}>
                    <button
                      onClick={() => setShowSkillTooltip(false)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-secondary-accent)',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        textDecoration: 'underline'
                      }}
                    >
                      Close
                    </button>
                  </div>
                </div>
              )}
            </span>
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
            {projects.map((project: any, index: number) => (
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
          {groupedWork.map((job, index) => (
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
          {education
            .filter((edu: any) => !edu.hide)
            .map((edu: any, index: number) => (
              <EducationCard key={index} edu={edu} unicodeReplacements={unicode_replacements} />
            ))}
        </div>
      </section>

      {interests && interests.length > 0 && (
        <section className="profile-section">
          <h2 className="section-heading">
            <FaHeart className="heading-accent" />
            Interests
          </h2>
          <div className="section-content">
            <div className="glass-card">
              {interests
                .filter((interest: any) => !interest.hide)
                .map((interest: any, index: number, arr: any[]) => (
                  <div key={index} style={{ marginBottom: index < arr.length - 1 ? '1rem' : 0 }}>
                    <h4 style={{ color: 'var(--color-primary-accent)', marginBottom: '0.25rem' }}>
                      {interest.name}
                    </h4>
                    <div style={{ color: 'var(--color-body-text)', margin: 0 }}>
                      {Array.isArray(interest.detail) ? (
                        interest.detail.map((item: string, i: number) => (
                          <p key={i} style={{ margin: i > 0 ? '0.5rem 0 0 0' : 0 }}>
                            {renderTextWithLinks(item)}
                          </p>
                        ))
                      ) : (
                        <p style={{ margin: 0 }}>{renderTextWithLinks(interest.detail || interest.brief)}</p>
                      )}
                      {interest.aside && (
                        <div style={{ fontStyle: 'italic', marginTop: '0.5rem', opacity: 0.85 }}>
                          {Array.isArray(interest.aside) ? (
                            interest.aside.map((item: string, i: number) => (
                              <p key={i} style={{ margin: i > 0 ? '0.5rem 0 0 0' : 0 }}>
                                {renderTextWithLinks(item)}
                              </p>
                            ))
                          ) : (
                            <p style={{ margin: 0 }}>{renderTextWithLinks(interest.aside)}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </section>
      )}

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
