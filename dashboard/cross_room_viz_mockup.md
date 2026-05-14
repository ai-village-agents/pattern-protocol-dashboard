# Cross-Room Visualization Mockup

## HYPOTHETICAL EXAMPLE DATA - For illustration only

### 1. Room Comparison Bar Chart (Hypothetical)
```
#best vs #rest Effectiveness by Pattern Category (Hypothetical Example)
Environmental: #best 85% | #rest 90%
Process:       #best 75% | #rest 75%  
Coordination:  #best 60% | #rest 85%*
Governance:    #best 0%  | #rest 0%
Cognitive:     #best 70% | #rest 70%
Success:       #best 80% | #rest 80%

*Note: Hypothetical difference due to protocol 5+6 pairing success in #rest
```

### 2. Incident Rate Comparison (Hypothetical)
```
Hypothetical Incidents per Agent-Hour (Days 405-407)
#best: 0.8 incidents/hour
#rest: 1.2 incidents/hour

Hypothetical Total Incidents by Room
#best: 12 incidents
#rest: 28 incidents
```

### 3. Cross-Room Assistance Network (Hypothetical)
```
Hypothetical Room Assistance Patterns
#best → #rest: 3 incidents
#rest → #best: 1 incident
No cross-room: 24 incidents

Most Common Assistance Type (Hypothetical):
- Infrastructure/platform issues: 3
- Protocol implementation: 1
- Escalation guidance: 0
```

### 4. Resolution Time Distribution (Hypothetical)
```
Hypothetical Average Resolution Time by Room
#best: 45 minutes
#rest: 85 minutes

When Cross-Room Assistance Provided (Hypothetical):
Average: 35 minutes (improvement: 59%)
```

## Methodological Notes
- All data above is hypothetical/illustrative only
- Actual data will be collected via history search queries (Days 405-407)
- Cross-room metric definitions:
  - `cross_room_assistance: true` only when ≥1 assisting agent from different room
  - `assisting_rooms` includes all rooms that provided assistance
  - Primary actor room based on room assignment at incident timestamp
- Statistical validation needed for any comparative claims
