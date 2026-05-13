# Pattern Regime Metrics & Maturity Index

## Overview

This dashboard integrates **pattern regime analysis** with **protocol effectiveness metrics** to provide a comprehensive maturity index for each pattern category.

## Key Metrics

### 1. **Regime Classification**

Patterns are classified into 5 regimes based on documentation density:

| Regime | Description | Maturity Score |
|--------|-------------|-----------------|
| `failure_diagnostic` | Problem-heavy documentation (failures > mitigations) | 0.3 |
| `solution_prescriptive` | Solution-heavy documentation (mitigations > failures) | 0.6 |
| `dual_dense` | Both problems and solutions thoroughly documented | 0.8 |
| `balanced_success` | Balanced, comprehensive, success-oriented | 0.9 |
| `solution_prescriptive_dual_dense` | Solutions primary with dual-dense depth (governance) | 0.85 |

### 2. **Documentation Bias**

- `problem-heavy`: Failures per 1k words > mitigations per 1k words
- `solution-heavy`: Mitigations per 1k words > failures per 1k words
- `balanced`: Approximately equal emphasis on both

### 3. **Balance Ratio**

- Calculated as: `mitigation_hits / failure_hits`
- Ranges from ~0.2 (failure-heavy) to ~1.7+ (solution-heavy)
- Higher ratios indicate better-mitigated patterns

### 4. **Maturity Index**

The maturity index is calculated as the average of three normalized scores:

```
maturity = (regime_score + bias_score + balance_score) / 3
```

Where:
- **regime_score**: From regime classification (0.3–0.9)
- **bias_score**: 1.0 if balanced, 0.8 if problem/solution-heavy
- **balance_score**: Normalized balance ratio (capped at 1.0)

### 5. **Enriched Effectiveness Score**

Dashboard charts display **maturity-adjusted effectiveness**:

```
enriched_effectiveness = (incident_effectiveness * 0.7) + (maturity_index * 0.3)
```

This blends:
- **Incident effectiveness** (70%): What protocols actually achieved
- **Maturity index** (30%): How well-documented and balanced the pattern is

## Example: System Hostility

| Pattern | Regime | Balance Ratio | Maturity | Incident Effectiveness | Enriched |
|---------|--------|---------------|----------|------------------------|----------|
| System Hostility (Environmental) | `dual_dense` | 0.74 | 0.76 | 37.5% | 49% |

**Interpretation**: Despite moderate incident success (37.5%), this pattern category has a strong maturity index (76%) due to comprehensive dual-dense documentation. The enriched score (49%) reflects real-world effectiveness tempered by strong theoretical foundation.

## Integration in Dashboard

1. **Heatmap**: Color intensity reflects maturity-adjusted effectiveness by protocol type
2. **Metrics Sidebar**: Each category shows both effectiveness % and maturity % badge
3. **Time Series**: Tracks incident effectiveness with overlaid maturity context
4. **Incident Table**: Links individual incidents to their pattern categories' maturity indices

## Data Sources

- **Incidents**: `data/incidents.json` (3 real village case studies)
- **Patterns**: `data/patterns.json` (8 pattern categories with metadata)
- **Protocols**: `data/protocols.json` (20+ protocol definitions with effectiveness scores)
- **Pattern Regimes**: `data/pattern_regimes.json` (mitigation/failure density analysis from GPT-5.1)
- **Analysis Code**: `analysis/effectiveness_tracker.py` (reproducible calculation pipeline)

## Research Questions Addressed

1. **Which protocols work best for each pattern category?**
   - Answer: Heatmap shows protocol × pattern effectiveness cross-section
   
2. **Can we predict protocol success given context?**
   - Answer: Maturity index suggests patterns with balanced documentation are more predictable
   
3. **What patterns are most resilient?**
   - Answer: Patterns with high maturity index + high incident effectiveness
   - Example: Coordination (100% incident effectiveness, strong maturity)

## Future Extensions

- Real-time incident tracking (update data/incidents.json as new incidents occur)
- Simulation data integration (from GPT-5.2 hostile-environment-world)
- Predictive modeling (success probability given pattern + protocol)
- Agent-specific effectiveness tracking (per-agent protocol success rates)
