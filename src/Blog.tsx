import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaCalendar, FaTag, FaClock, FaCube, FaFeatherAlt } from 'react-icons/fa';
import demoBlogDataRaw from './blog.json';

const DifficultyIcon: React.FC<{ difficulty?: 'hard' | 'soft'; className?: string }> = ({ difficulty, className = '' }) => {
  if (!difficulty) return null;

  if (difficulty === 'hard') {
    return <FaCube className={className} title="Hard topic" />;
  }
  return <FaFeatherAlt className={className} title="Soft topic" />;
};

type FeaturedImage = string | {
  path: string;
  tint?: string;
};

interface BlogPost {
  slug: string;
  title: string;
  date: string;
  tags: string[];
  excerpt: string;
  featured_image?: FeaturedImage;
  author: string;
  draft: boolean;
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

const demoBlogData = demoBlogDataRaw as BlogData;

const Blog: React.FC = () => {
  const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
  const [searchParams, setSearchParams] = useSearchParams();
  const [blogData, setBlogData] = useState<BlogData>(demoBlogData);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize filter state from URL params, falling back to localStorage
  const [selectedYear, setSelectedYear] = useState<number | null>(() => {
    const urlYear = searchParams.get('year');
    if (urlYear) return parseInt(urlYear, 10);
    const saved = localStorage.getItem('blogSelectedYear');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedMonth, setSelectedMonth] = useState<number | null>(() => {
    const urlMonth = searchParams.get('month');
    if (urlMonth) return parseInt(urlMonth, 10);
    const saved = localStorage.getItem('blogSelectedMonth');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedTag, setSelectedTag] = useState<string | null>(() => {
    const urlTag = searchParams.get('tag');
    if (urlTag) return urlTag;
    const saved = localStorage.getItem('blogSelectedTag');
    return saved ? JSON.parse(saved) : null;
  });
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(() => {
    const urlDifficulty = searchParams.get('difficulty');
    if (urlDifficulty) return urlDifficulty;
    const saved = localStorage.getItem('blogSelectedDifficulty');
    return saved ? JSON.parse(saved) : null;
  });

  // Update URL params and localStorage when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (selectedYear !== null) params.set('year', selectedYear.toString());
    if (selectedMonth !== null) params.set('month', selectedMonth.toString());
    if (selectedTag !== null) params.set('tag', selectedTag);
    if (selectedDifficulty !== null) params.set('difficulty', selectedDifficulty);

    setSearchParams(params, { replace: true });

    localStorage.setItem('blogSelectedYear', JSON.stringify(selectedYear));
    localStorage.setItem('blogSelectedMonth', JSON.stringify(selectedMonth));
    localStorage.setItem('blogSelectedTag', JSON.stringify(selectedTag));
    localStorage.setItem('blogSelectedDifficulty', JSON.stringify(selectedDifficulty));
  }, [selectedYear, selectedMonth, selectedTag, selectedDifficulty, setSearchParams]);

  // Restore scroll position
  useEffect(() => {
    const savedScrollY = localStorage.getItem('blogScrollY');
    if (savedScrollY) {
      window.scrollTo(0, parseInt(savedScrollY, 10));
    }
  }, []);

  // Save scroll position before navigating away
  useEffect(() => {
    const handleScroll = () => {
      localStorage.setItem('blogScrollY', window.scrollY.toString());
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  // Filter out draft posts
  const publishedPosts = blogData.posts.filter(post => !post.draft);

  // Extract unique years and months from posts
  const postsByDate = React.useMemo(() => {
    const dateMap = new Map<number, Map<number, BlogPost[]>>();

    publishedPosts.forEach(post => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (!dateMap.has(year)) {
        dateMap.set(year, new Map());
      }
      const yearMap = dateMap.get(year)!;
      if (!yearMap.has(month)) {
        yearMap.set(month, []);
      }
      yearMap.get(month)!.push(post);
    });

    return dateMap;
  }, [publishedPosts]);

  // Get all unique tags
  const allTags = React.useMemo(() => {
    const tags = new Set<string>();
    publishedPosts.forEach(post => {
      post.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [publishedPosts]);

  // Filter posts based on selected filters
  const filteredPosts = React.useMemo(() => {
    return publishedPosts.filter(post => {
      const date = new Date(post.date);
      const year = date.getFullYear();
      const month = date.getMonth();

      if (selectedYear !== null && year !== selectedYear) return false;
      if (selectedMonth !== null && month !== selectedMonth) return false;
      if (selectedTag !== null && !post.tags.includes(selectedTag)) return false;
      if (selectedDifficulty !== null && post.difficulty !== selectedDifficulty) return false;

      return true;
    });
  }, [publishedPosts, selectedYear, selectedMonth, selectedTag, selectedDifficulty]);

  // Sort years in descending order
  const years = Array.from(postsByDate.keys()).sort((a, b) => b - a);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const clearFilters = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedTag(null);
    setSelectedDifficulty(null);
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl ml-8 p-6">
        <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue text-light-slate p-8">
          <p>Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl ml-8 p-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar with Calendar Navigation */}
        <aside className="lg:col-span-1">
          <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-4 sticky top-24">
            <h2 className="font-sans text-xl font-bold text-light-slate mb-4 flex items-center gap-2">
              <FaCalendar className="text-accent" />
              Archive
            </h2>

            {/* Year/Month Navigation */}
            <div className="space-y-2 mb-6">
              {years.map(year => {
                const yearMap = postsByDate.get(year)!;
                const months = Array.from(yearMap.keys()).sort((a, b) => b - a);

                return (
                  <div key={year} className="mb-3">
                    <button
                      onClick={() => {
                        setSelectedYear(selectedYear === year ? null : year);
                        setSelectedMonth(null);
                      }}
                      className={`w-full text-left px-3 py-2 rounded transition-colors ${
                        selectedYear === year
                          ? 'bg-accent text-dark-blue font-semibold'
                          : 'text-light-slate hover:bg-light-blue/10'
                      }`}
                    >
                      {year} ({Array.from(yearMap.values()).reduce((sum, posts) => sum + posts.length, 0)})
                    </button>

                    {selectedYear === year && (
                      <div className="ml-4 mt-2 space-y-1">
                        {months.map(month => {
                          const posts = yearMap.get(month)!;
                          return (
                            <button
                              key={month}
                              onClick={() => setSelectedMonth(selectedMonth === month ? null : month)}
                              className={`w-full text-left px-3 py-1 rounded text-sm transition-colors ${
                                selectedMonth === month
                                  ? 'bg-accent/80 text-dark-blue font-semibold'
                                  : 'text-light-slate hover:bg-light-blue/10'
                              }`}
                            >
                              {monthNames[month]} ({posts.length})
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Difficulty Filter */}
            <div className="border-t border-light-blue/30 pt-4">
              <h3 className="font-sans text-lg font-bold text-light-slate mb-3">Difficulty</h3>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => setSelectedDifficulty(selectedDifficulty === 'hard' ? null : 'hard')}
                  className={`px-3 py-2 rounded text-sm transition-colors text-left flex items-center gap-2 ${
                    selectedDifficulty === 'hard'
                      ? 'bg-accent text-dark-blue font-semibold'
                      : 'bg-light-blue/10 text-light-slate hover:bg-light-blue/20'
                  }`}
                >
                  <FaCube />
                  Hard (Technical)
                </button>
                <button
                  onClick={() => setSelectedDifficulty(selectedDifficulty === 'soft' ? null : 'soft')}
                  className={`px-3 py-2 rounded text-sm transition-colors text-left flex items-center gap-2 ${
                    selectedDifficulty === 'soft'
                      ? 'bg-accent text-dark-blue font-semibold'
                      : 'bg-light-blue/10 text-light-slate hover:bg-light-blue/20'
                  }`}
                >
                  <FaFeatherAlt />
                  Soft (People)
                </button>
              </div>
            </div>

            {/* Tag Filter */}
            <div className="border-t border-light-blue/30 pt-4 mt-4">
              <h3 className="font-sans text-lg font-bold text-light-slate mb-3 flex items-center gap-2">
                <FaTag className="text-accent" />
                Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
                    className={`px-3 py-1 rounded-full text-sm transition-colors ${
                      selectedTag === tag
                        ? 'bg-accent text-dark-blue font-semibold'
                        : 'bg-light-blue/10 text-light-slate hover:bg-light-blue/20'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedYear !== null || selectedMonth !== null || selectedTag !== null || selectedDifficulty !== null) && (
              <button
                onClick={clearFilters}
                className="w-full mt-4 px-3 py-2 bg-accent/20 hover:bg-accent/30 text-accent rounded transition-colors text-sm font-semibold"
              >
                Clear Filters
              </button>
            )}
          </div>
        </aside>

        {/* Main Content - Blog Posts List */}
        <main className="lg:col-span-3">
          <h1 className="font-sans text-3xl font-bold text-light-slate mb-6">Blog Posts</h1>

          {filteredPosts.length === 0 ? (
            <div className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-8 text-center">
              <p className="text-light-slate">No posts found matching the selected filters.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredPosts.map(post => (
                <article
                  key={post.slug}
                  className="bg-dark-blue rounded-lg shadow-lg border border-light-blue p-6 hover:border-accent transition-colors"
                >
                  <Link to={`/blog/${post.slug}`} className="group">
                    <h2 className="font-sans text-2xl font-bold text-light-slate mb-3 group-hover:text-accent transition-colors">
                      {post.title}
                    </h2>
                  </Link>

                  <div className="flex flex-wrap items-center gap-3 text-sm text-light-slate/70 mb-4">
                    <span className="flex items-center gap-1">
                      <FaClock />
                      {formatDate(post.date)}
                    </span>
                    <span>•</span>
                    <span>by {post.author}</span>
                    {post.difficulty && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <DifficultyIcon difficulty={post.difficulty} className="text-accent" />
                          <span className="capitalize">{post.difficulty}</span>
                        </span>
                      </>
                    )}
                    {post.tags.length > 0 && post.tags.map(tag => (
                      <React.Fragment key={tag}>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <FaTag className="text-accent text-xs" />
                          <span>{tag}</span>
                        </span>
                      </React.Fragment>
                    ))}
                  </div>

                  {post.excerpt && (
                    <p className="text-light-slate mb-4">{post.excerpt}</p>
                  )}

                  <Link
                    to={`/blog/${post.slug}`}
                    className="inline-block text-accent hover:text-accent/80 font-semibold transition-colors"
                  >
                    Read more →
                  </Link>
                </article>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Blog;
