import React, { useState } from 'react';
import { renderTextWithLinks } from '../utils/markdownLink';

interface WorkExperienceCardProps {
  job: any;
}

const WorkExperienceCard: React.FC<WorkExperienceCardProps> = ({ job }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const positions = job.positions || [];

  // Calculate total date range across all positions
  const earliestStart = positions[0]?.start || '';
  const latestEnd = positions[positions.length - 1]?.end || '';
  const employerName = job.employer?.name || job.employer;
  const employerLink = job.employer?.link;
  const location = job.location || positions[0]?.location || '';

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleExpand();
    }
  };

  return (
    <div className="glass-card">
      {/* Collapsible Header - Always Visible */}
      <div
        onClick={toggleExpand}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
        aria-label={`${employerName} - ${positions.length} position${positions.length > 1 ? 's' : ''}`}
        className="glass-card-hover"
        style={{ cursor: 'pointer', padding: '1rem', margin: '-1rem', borderRadius: '12px' }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 className="neon-glow-blue" style={{ marginBottom: '0.5rem' }}>
              {employerLink ? (
                <a
                  href={employerLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ textDecoration: 'none', color: 'inherit' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {employerName}
                </a>
              ) : (
                employerName
              )}
            </h3>
            <div className="date-location" style={{ marginBottom: 0 }}>
              <span>{earliestStart} - {latestEnd}</span>
              {location && <span>{location}</span>}
              <span className="text-accent">
                {positions.length} position{positions.length > 1 ? 's' : ''}
              </span>
            </div>
          </div>
          <div>
            <span className={`chevron ${isExpanded ? 'chevron-up' : ''}`}></span>
          </div>
        </div>
      </div>

      {/* Expandable Content - Shows All Positions */}
      {isExpanded && (
        <div className="expanding" style={{ marginTop: '1.5rem' }}>
          {positions.map((position: any, index: number) => (
            <div key={index} className="position-card">
              <h4>{position.title}</h4>
              <p className="date-range">
                {position.start} - {position.end}
              </p>

              {position.detail?.formal && (
                <div style={{ marginTop: '1rem' }}>
                  {Array.isArray(position.detail.formal) ? (
                    position.detail.formal.map((text: string, idx: number) => (
                      <p key={idx}>{renderTextWithLinks(text)}</p>
                    ))
                  ) : (
                    <p>{renderTextWithLinks(position.detail.formal)}</p>
                  )}
                </div>
              )}

              {position.detail?.technical_examples && position.detail.technical_examples.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ color: 'var(--color-secondary-accent)', marginBottom: '0.5rem' }}>
                    Technical Highlights:
                  </h5>
                  <ul className="cyber-list">
                    {position.detail.technical_examples.map((section: any, idx: number) => (
                      <React.Fragment key={idx}>
                        {Object.values(section).map((list: any, i: number) => (
                          <React.Fragment key={i}>
                            {list.map((item: string, j: number) => (
                              <li key={j}>{renderTextWithLinks(item)}</li>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              )}

              {position.detail?.management_examples && position.detail.management_examples.length > 0 && (
                <div style={{ marginTop: '1rem' }}>
                  <h5 style={{ color: 'var(--color-secondary-accent)', marginBottom: '0.5rem' }}>
                    Management Highlights:
                  </h5>
                  <ul className="cyber-list">
                    {position.detail.management_examples.map((section: any, idx: number) => (
                      <React.Fragment key={idx}>
                        {Object.values(section).map((list: any, i: number) => (
                          <React.Fragment key={i}>
                            {list.map((item: string, j: number) => (
                              <li key={j}>{renderTextWithLinks(item)}</li>
                            ))}
                          </React.Fragment>
                        ))}
                      </React.Fragment>
                    ))}
                  </ul>
                </div>
              )}

              {position.detail?.tech && Object.keys(position.detail.tech).length > 0 && (
                <div className="tech-tags">
                  {Object.entries(position.detail.tech).map(([_category, techList]: [string, any], idx: number) => (
                    <React.Fragment key={idx}>
                      {(Array.isArray(techList) ? techList : techList.split(', ')).map((tech: string, i: number) => (
                        <span key={i} className="tech-tag">{tech.trim()}</span>
                      ))}
                    </React.Fragment>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default WorkExperienceCard;
