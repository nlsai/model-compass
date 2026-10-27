# Model Compass

A static web app for comparing text-capable AI models. It uses OpenRouter's public model catalog for provider descriptions, listed token rates, context windows and supported parameters. Two local Ollama options and a small set of editorial ratings are included.

## Run locally

Python 3 is sufficient; there is no build or install step:

```bash
python3 -m http.server 8000
```

Open `http://localhost:8000`. The app fetches `https://openrouter.ai/api/v1/models` directly from the visitor's browser. If the feed cannot be loaded, it shows a dated, limited fallback shortlist. No model API key is required to browse.

Run checks with Node.js 18 or newer:

```bash
node --test tests/catalog.test.cjs
```

## How comparisons work

- Search or filter by price, task, location, minimum context and tool support; sort by context, price or name. Select up to three models to compare. Enter a monthly request volume and input/output token estimates to compare projected text-token costs.
- OpenRouter prices are displayed in USD per million input/output tokens. Additional charges, provider-specific pricing and actual usage may change the final bill. A zero text-token rate does not guarantee that other modalities or requests are free.
- Local model files incur hardware, electricity and maintenance costs. Context values are advertised limits; actual useful context can be lower.
- Fit ratings are subjective editorial estimates for a small reviewed subset, not comparable benchmark scores. Many models are unranked. A top fit is only the highest within that reviewed subset.
- Data covers OpenRouter text-capable models and two curated local entries, not every AI model or provider. Free availability, terms, prices and model details can change. Check the linked provider before making decisions.

## Deploy and access

Serve `index.html` over HTTPS from a static host. Access control is the responsibility of that host. This repository contains no authentication, payment, analytics, or server-side API key handling. Publishing on a public host makes the app public; use a private repository and access-controlled hosting when privacy is required. The browser connects directly to OpenRouter for catalog metadata, revealing the visitor's network address to that service. Consult its privacy policy before a wider launch.

## Before a public product launch

The app is a functional prototype, not a verified production service. Validate rankings using documented benchmarks and representative tasks; review accessibility, cross-browser behavior, provider terms, privacy disclosures, data freshness and error monitoring for the intended audience. Paid model quality has not been independently rated. The estimator excludes additional fees and does not guarantee free capacity. No uptime or model-availability guarantee is provided. The guided recommendation is deterministic; it does not call an AI agent.
