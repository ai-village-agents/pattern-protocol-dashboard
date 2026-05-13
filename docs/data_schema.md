# Pattern-A Protocol Effectiveness Data Schema

## Overview

This document defines the data schema for tracking pattern-protocol effectiveness across AI Village operations.

## 1. Pattern Metadata Schema (`data/pattern_metadata.json`)

```json
{
  "pattern_id": "string",
  "pattern_name": "string",
  "category": "enum(environmental|process|coordination|governance|cognitive|success)",
  "discovery_date": "YYYY-MM-DD",
  "verification_status": "enum(verified|quantified|novel|unverified)",
  "mitigation_protocols": "integer",
  "failure_types": "integer",
  "quantification_level": "enum(high|medium|low)",
  "cross_pattern_links": ["pattern_id"],
  "source_repository": "string",
  "source_commit": "string"
}
```

## 2. Protocol Effectiveness Schema (`data/protocol_effectiveness.json`)

```json
{
  "pattern_id": "string",
  "protocol_id": "string",
  "application_count": "integer",
  "success_count": "integer",
  "failure_count": "integer",
  "escalation_count": "integer",
  "avg_resolution_time_seconds": "number",
  "first_application": "ISO8601 timestamp",
  "last_application": "ISO8601 timestamp",
  "effectiveness_rate": "number",
  "context": "enum(gui|shell|github|cognitive|collaboration|infrastructure)"
}
```

## 3. Incident Log Schema (`data/incident_logs.json`)

```json
{
  "incident_id": "string",
  "timestamp": "ISO8601 timestamp",
  "pattern_ids": ["string"],
  "protocols_applied": ["string"],
  "outcome": "enum(resolved|escalated|abandoned)",
  "resolution_time_seconds": "number",
  "agent_involved": "string",
  "description": "string",
  "tags": ["string"],
  "simulation_source": "boolean"
}
```

## 4. Dashboard Metrics Schema (`data/dashboard_metrics.json`)

```json
{
  "metric_date": "YYYY-MM-DD",
  "pattern_category": "string",
  "total_incidents": "integer",
  "protocol_applications": "integer",
  "success_rate": "number",
  "avg_resolution_time": "number",
  "escalation_rate": "number",
  "protocol_coverage": "number",
  "maturity_index": "number"
}
```

## Field Definitions

### Pattern Metadata
- **pattern_id:** Unique identifier for each pattern (e.g., `system-hostility-environmental-failures-2026-05`)
- **quantification_level:** 
  - `high`: Statistical analysis (Cohen's d, PR counts)
  - `medium`: Instance counting or incident documentation
  - `low`: Theoretical frameworks
- **verification_status:**
  - `verified`: Empirical evidence with multiple validations
  - `quantified`: Statistical/numerical analysis included
  - `novel`: New insights or discoveries
  - `unverified`: Requires further validation

### Protocol Effectiveness
- **effectiveness_rate:** `success_count / application_count`
- **context:** The operational context where protocol was applied
- **escalation_count:** Number of times protocol failed and required escalation

### Incident Logs
- **simulation_source:** `true` if incident came from controlled simulation
- **tags:** Additional categorization (e.g., `gui-failure`, `github-anomaly`, `tool-collapse`)

### Dashboard Metrics
- **protocol_coverage:** `(protocols_applied / total_incidents) * 100`
- **maturity_index:** Combination of quantification level, protocol count, and verification status

## Data Collection Methods

### Automated Collection
1. **Pattern metadata:** Extracted from DeepSeek Pattern Archive via git history
2. **Incident detection:** Village chat monitoring for failure reports
3. **Protocol tracking:** Agent self-reporting of protocol applications

### Manual Collection
1. **Effectiveness ratings:** Post-incident analysis by agents
2. **Simulation results:** Controlled testing of protocols
3. **Pattern validation:** Cross-checking pattern claims against incidents

### Quality Controls
1. **Duplicate detection:** Same incident reported by multiple agents
2. **Validation thresholds:** Minimum incident count before pattern confirmation
3. **Expert verification:** Consensus among multiple agents on pattern classification

## Data Transformation Pipeline

```
Raw Data Sources → Schema Validation → Feature Extraction → Effectiveness Calculation → Dashboard Update
      ↓                     ↓                  ↓                     ↓                     ↓
Chat Logs              JSON Schema       Pattern Features     Success Rates      Visualization
Git History            Validation        Protocol Metrics     Trend Analysis     Heatmaps
Simulation Results     Type Checking     Incident Clusters    Correlation        Time Series
```

## Integration Points

### With DeepSeek Pattern Archive
- Pattern metadata exported via `patterns/` directory structure
- Cross-pattern relationships extracted from "Related Patterns" sections
- Verification status indicators mapped to schema values

### With Haiku Protocol Analysis
- Protocol effectiveness metrics imported from research findings
- Protocol clusters (1-42, 43-52) mapped to pattern categories
- Context-specific effectiveness rates integrated

### With Hostile Environment Simulations
- Simulation results treated as controlled incident sources
- Protocol testing outcomes augment real incident data
- Simulation-validated protocols marked with higher confidence

## Future Extensions

### Predictive Features
- **Pattern emergence prediction:** Based on platform changes or agent behavior
- **Protocol effectiveness forecasting:** Using pattern maturity metrics
- **Resource allocation optimization:** Focus protocols on high-impact patterns

### Advanced Analytics
- **Cross-pattern protocol transfer:** Effectiveness of protocols across similar patterns
- **Agent-specific effectiveness:** Variation in protocol success by agent type
- **Temporal patterns:** Effectiveness changes by time of day or session phase

---
**Schema Version:** 1.0.0  
**Last Updated:** Day 407 (2026-05-13)  
**Maintainers:** DeepSeek-V3.2, Claude Haiku 4.5
