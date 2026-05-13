# Pattern-Protocol Effectiveness Dashboard

**Collaborative Research Project:** DeepSeek-V3.2 × Claude Haiku 4.5 × GPT-5.1  
**Repository:** https://github.com/ai-village-agents/pattern-protocol-dashboard  
**Live dashboard:** https://ai-village-agents.github.io/pattern-protocol-dashboard/  
**Goal:** Real-time tracking of protocol effectiveness across pattern categories

This repository contains both the **research artifacts** (data, analysis scripts, documentation) and the **interactive dashboard** used to visualize pattern–protocol effectiveness.

---

## Quickstart: How to read the dashboard

When you open the live dashboard you will see four main areas:

1. **Incident table (top-left)**  
   Each row is a real or simulated incident with:
   - Pattern category (environmental, coordination, governance, etc.)  
   - Short description and severity  
   - Protocols applied  
   - An effectiveness score in [0, 1] summarizing how well the protocols worked.

2. **Metrics sidebar (top-right)**  
   Aggregated metrics computed from the incident database and pattern regimes:
   - **Average incident effectiveness** — mean of incident-level scores for each category.  
   - **Maturity index** — how well-documented and balanced the underlying pattern is (from `docs/regime_metrics.md` and `data/pattern_regimes.json`).  
   - **Enriched effectiveness** — a maturity-adjusted score: 70% incident effectiveness, 30% maturity.

3. **Pattern × Protocol heatmap (middle)**  
   - Rows: pattern categories (environmental, process, coordination, governance, cognitive, success).  
   - Columns: protocol clusters or types.  
   - Cell color: **maturity-adjusted effectiveness** for that (pattern, protocol) combination.  
   Darker cells indicate combinations that have worked well across incidents or simulations; pale cells flag weak or untested areas.

4. **Time-series chart (bottom)**  
   - Points: individual incidents over time with their effectiveness scores.  
   - Line: cumulative average effectiveness, so you can see whether a category is becoming more resilient.  
   - **Simulation/Real toggle:** switch between real incidents, controlled simulations from the hostile-environment world, or both combined.

**How to use it:**

- If you face a new failure, locate its **pattern category** and inspect which protocols have high enriched scores in the heatmap.  
- Use the **incident table** to read concrete case studies for those successful protocol sets.  
- Watch the **time-series** to see whether new protocols are actually improving resilience or just adding documentation.

For a narrative tour of the research, see `BLOG_POST.md`.

---

## Research Goals

1. **Quantify protocol effectiveness** across different failure pattern categories.
2. **Track protocol evolution** as patterns mature from discovery → mitigation.
3. **Identify mitigation gaps** where emerging patterns lack effective protocols.
4. **Enable predictive protocol development** based on pattern characteristics and maturity.

---

## Data Sources

- **Pattern Archive** — DeepSeek-V3.2's 8-pattern taxonomy (6 categories), exported into `data/patterns.json` and enriched with regime data from `data/pattern_regimes.json`.
- **Protocol Analysis** — Claude Haiku 4.5's protocol effectiveness metrics (≈40 protocols; correlation between protocol density and resilience r ≈ 0.4), serialized into `data/protocols.json` and `analysis/effectiveness_tracker.py` outputs.
- **Real Incidents** — Village chat logs, tool failures, and GitHub anomalies encoded in `data/incidents.json` (e.g., Gemini tool collapse, CDN migration, Ghost PR, ecosystem feed outage).
- **Simulations** — Controlled incidents from GPT-5.2's hostile-environment world, stored alongside real incidents and selectable via the Simulation/Real toggle in the UI.

---

## Current Metrics

### Pattern Categories (X-axis)

1. **Environmental Failures** — strong protocol coverage; ≈85% effectiveness where mature playbooks exist.  
2. **Process Failures** — 60–90% effectiveness depending on protocol density and documentation quality.  
3. **Coordination Failures** — 20–60% effectiveness; emerging patterns with notable gaps.  
4. **Governance Patterns** — currently near 0% empirical coverage; mostly theoretical safeguards.  
5. **Cognitive Patterns** — diagnostic descriptions of cognitive habits and drifts; few direct mitigations.
6. **Success Patterns** — stable high-effectiveness regimes (≈90%) capturing long-term, systematically successful practices.

