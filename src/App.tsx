import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaUser, FaFileAlt } from 'react-icons/fa';
import Profile from './Profile';
import Blog from './Blog';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background-page/80 border-b border-primary-accent/30">
      <ul className="flex justify-start gap-8 py-4 ml-8">
        <li>
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
          >
            <FaUser style={{ display: 'inline', marginRight: '0.5rem' }} />
            Profile
          </Link>
        </li>
        <li>
          <Link
            to="/blog"
            className={`nav-link ${location.pathname === '/blog' ? 'nav-link-active' : ''}`}
          >
            <FaFileAlt style={{ display: 'inline', marginRight: '0.5rem' }} />
            Blog
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
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