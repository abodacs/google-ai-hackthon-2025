# Netlify Deployment Guide

This guide covers deploying LearnSphere AI to Netlify for the Google AI Hackathon 2025.

## Prerequisites

1. **Netlify Account**: Sign up at [netlify.com](https://netlify.com)
2. **GitHub Repository**: Push your code to GitHub
3. **Chrome AI APIs**: Ensure target browsers support Chrome Built-in AI

## Automatic Deployment (Recommended)

### Connect GitHub Repository

1. Log in to Netlify
2. Click "Add new site" → "Import an existing project"
3. Choose "Deploy with GitHub"
4. Select your repository: `abodacs/google-ai-hackthon-2025`
5. Configure build settings:
   - **Base directory**: `learnsphere-ai`
   - **Build command**: `pnpm build`
   - **Publish directory**: `learnsphere-ai/out`
   - **Node version**: `22`

### Environment Variables

Set these in Netlify dashboard under Site settings → Environment variables:

```
NODE_VERSION=22
NPM_FLAGS=--version
```

### Build Settings

The `netlify.toml` file configures:
- Static export optimization
- Chrome AI permissions headers
- Security headers
- SPA routing redirects
- Asset caching

## Manual Deployment

### Install Netlify CLI

```bash
npm install -g netlify-cli
netlify login
```

### Deploy to Preview

```bash
cd learnsphere-ai/
pnpm deploy:preview
```

### Deploy to Production

```bash
cd learnsphere-ai/
pnpm deploy:production
```

## Chrome AI Requirements

### Browser Compatibility Notice

Add this notice to your deployment:

> **⚠️ Chrome AI Requirements**
>
> This application requires Chrome 139+ with AI APIs enabled:
> 1. Open `chrome://flags`
> 2. Enable these flags:
>    - "Prompt API for Gemini Nano"
>    - "Summarization API for Gemini Nano"
>    - "Rewriter API for Gemini Nano"
>    - "Writer API for Gemini Nano"
> 3. Restart Chrome

### HTTPS Requirement

Chrome AI APIs require HTTPS. Netlify provides HTTPS by default, so this is handled automatically.

## Build Optimization

### Next.js Static Export

The project is configured for static export (`output: "export"`) which:
- Generates static HTML/CSS/JS files
- Enables deployment to any static hosting
- Improves performance and caching
- Reduces hosting costs

### Performance Features

- **Turbopack**: Faster builds with `--turbopack` flag
- **Image Optimization**: Disabled for static export compatibility
- **Asset Optimization**: Automatic minification and bundling
- **Cache Headers**: Optimized caching for static assets

## Deployment Checklist

- [ ] Repository connected to Netlify
- [ ] Build settings configured
- [ ] Environment variables set
- [ ] Chrome AI permission headers added
- [ ] HTTPS enabled (automatic)
- [ ] Browser compatibility notice displayed
- [ ] Static export working correctly
- [ ] All pages accessible via direct URLs

## Troubleshooting

### Build Failures

1. **Node Version**: Ensure Node 22 is specified (configured in netlify.toml)
2. **Package Manager**: Use pnpm (configured in netlify.toml)
3. **TypeScript Errors**: Fix with `pnpm type-check`
4. **Lint Errors**: Fix with `pnpm lint:fix`

### Chrome AI Issues

1. **API Not Available**: Check browser compatibility
2. **Permissions**: Verify HTTPS and permission headers
3. **Feature Detection**: Use proper availability checking

### Static Export Issues

1. **Dynamic Routes**: Not supported in static export
2. **API Routes**: Move to client-side only
3. **Image Optimization**: Disabled for compatibility

## Custom Domain (Optional)

1. In Netlify dashboard: Site settings → Domain management
2. Add custom domain
3. Configure DNS records
4. Enable HTTPS (automatic with Netlify)

## Monitoring

- **Netlify Analytics**: Built-in traffic and performance metrics
- **Build Logs**: Monitor deployment status and errors
- **Function Logs**: Not applicable (static site only)

## Security

Configured security headers:
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- Chrome AI permissions policy

---

**Deployment URL**: `https://learnsphere-ai.netlify.app` (example)

*Ready for Google AI Hackathon 2025 submission!*