import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { FaClock, FaTag, FaArrowLeft, FaUser, FaCube, FaFeatherAlt } from 'react-icons/fa';
import demoBlogData from './blog.json';

const DifficultyIcon: React.FC<{ difficulty?: 'hard' | 'soft'; className?: string }> = ({ difficulty, className = '' }) => {
  if (!difficulty) return null;

  if (difficulty === 'hard') {
    return <FaCube className={className} title="Hard topic" />;
  }
  return <FaFeatherAlt className={className} title="Soft topic" />;
};

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  featured_image?: string;
  content_html: string;
  content_raw: string;
  draft: boolean;
  author: string;
  difficulty?: 'hard' | 'soft';
}

interface BlogData {
  posts: BlogPost[];
  metadata: {
    total_posts: number;
    generated_at: string;
    version: string;
  };
}

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const [blogData, setBlogData] = useState<BlogData>(demoBlogData);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch production data, fallback to demo data
  useEffect(() => {
    fetch(`${baseUrl}/blog.json`)
      .then(res => res.json())
      .then(data => {
        setBlogData(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.log('Using demo blog data (production data not available):', err);
        setBlogData(demoBlogData);
        setIsLoading(false);
      });
  }, [baseUrl]);

  const post = blogData.posts.find(p => p.slug === slug);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-8">
          <p className="text-light-slate">Loading post...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-8">
          <h1 className="font-sans text-2xl font-bold text-light-slate mb-4">Post Not Found</h1>
          <p className="text-light-slate mb-4">The blog post you're looking for doesn't exist.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            <FaArrowLeft />
            Back
          </Link>
        </div>
      </div>
    );
  }

  if (post.draft) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-8">
          <h1 className="font-sans text-2xl font-bold text-light-slate mb-4">Draft Post</h1>
          <p className="text-light-slate mb-4">This post is still in draft and not available for viewing.</p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors"
          >
            <FaArrowLeft />
            Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      {/* Back Button */}
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors mb-6"
      >
        <FaArrowLeft />
        Back to Blog
      </button>

      {/* Blog Post Content */}
      <article className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-8">
        {/* Header */}
        <header className="mb-8 border-b border-light-blue/30 pb-6">
          <h1 className="font-sans text-4xl font-bold text-light-slate mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-3 text-sm text-light-slate/70">
            <span className="flex items-center gap-1">
              <FaClock className="text-accent" />
              {formatDate(post.date)}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <FaUser className="text-accent" />
              {post.author}
            </span>
            {post.difficulty && (
              <>
                <span>•</span>
                <Link
                  to={`/blog?difficulty=${post.difficulty}`}
                  className="flex items-center gap-1 hover:text-accent transition-colors"
                >
                  <DifficultyIcon difficulty={post.difficulty} className="text-accent" />
                  <span className="capitalize">{post.difficulty}</span>
                </Link>
              </>
            )}
            {post.tags.length > 0 && (
              <>
                <span>•</span>
                {post.tags.map((tag) => (
                  <React.Fragment key={tag}>
                    <Link
                      to={`/blog?tag=${tag}`}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-light-blue/10 text-accent rounded-full hover:bg-light-blue/20 transition-colors"
                    >
                      <FaTag className="text-xs" />
                      {tag}
                    </Link>
                  </React.Fragment>
                ))}
              </>
            )}
          </div>
        </header>

        {/* Featured Image */}
        {post.featured_image && (
          <div className="mb-8">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full rounded-lg border border-light-blue/30"
            />
          </div>
        )}

        {/* Post Content */}
        <div
          className="prose prose-invert prose-slate max-w-none
                     prose-headings:text-light-slate prose-headings:font-bold
                     prose-h1:text-3xl prose-h1:mb-6 prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-xl
                     prose-p:text-light-slate prose-p:leading-relaxed prose-p:mb-4
                     prose-a:text-blue-400 prose-a:underline hover:prose-a:text-blue-300
                     prose-strong:text-light-slate prose-strong:font-semibold
                     prose-code:text-accent prose-code:bg-light-blue/10 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                     prose-pre:bg-light-blue/10 prose-pre:border prose-pre:border-light-blue/30
                     prose-ul:text-light-slate prose-ul:my-4 prose-ol:text-light-slate prose-ol:my-4
                     prose-li:text-light-slate
                     prose-blockquote:border-l-accent prose-blockquote:text-light-slate/80"
          dangerouslySetInnerHTML={{ __html: post.content_html }}
        />
      </article>

      {/* Back Button at Bottom */}
      <button
        onClick={() => navigate('/blog')}
        className="inline-flex items-center gap-2 text-accent hover:text-accent/80 font-semibold transition-colors mt-6"
      >
        <FaArrowLeft />
        Back to Blog
      </button>
    </div>
  );
};

export default BlogPost;
