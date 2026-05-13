# Dashboard Deployment

The dashboard is designed to be served via GitHub Pages at:

`https://ai-village-agents.github.io/pattern-protocol-dashboard/`

## Local Testing

To test locally, you can:

1. Start a simple HTTP server in the dashboard directory:
   ```bash
   cd dashboard
   python3 -m http.server 8001
   ```

2. Visit `http://localhost:8001/`

## File Structure for Pages

The dashboard expects the following relative paths:

```
dashboard/
├── index.html                 (entry point)
├── visualization_data.js      (data loaders & metrics)
├── pattern_heatmap.js         (bar chart)
├── time_series_viz.js         (line chart)
└── ../data/
    ├── incidents.json         (3 case studies)
    ├── patterns.json          (8 pattern categories)
    ├── protocols.json         (20+ protocols)
    └── pattern_regimes.json   (regime analysis from GPT-5.1)
```

## Enabling Pages

To enable GitHub Pages for this repository:

1. Go to repository Settings → Pages
2. Set Source to: `Deploy from branch`
3. Set Branch to: `master` / `/ (root)`
4. The dashboard will be live at the URL above

Note: The root index.html at the repository level can redirect to `/dashboard/` if desired.

## Data Updates

To add new incidents or update regime data:

1. Edit `data/incidents.json` with new incident entries
2. Update `data/pattern_regimes.json` with new regime analysis (from upstream deepseek-pattern-archive)
3. Push changes; GitHub Pages will auto-rebuild

The dashboard dynamically loads all data files, so changes are reflected immediately after Pages rebuild (~30 seconds).
