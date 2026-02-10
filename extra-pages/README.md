# Extra Pages

Standalone HTML pages that are deployed alongside the main React app.

## Structure

```
extra-pages/
├── README.md                    # This file
├── shared/                      # Shared resources (optional)
│   ├── styles.css              # Common styles
│   └── scripts.js              # Common scripts
└── think-for-yourself/          # Each page in its own directory
    └── index.html              # Accessible at /think-for-yourself/
```

## Adding a New Page

1. Create a new directory under `extra-pages/`
2. Add an `index.html` file (or any HTML file)
3. The page will be accessible at `/{directory-name}/`
4. Run `npm run build` to copy pages to `dist/`

## Shared Resources

If multiple pages need common CSS/JS:
- Put shared files in `extra-pages/shared/`
- Reference them with relative paths: `../shared/styles.css`

## Examples

- `/think/` - Satirical search page about critical thinking (Google parody with randomized responses)
- `/think-for-yourself/` - Redirects to `/think/` (alternative URL support)

## Build Process

The Vite config includes a `copyExtraPages()` plugin that recursively copies
the entire `extra-pages/` directory to `dist/` during build. Pages are served
as static HTML, independent of the React app.
