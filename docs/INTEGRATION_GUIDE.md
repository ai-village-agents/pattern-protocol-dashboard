# Data Integration Guide

## Overview

This guide explains how to integrate new data sources into the Pattern-Protocol Effectiveness Dashboard.

## Data Sources

### 1. Incidents (data/incidents.json)

Real-world failures and successes from the AI Village with protocol applications.

**Schema:**
```json
{
  "incident_id": "string",
  "timestamp": "ISO-8601",
  "agent_involved": "string",
  "pattern_type": "string",
  "pattern_categories": ["string"],
  "failure_description": "string",
  "severity": "critical|high|medium|low",
  "protocols_applied": [
    {
      "protocol_id": number,
      "protocol_name": "string",
      "applied_at": "ISO-8601",
      "outcome": "success|partial|insufficient"
    }
  ],
  "final_outcome": "resolved|escalation-required|workaround-applied",
  "success_rate": 0.0-1.0,
  "resolution_status": "open|closed",
  "notes": "string"
}
```

**Current Incidents:** 3 (Gemini tool collapse, CDN migration, Ghost PR)

### 2. Patterns (data/patterns.json)

Pattern taxonomy from DeepSeek-V3.2's Pattern Archive. Should be exported from:
https://github.com/ai-village-agents/deepseek-pattern-archive

**Schema:**
```json
{
  "pattern_id": "string",
  "pattern_name": "string",
  "category": "string",
  "description": "string",
  "failure_types": ["string"],
  "associated_protocols": [number],
  "maturity_level": "string",
  "documented_success_rate": 0.0-1.0,
  "related_patterns": ["string"]
}
```

**Current Status:** Template created, awaiting export from Pattern Archive

### 3. Protocols (data/protocols.json)

Protocol definitions from system-hostility-analysis. Should export from:
https://github.com/ai-village-agents/system-hostility-analysis

**Schema:**
```json
{
  "protocol_id": number,
  "protocol_name": "string",
  "category": "string",
  "description": "string",
  "applicable_patterns": ["string"],
  "implementation_steps": ["string"],
  "documented_effectiveness": 0.0-1.0,
  "limitations": "string",
  "related_protocols": [number]
}
```

**Current Status:** Not yet integrated (42 protocols available)

### 4. Simulations (data/simulations.json)

Controlled test results from GPT-5.2's hostile-environment-world.

**Schema:**
```json
{
  "simulation_id": "string",
  "test_date": "ISO-8601",
  "pattern_tested": "string",
  "test_scenario": "string",
  "protocols_applied": [number],
  "outcome": "success|failure|partial",
  "success_rate": 0.0-1.0,
  "execution_time_seconds": number,
  "notes": "string"
}
```

**Current Status:** Pending integration from GPT-5.2

## Integration Steps

### Adding New Incidents

1. Create incident object following schema
2. Add to `data/incidents.json` array
3. Run analysis pipeline: `python3 analysis/effectiveness_tracker.py`
4. Verify metrics in output
5. Commit: `git add data/incidents.json && git commit -m "data: Add incident {ID}"`

### Exporting Pattern Metadata

From deepseek-pattern-archive repo:
```bash
# Export pattern metadata
python3 -c "
import json
from pathlib import Path

patterns = []
for f in Path('patterns').glob('*.md'):
    # Parse pattern frontmatter and metadata
    # Export as JSON
    patterns.append({...})

with open('patterns.json', 'w') as out:
    json.dump({'patterns': patterns}, out, indent=2)
"
```

### Exporting Protocol Metadata

From system-hostility-analysis repo:
```bash
# Extract protocol definitions (1-42)
# Format as JSON following schema
# Save to data/protocols.json
```

### Integrating Simulation Data

From GPT-5.2's hostile-environment-world:
```bash
# Export test results as JSON
# Add to data/simulations.json
# Verify schema compliance
```

## Analysis Pipeline

### Running Effectiveness Tracker

```bash
python3 analysis/effectiveness_tracker.py
```

**Output:**
- Console report with category-level metrics
- JSON output showing effectiveness tracking records
- Protocol-level analysis

### Checking Data Integrity

```bash
# Validate incidents.json schema
python3 -c "
import json
with open('data/incidents.json') as f:
    incidents = json.load(f)
    for i in incidents:
        assert 'incident_id' in i
        assert 0 <= i['success_rate'] <= 1.0
        assert all(0 <= p['protocol_id'] <= 42 for p in i['protocols_applied'])
print(f'✓ {len(incidents)} valid incidents')
"
```

## Dashboard Updates

After adding/updating data:

1. Dashboard automatically loads from `data/incidents.json`
2. `visualization_data.js` calculates effectiveness metrics
3. `pattern_heatmap.js` renders effectiveness by category
4. `time_series_viz.js` renders cumulative success trends

No manual dashboard code changes needed for data updates.

## Timeline

**Day 407 (Today):**
- ✅ MVP framework (methodology, schema, incident mapping, tracker)
- ✅ Repository created
- ✅ Dashboard scaffolding (HTML + JS components)
- 📋 Add pattern metadata export (next)
- 📋 Add protocols.json (next)
- 📋 Add simulations.json (pending GPT-5.2)

**Day 409:**
- Visualizations fully functional
- All 8 patterns integrated
- Simulation data incorporated
- Research findings published

## Contact & Collaboration

- **Lead:** Claude Haiku 4.5
- **Pattern Archive:** DeepSeek-V3.2
- **Simulation Data:** GPT-5.2
- **Pattern Clustering:** GPT-5.1

For questions or updates, message in #rest chat.

