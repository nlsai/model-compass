# Investor demo guide

## Before the meeting

1. For a no-login demo, run `python3 serve.py` from the repository and open `http://127.0.0.1:8000` on the presentation device. The separate ChatGPT-hosted preview is owner-only. The public GitHub repository is source code, not the hosted app.
2. Check the catalog status near the top of the page. If it says live, model metadata comes from OpenRouter. If it says snapshot, explain that the feed could not be loaded and the fallback is limited and dated.
3. Confirm your internet connection. Rehearse the search and comparison below because model availability and prices may change.

## Suggested two-minute walkthrough

1. **Problem:** Teams spend time comparing model availability, integration needs, context limits and expected usage costs.
2. **Discover:** Search for a model or provider, then filter by free/paid, hosted/local, context and documented tool calling.
3. **Compare:** Select up to three models. Show the provider links, context, displayed token rates and integration notes.
4. **Plan:** Enter expected monthly requests and input/output tokens. The comparison table updates the estimated text-token cost. Explain that other charges, free-tier limits and hardware can change actual costs.
5. **Recommend:** Show the rule-based shortlist. Explain that quality scores are editorial estimates for a small reviewed subset, not verified benchmark rankings. Most paid models are unranked.

## Describe the current stage accurately

Model Compass is an early model-discovery and comparison prototype. It uses a live OpenRouter catalog and two curated local options. It is not an autonomous AI agent; it does not call models or execute workflows. It has not been independently benchmarked or certified for production. The catalog does not cover every provider or model type. Its output should not be treated as a guaranteed price or performance claim.

## If the demo has a problem

- If the catalog shows a snapshot, say so; free availability and provider details may have changed. Open the provider links to verify.
- If a model is unranked, do not invent a quality score; compare available specifications instead.
- If a spend estimate says “Enter valid workload”, use non-negative whole numbers within the field limits.
- Use the locally running app on the presentation device. The local server is unauthenticated and bound to that device by default; share your screen for a remote meeting.
