# Sasiranka D. Fernando — Portfolio

The source for [sashiranka.me](https://sashiranka.me/), built with Vite, GSAP, and Lenis.

## Local development

```bash
npm ci
npm run dev
npm test
npm run build
```

## Deployment

Pushes to `main` run the GitHub Actions Pages workflow. It runs the tests, builds the site, and publishes `dist/` to GitHub Pages. The custom domain is configured in `public/CNAME`.
