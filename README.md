# Model Compass

Model Compass is a model-discovery and comparison app for coding, chatbots, agents and automation. It displays live OpenRouter catalog data, provides filters and a three-model comparison, and estimates text-token costs for a workload. It also includes two curated local model options.

The standalone application has **no ChatGPT login, API key, account or backend**. The browser fetches public model metadata from OpenRouter; it does not send prompts or execute models. The separate ChatGPT-hosted preview can still have its own access controls.

## Start locally (macOS, Linux or Windows)

Install Python 3.9 or newer and Git, then run:

```bash
git clone https://github.com/nlsai/model-compass.git
cd model-compass
python3 serve.py
```

On Windows, use `py serve.py` if `python3` is unavailable. Open **http://127.0.0.1:8000** on the same computer. Press `Ctrl+C` in the terminal to stop the server. To choose another port, use `python3 serve.py --port 8081`.

The local server only binds to `127.0.0.1` by default and only serves the application files and `/healthz`. It uses the Python standard library with no package installation. It is intended for local demonstrations and development; use a production static web server for a public deployment. Explicitly binding to another interface exposes this unauthenticated app to people who can reach it. Use a protected network or add appropriate access controls before doing so.

## Docker deployment

With Docker and the Compose plugin installed:

```bash
docker compose up --build -d
```

Open **http://127.0.0.1:8080**. Stop with `docker compose down`. The included container uses an unprivileged NGINX image, allows only the app assets and health endpoint, and serves a Content Security Policy. Compose binds to localhost by default. For a client-facing deployment, put it behind a properly configured HTTPS reverse proxy and add access control if needed. Evaluate network, logging, monitoring, patching and operational requirements for your environment before exposing it. Docker builds require network access to download the base image.

## Tests

Requires Python 3 and Node.js 18 or newer:

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
node --test tests/catalog.test.cjs
```

The automated tests cover model loading, price formatting and filtering, a catalog failure fallback, escaping, estimates, sorting, local HTTP responses, security headers and blocking non-app files. Browser testing is still needed on the operating systems and devices you intend to support.

## How to use it

1. Choose your use case, location, price and other filters. Search by name or provider.
2. Select up to three models and use the comparison tray.
3. Enter a monthly workload to compare estimated input and output token costs.
4. Check the linked provider's current pricing, quota, endpoint capabilities and data handling before making a decision.

### Important limits

- The catalog covers OpenRouter text-input, text-output models and two curated local options. It is not a complete inventory of every provider or model type. The live feed requires internet access and can change; when unavailable, the app shows a limited, dated fallback.
- Prices are listed in USD per million text tokens. Other charges, provider routing, credit fees, caching, modalities, and usage can change the bill. A zero text-token rate does not make all usage free. Free quotas may be insufficient for the estimated workload.
- The suggested fit scores are rule-based, subjective editorial estimates for a small subset, not measured benchmarks. Many models are unranked. A suggestion is not a claim about the best model overall.
- Context values and tool-calling metadata are provider-advertised. Verify actual endpoint support. Local models incur hardware and operating costs.
- Model Compass is a comparison prototype, not an autonomous agent or a model execution service. It is not independently benchmarked or certified for production. Before a wider release, validate benchmarks, data and provider terms, accessibility, security, load handling, monitoring, backups and operating procedures.

A practical [investor demo guide](docs/INVESTOR_DEMO.md) is included.
