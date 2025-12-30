import React from 'react';
import { FaGithub, FaStar, FaExternalLinkAlt } from 'react-icons/fa';
import { renderTextWithLinks } from '../utils/markdownLink';

interface ProjectCardProps {
  project: any; // Can refine interface later
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project }) => {
  return (
    <div className="glass-card glass-card-hover">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
        <h3 style={{ margin: 0 }}>
          {project.name}
        </h3>
        {project.github_stars !== undefined && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem', color: 'var(--color-secondary-accent)' }}>
            <FaStar size={14} />
            <span>{project.github_stars}</span>
          </div>
        )}
      </div>

      {project.category && (
        <p style={{ fontSize: '0.85rem', color: 'var(--color-secondary-accent)', marginTop: '0.25rem' }}>
          {project.category}
        </p>
      )}

      <p style={{ marginTop: '0.75rem' }}>{renderTextWithLinks(project.description)}</p>

      {project.highlights && project.highlights.length > 0 && (
        <ul style={{ marginTop: '0.75rem', fontSize: '0.9rem' }}>
          {project.highlights.map((highlight: string, i: number) => (
            <li key={i}>{highlight}</li>
          ))}
        </ul>
      )}

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
        {project.url && (
          <a
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-link"
            style={{ fontSize: '0.9rem' }}
          >
            <FaGithub size={16} />
            GitHub
          </a>
        )}
        {project.demo_url && (
          <a
            href={project.demo_url}
            target="_blank"
            rel="noopener noreferrer"
            className="profile-link"
            style={{ fontSize: '0.9rem' }}
          >
            <FaExternalLinkAlt size={14} />
            Live Demo
          </a>
        )}
      </div>

      {project.technologies && project.technologies.length > 0 && (
        <div className="tech-tags" style={{ marginTop: '1rem' }}>
          {project.technologies.map((tech: string, i: number) => (
            <span key={i} className="tech-tag">{tech}</span>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProjectCard;
