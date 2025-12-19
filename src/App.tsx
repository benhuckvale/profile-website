import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import Profile from './Profile';
import Blog from './Blog';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background-page/80 border-b border-primary-accent/30">
      <ul className="flex justify-center gap-8 py-4">
        <li>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
          >
            👤 Profile
          </Link>
        </li>
        <li>
          <Link
            to="/blog"
            className={`nav-link ${location.pathname === '/blog' ? 'nav-link-active' : ''}`}
          >
            📝 Blog
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <main>
          <Routes>
            <Route path="/" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;