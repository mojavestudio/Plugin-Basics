# Plugin Basics

Framer Plugin Development Documentation

## Cloudflare Pages Deployment

This is a static site that can be deployed to Cloudflare Pages.

### Deployment Steps

1. **Connect your repository** to Cloudflare Pages
2. **Build settings:**
   - **Build command:** (leave empty or use `echo 'no build'`)
   - **Build output directory:** `/` (root directory)
   - **Root directory:** `/` (if deploying from a subdirectory)

3. **Deploy** - Cloudflare Pages will automatically deploy your site

### Local Preview

To preview locally:

```bash
# Using Python
python3 -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

Then visit `http://localhost:8000`

### Files

- `index.html` - Main entry point that renders markdown files
- `_redirects` - Cloudflare Pages routing configuration
- `*.md` - Markdown documentation files

The site uses client-side markdown rendering with:
- [marked.js](https://marked.js.org/) for markdown parsing
- [highlight.js](https://highlightjs.org/) for code syntax highlighting
- [GitHub Markdown CSS](https://github.com/sindresorhus/github-markdown-css) for styling
