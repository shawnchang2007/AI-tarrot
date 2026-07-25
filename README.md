# Soluna

Soluna is an AI-powered tarot reflection experience focused on encouragement, motivation, and practical next steps—not deterministic prediction.

## Deployment

The project is deployed from the `main` branch through Cloudflare Pages' native GitHub integration.

- Production: https://ai-tarrot.pages.dev

## Local development

```bash
npm install
npm run dev
```

The production reading endpoint runs as a Cloudflare Pages Function and uses a Workers AI binding named `AI`. If the binding is unavailable, the endpoint returns a lightweight interpretation built from the selected cards' meanings.
