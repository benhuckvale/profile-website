# Profile Website

A modern, cyberpunk-themed profile website built with React, TypeScript, and Vite. Displays career history, skills, education, and projects with an interactive interface.

**Live Site**: https://ben.huckvale.dev

---

## Overview

This is a **person-agnostic** website template that displays professional profile data. The actual content is fetched from the private [my-career-data](https://github.com/benhuckvale/my-career-data) repository during deployment, keeping the website code public while the data remains private.

---

## Features

- 🎨 Cyberpunk-themed design with neon accents and glow effects
- 📱 Fully responsive layout
- 🔍 Interactive skill filtering
- 💼 Detailed work experience cards with expandable sections
- 🎓 Education and project showcases
- 🖼️ Automatic fallback to initials avatar if portrait is missing
- ⚡ Fast Vite-based build system
- 🔄 React Router for client-side routing (`/profile`, `/blog`)

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/benhuckvale/profile-website.git
   cd profile-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. Open http://localhost:5173

### Demo Data

For local development, the project includes **demo data** (`src/profile.json`) with example content for "Jane Doe". This allows you to:
- Work on the website without needing production data
- See the full structure and styling
- Test features locally

**Important**: This demo data is **replaced automatically** during the deployment pipeline with real data from `my-career-data` releases.

---

## Deployment Architecture

### Staging vs Production

This project uses a **dual-environment deployment strategy**:

| Environment | Platform | Base Path | URL | Purpose |
|-------------|----------|-----------|-----|---------|
| **Staging** | GitHub Pages | `/profile-website` | `benhuckvale.github.io/profile-website` | Testing and preview |
| **Production** | Cloudflare Pages | `/` | `ben.huckvale.dev` | Live site |

### Workflow

```
┌─────────────────────────────────────────────────────────┐
│  Push to main branch                                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: build-deploy job                       │
│  • Fetch latest data from my-career-data releases      │
│  • Build with VITE_BASE_PATH=/profile-website          │
│  • Deploy to GitHub Pages (staging)                    │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Review staging site                                     │
│  https://benhuckvale.github.io/profile-website          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼ (Manual trigger)
┌─────────────────────────────────────────────────────────┐
│  GitHub Actions: deploy-production job                  │
│  • Fetch latest data from my-career-data releases      │
│  • Build with VITE_BASE_PATH=/                         │
│  • Deploy to Cloudflare Pages (production)             │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│  Live at https://ben.huckvale.dev                       │
└─────────────────────────────────────────────────────────┘
```

**Key Principles:**
- **Automatic staging**: Every push to `main` deploys to staging automatically
- **Manual production**: Production deployment requires manual workflow trigger and approval
- **Different base paths**: Each environment builds with appropriate base path for its hosting
- **Same codebase**: Both environments use identical code, just different build configuration

---

## Deployment

### GitHub Pages (Staging)

**Automatic deployment on every push to `main`:**

1. GitHub Actions workflow triggers on push
2. Fetches latest `profile.json` and `portrait.jpeg` from `my-career-data` releases
3. Builds with `VITE_BASE_PATH=/profile-website`
4. Deploys to GitHub Pages

**Access**: https://benhuckvale.github.io/profile-website

### Cloudflare Pages (Production)

**Manual deployment with approval:**

1. Go to GitHub Actions → "Build & Deploy" workflow
2. Click "Run workflow" → Select `main` branch
3. Approve the production deployment when prompted
4. Workflow builds with `VITE_BASE_PATH=/` and deploys to Cloudflare Pages

**Access**: https://ben.huckvale.dev

**Custom Domain Setup:**

The production site is deployed to Cloudflare Pages with custom domain `ben.huckvale.dev`:

1. Cloudflare Pages project: `profile-website`
2. Custom domain: `ben.huckvale.dev` (CNAME → `profile-website-xxx.pages.dev`)
3. DNS managed by Cloudflare
4. SSL/TLS automatically provisioned

### Naming Convention

To maintain consistency across platforms:

| Platform | Name | Reason |
|----------|------|--------|
| GitHub repo | `profile-website` | Source code repository |
| Cloudflare project | `profile-website` | Matches GitHub repo name |
| Domain path | `/profile` | User-facing route (via React Router) |

This pattern allows multiple projects to coexist:
- `ben.huckvale.dev/profile` - This website
- `ben.huckvale.dev/blog` - Future blog (same React app, different route)
- `ben.huckvale.dev/` - Redirects to `/profile`

---

## Project Structure

```
profile-website/
├── src/
│   ├── components/          # React components
│   │   ├── WorkExperienceCard.tsx
│   │   ├── EducationCard.tsx
│   │   └── ProjectCard.tsx
│   ├── profile.json         # Demo data (Jane Doe) - local dev only
│   ├── Profile.tsx          # Main profile page component
│   ├── Blog.tsx             # Blog page component
│   ├── App.tsx              # React Router configuration
│   └── main.tsx
├── public/                  # Static assets (populated during build)
│   ├── profile.json         # Production data (from my-career-data)
│   └── portrait.jpeg        # Portrait image (from my-career-data)
├── .github/
│   └── workflows/
│       └── deploy.yml       # Dual-environment deployment workflow
├── vite.config.ts           # Vite build configuration
└── package.json
```

---

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

---

## Routing

The website uses **React Router** for client-side navigation:

```tsx
Routes:
  / → <Navigate to="/profile" />   (redirects to /profile)
  /profile → <Profile />            (main profile page)
  /blog → <Blog />                  (blog page)
```

### Base Path Handling

The app uses `import.meta.env.BASE_URL` to handle different base paths:

- **Staging** (`VITE_BASE_PATH=/profile-website`):
  - Routes: `/profile-website/profile`, `/profile-website/blog`
  - Assets: `/profile-website/assets/...`

- **Production** (`VITE_BASE_PATH=/`):
  - Routes: `/profile`, `/blog`
  - Assets: `/assets/...`

React Router's `basename` prop handles the base path automatically.

---

## Common Issues & Solutions

### Issue: Blank page at `/profile` route

**Cause**: Route not defined in `App.tsx` or missing `<Route path="/profile" />`

**Solution**: Ensure routes are properly configured:
```tsx
<Routes>
  <Route path="/" element={<Navigate to="/profile" replace />} />
  <Route path="/profile" element={<Profile />} />
  <Route path="/blog" element={<Blog />} />
</Routes>
```

### Issue: Assets failing to load (CSS/JS showing as text/html MIME type)

**Cause**: Double-slash in asset URLs when `VITE_BASE_PATH=/` (e.g., `//profile.json`)

**Solution**: Strip trailing slash from `BASE_URL`:
```tsx
const baseUrl = import.meta.env.BASE_URL.replace(/\/$/, '');
fetch(`${baseUrl}/profile.json`);
```

### Issue: "Using demo data (production data not available)"

**Cause**: `profile.json` not accessible at runtime (fetch failed)

**Solution**:
1. Check browser console for exact fetch error
2. Verify `public/profile.json` exists in build output (`dist/`)
3. Ensure deployment workflow successfully downloads data from releases
4. Check that files are served correctly (visit `/profile.json` directly)

### Issue: GitHub Pages shows wrong base path

**Cause**: `VITE_BASE_PATH` not set correctly for staging build

**Solution**: Staging build must use `VITE_BASE_PATH=/profile-website`
```yaml
env:
  VITE_BASE_PATH: /profile-website
```

### Issue: Cloudflare deployment succeeds but shows demo data

**Cause**: Data fetch step failed silently in workflow

**Solution**: Check GitHub Actions logs for `deploy-production` job:
1. Go to Actions → Latest workflow run
2. Check "Fetch latest profile data" step
3. Verify `profile.json` and `portrait.jpeg` downloaded successfully
4. Ensure `PAT_FOR_PRIVATE_REPO` secret has access to private repo

---

## Data Format

The website expects data in the following structure:

```json
{
  "personal": {
    "name": { "first": "...", "last": "..." },
    "email": "...",
    "vague_address": { "text": "..." },
    "linkedin": { "url": "...", "text": "..." },
    "github": { "url": "...", "text": "..." }
  },
  "statement": {
    "formal": "Professional bio..."
  },
  "work": [...],
  "education": [...],
  "skills": [...],
  "projects": [...]
}
```

See `src/profile.json` for a complete example with demo data.

---

## Customization

### Using This Template for Your Own Profile

This website is designed to be reusable. To use it for your own profile:

1. **Fork this repository**
2. **Set up your own data source** (e.g., `my-career-data` repository with releases)
3. **Update workflow** (`.github/workflows/deploy.yml`):
   - Change repo name in data fetch step
   - Update secrets (`PAT_FOR_PRIVATE_REPO`)
   - Update Cloudflare project name
4. **Configure Cloudflare Pages**:
   - Create project matching your repo name
   - Add custom domain
   - Set `CLOUDFLARE_API_TOKEN` secret in GitHub
5. **Customize styling** in `src/styles/` and Tailwind config

The website automatically adapts to the data structure defined by [career-toolkit](https://github.com/benhuckvale/career-toolkit).

---

## Styling & Theme

The website uses a **cyberpunk theme** with:
- Neon blue and cyan accents
- Dark background with subtle effects
- Glow effects on interactive elements
- Tailwind CSS for utility-first styling
- Custom fonts: Orbitron for headings, Inter for body text

---

## Privacy & Security

- ✅ Website code is **public** (open source)
- ✅ Actual career data is **private** (in `my-career-data` repo)
- ✅ Data is fetched during build, not committed to repo
- ✅ Demo data clearly marked as example content
- ✅ Production deployment requires manual approval

The separation of code (public) and data (private) allows you to:
- Share the website template
- Keep sensitive information private
- Update data without touching the website code
- Control exactly what data appears on the public site

---

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS + custom CSS
- **Icons**: React Icons (Font Awesome, Simple Icons)
- **Deployment**:
  - Staging: GitHub Actions + GitHub Pages
  - Production: GitHub Actions + Cloudflare Pages (via Wrangler)

---

## GitHub Secrets Configuration

The deployment workflow requires these secrets:

| Secret | Purpose | Scope |
|--------|---------|-------|
| `PAT_FOR_PRIVATE_REPO` | Access to private `my-career-data` releases | Both staging and production |
| `CLOUDFLARE_API_TOKEN` | Deploy to Cloudflare Pages | Production only |
| `GITHUB_TOKEN` | Deploy to GitHub Pages | Auto-provided by GitHub |

**To set up:**
```bash
# Add secrets via GitHub CLI
cd profile-website
gh secret set CLOUDFLARE_API_TOKEN  # Paste token when prompted
gh secret set PAT_FOR_PRIVATE_REPO  # Paste token when prompted

# Or via GitHub web UI: Settings → Secrets and variables → Actions
```

---

## Contributing

This is a personal profile website template. Feel free to:
- Fork for your own use
- Report bugs via Issues
- Suggest improvements via Pull Requests

---

## License

MIT License - Feel free to use this template for your own profile!

---

## Related Projects

- [my-career-data](https://github.com/benhuckvale/my-career-data) - Private repository with career data
- [career-toolkit](https://github.com/benhuckvale/career-toolkit) - Python library for transforming career data into multiple formats