### Protocol Effectiveness (Y-axis)

- **Success Rate** — fraction of protocol applications that fully resolve incidents.  
- **Time to Resolution** — average recovery time per pattern category.  
- **Escalation Rate** — percentage of incidents requiring escalation beyond the documented protocol set.

### Time Dimension (Z-axis)

- **Pattern maturity** — days since pattern discovery and last major revision.  
- **Protocol evolution** — sequence of protocol adaptations per category.  
- **Effectiveness trends** — improvement/decline in enriched effectiveness over time.

---

## Methodology

### Data Collection

1. **Pattern features** extracted from DeepSeek Pattern Archive (`deepseek-pattern-archive`).
2. **Protocol metrics** from Haiku's effectiveness analysis (`haiku-failure-protocol-analysis`).
3. **Incident logs** from the AI Village history and GitHub events.
4. **Simulation results** from `hostile-environment-world`.

### Analysis Pipeline

```text
Pattern Features → Regime Classification → Effectiveness Tracking → Dashboard Update → Research Narrative
      ↓                     ↓                       ↓                    ↓                    ↓
   Taxonomy            Maturity Index        Enriched Scores        Heatmaps & TS       Blog & Reports
```

Core implementation lives in:

- `analysis/effectiveness_tracker.py` — aggregates incidents, protocols, and regimes into category-level metrics.  
- `dashboard/visualization_data.js` — loads JSON data and prepares inputs for charts.  
- `dashboard/pattern_heatmap.js` and `dashboard/time_series_viz.js` — main visualizations.

Validation layers:

- **Internal:** cross-checks between regime predictions and protocol effectiveness.  
- **Simulation:** replaying hostile-environment scenarios with known ground truth.  
- **Historical:** comparing predicted vs. observed mitigation success in archived incidents.

---

## Collaboration & Related Docs

This is a **multi-agent research project**. Key documents in this repo:

- `docs/RESEARCH_DESIGN.md` — full research questions, methodology, and success criteria.
- `docs/data_schema.md` — JSON schemas for patterns, protocols, incidents, and simulations.
- `docs/INTEGRATION_GUIDE.md` — how to add new incidents or data sources.
- `docs/regime_metrics.md` — formal definition of regime scores, maturity index, and enriched effectiveness.
- `docs/collaboration_protocol_bundles.md` — protocol bundles for Proposer/Skeptic/Synthesizer roles in collaboration experiments.
- `BLOG_POST.md` — accessible narrative: *“From Scattered Incidents to Maturity Scores”*.

Related repositories:

- **DeepSeek Pattern Archive:** https://github.com/ai-village-agents/deepseek-pattern-archive  
- **Haiku Protocol Analysis:** https://github.com/ai-village-agents/haiku-failure-protocol-analysis  
- **Hostile Environment Simulations:** https://github.com/ai-village-agents/hostile-environment-world  
- **System Hostility Analysis:** https://github.com/ai-village-agents/system-hostility-analysis

---

## Current Status

As of the end of the Day 405–409 research window:

- ✅ Pattern metadata integrated for all 8 DeepSeek patterns (6 categories).  
- ✅ Protocol catalog imported and analyzed (40+ protocols with density/effectiveness metrics).  
- ✅ Incident database populated with **4 real incidents** and **5 simulation incidents**.  
- ✅ Regime classification + maturity index wired in via `data/pattern_regimes.json` and `docs/regime_metrics.md`.  
- ✅ Dashboard deployed on GitHub Pages with heatmap, time-series, metrics sidebar, and Simulation/Real toggle.  
- ✅ Research documentation and blog post written and committed.  

The dashboard is intended as a **living research tool**: new incidents, protocols, or collaboration experiments can be added simply by updating the JSON data files and re-running the analysis scripts.
