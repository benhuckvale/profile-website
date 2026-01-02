# Profile Website

A modern, cyberpunk-themed profile website built with React, TypeScript, and Vite. Displays career history, skills, education, and projects with a clean, interactive interface.

---

## Overview

This is a **person-agnostic** website template that displays professional profile data. The actual content is fetched from the private [my-career-data](https://github.com/benhuckvale/my-career-data) repository during deployment, keeping the website code public while the data remains private.

**Live Site**: [Your deployed URL here]

---

## Features

- 🎨 Cyberpunk-themed design with neon accents and glow effects
- 📱 Fully responsive layout
- 🔍 Interactive skill filtering
- 💼 Detailed work experience cards with expandable sections
- 🎓 Education and project showcases
- 🖼️ Automatic fallback to initials avatar if portrait is missing
- ⚡ Fast Vite-based build system

---

## Local Development

### Prerequisites

- Node.js 20+
- npm or yarn
- GitHub CLI (`gh`) - for fetching content from releases

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

## How It Works

### Development vs Production

| Environment | Data Source | Purpose |
|-------------|-------------|---------|
| **Local Dev** | `src/profile.json` (Jane Doe demo) | Development and testing |
| **Production** | Fetched from `my-career-data` releases | Real data |

### Deployment Pipeline

When the site is deployed:

1. GitHub Actions workflow triggers
2. Fetches latest release from `my-career-data` repository
3. Downloads `profile.json` and `portrait.jpeg`
4. Places them in `public/` directory
5. Builds the website with real data
6. Deploys to GitHub Pages

The demo data in `src/profile.json` is **not used** in production - it's purely for local development.

---

## Project Structure

```
profile-website/
├── src/
│   ├── components/          # React components
│   │   ├── WorkExperienceCard.tsx
│   │   ├── EducationCard.tsx
│   │   └── ProjectCard.tsx
│   ├── styles/
│   │   ├── cyberpunk-theme.css
│   │   └── index.css
│   ├── profile.json         # Demo data (Jane Doe)
│   ├── Profile.tsx          # Main profile component
│   ├── App.tsx
│   └── main.tsx
├── public/
│   ├── assets/
│   │   └── portrait.jpeg    # Portrait (fetched during deployment)
│   └── profile.json         # Production data (fetched during deployment)
├── .github/
│   └── workflows/
│       └── deploy.yml       # Deployment workflow
└── package.json
```

---

## Available Scripts

### Development

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build locally
npm run lint         # Run ESLint
```

### Content Management

```bash
npm run fetch-content   # Download latest profile data from my-career-data releases
```

This command fetches the latest `profile.json` and `portrait.jpeg` from the private `my-career-data` repository. Useful for testing with real data locally.

**Note**: Requires authentication to access private repository releases.

---

## Customization

### Using This Template for Your Own Profile

This website is designed to be reusable. To use it for your own profile:

1. Fork this repository
2. Set up your own `my-career-data` repository (or similar data source)
3. Update the workflow to fetch from your data repository
4. Customize colors and styling in `src/styles/cyberpunk-theme.css`
5. Update deployment target in `.github/workflows/deploy.yml`

The website automatically adapts to the data structure defined by [career-toolkit](https://github.com/benhuckvale/career-toolkit).

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

See `src/profile.json` for a complete example.

---

## Styling & Theme

The website uses a **cyberpunk theme** with:
- Neon blue and cyan accents (`--color-primary-accent`, `--color-secondary-accent`)
- Dark background with subtle grid patterns
- Glow effects on interactive elements
- Custom fonts: Orbitron for headings, Inter for body text

To customize the theme, edit CSS variables in `src/styles/cyberpunk-theme.css`.

---

## Deployment

### GitHub Pages (Recommended)

The project is configured to deploy to GitHub Pages automatically:

1. Push changes to `main` branch
2. GitHub Actions workflow runs
3. Fetches latest data from `my-career-data`
4. Builds and deploys to `gh-pages` branch

**Setup**:
1. Go to repository Settings → Pages
2. Source: Deploy from branch
3. Branch: `gh-pages`, folder: `/` (root)

### Other Hosting

The built site (in `dist/`) can be deployed to:
- Vercel
- Netlify
- Cloudflare Pages
- Any static hosting service

---

## Privacy & Security

- ✅ Website code is **public** (open source)
- ✅ Actual career data is **private** (in my-career-data repo)
- ✅ Data is fetched during build, not exposed in source
- ✅ Demo data clearly marked as "[Obviously Not Real]"

The separation of code (public) and data (private) allows you to:
- Share the website template
- Keep very rich information in a private repo, and fetch only the subset needed for the profile website.
- Update data without touching the website code

---

## Tech Stack

- **Framework**: React 19
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: CSS with custom cyberpunk theme
- **Icons**: React Icons (Font Awesome, Simple Icons)
- **Deployment**: GitHub Actions + GitHub Pages

---

## Troubleshooting

### "Profile not found" or missing data

**Cause**: `profile.json` not loaded correctly

**Fix**:
```bash
# For local dev, demo data should work automatically
npm run dev

# To test with real data locally
npm run fetch-content
```

### Portrait not showing

**Cause**: Image file missing or incorrect path

**Fix**: The website automatically shows initials (e.g., "JD") if portrait is missing. This is expected behavior during development.

### Build fails in GitHub Actions

**Cause**: Unable to fetch data from my-career-data

**Fix**:
1. Verify `PAT_FOR_PRIVATE_REPO` secret is set
2. Check token has access to my-career-data repository
3. Ensure my-career-data has published releases

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

- [my-career-data](https://github.com/benhuckvale/my-career-data) - Private repository with career data (YAML format)
- [career-toolkit](https://github.com/benhuckvale/career-toolkit) - Python library for transforming career data into multiple formats

---

**Author**: Ben Huckvale
**Contact**: [LinkedIn](https://linkedin.com/in/ben-huckvale) | [GitHub](https://github.com/benhuckvale)

---

*This website is built with the philosophy of separating code from content, allowing the template to be open source while keeping personal data private.*
