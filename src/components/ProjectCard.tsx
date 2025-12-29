import React from 'react';
import { renderTextWithLinks } from '../utils/markdownLink';

interface ProjectCardProps {
  project: any; // Can refine interface later
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="glass-card glass-card-hover">
      <h3>
        <a
          href={project.url}
          target="_blank"
          rel="noopener noreferrer"
          className="neon-glow-cyan"
          style={{ textDecoration: 'none' }}
        >
          {project.name}
        </a>
      </h3>
      <p>{renderTextWithLinks(project.description)}</p>
      {project.technologies && project.technologies.length > 0 && (
        <div className="tech-tags">
          {project.technologies.map((tech: string, i: number) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
