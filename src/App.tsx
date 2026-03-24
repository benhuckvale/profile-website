import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { FaUser, FaFileAlt, FaRobot } from 'react-icons/fa';
import Profile from './Profile';
import Blog from './Blog';
import BlogPost from './BlogPost';
import Twin from './Twin';
import Footer from './components/Footer';

function Navigation() {
  const location = useLocation();

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-background-page/80 border-b border-primary-accent/30">
      <ul className="flex justify-start gap-8 py-4 ml-8">
        <li>
          <Link
            to="/profile"
            className={`nav-link ${location.pathname === '/profile' ? 'nav-link-active' : ''}`}
          >
            <FaUser style={{ display: 'inline', marginRight: '0.5rem' }} />
            Profile
          </Link>
        </li>
        <li>
          <Link
            to="/blog"
            className={`nav-link ${location.pathname.startsWith('/blog') ? 'nav-link-active' : ''}`}
          >
            <FaFileAlt style={{ display: 'inline', marginRight: '0.5rem' }} />
            Blog
          </Link>
        </li>
        <li>
          <Link
            to="/twin"
            className={`nav-link ${location.pathname === '/twin' ? 'nav-link-active' : ''}`}
          >
            <FaRobot style={{ display: 'inline', marginRight: '0.5rem' }} />
            Digital Twin
          </Link>
        </li>
      </ul>
    </nav>
  );
}

function App() {
  return (
    <Router basename={import.meta.env.BASE_URL}>
      <div className="min-h-screen flex flex-col">
        <Navigation />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Navigate to="/profile" replace />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/twin" element={<Twin />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;