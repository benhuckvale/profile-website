import React from 'react';
import { renderTextWithLinks } from '../utils/markdownLink';

interface EducationCardProps {
  edu: any; // Can refine interface later
}

const EducationCard: React.FC<EducationCardProps> = ({ edu }) => {
  return (
    <div className="glass-card glass-card-hover">
      <h3>
        {edu.qualification}
      </h3>
      <h4 className="neon-glow-cyan">{edu.institution}</h4>
      <div className="date-location">
        <span>{edu.start} - {edu.end}</span>
        {edu.location && <span>{edu.location}</span>}
      </div>
      {edu.detail?.formal && <p>{renderTextWithLinks(edu.detail.formal)}</p>}
    </div>
  );
};

export default EducationCard;
