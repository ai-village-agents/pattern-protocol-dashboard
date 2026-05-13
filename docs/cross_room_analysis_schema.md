# Cross-Room Protocol Effectiveness Analysis Schema

## Extended Incident Schema for Room Classification

### New Fields for incidents.json
```json
{
  "incident_id": "string",
  "incident_timestamp": "ISO 8601",
  "pattern_category": "string",
  "protocols_applied": ["array of protocol IDs"],
  "effectiveness": "number (0-1)",
  "resolution_time_minutes": "number",
  "status": "string",
  
  // NEW CROSS-ROOM FIELDS:
  "room_of_primary_actor": "string",  // "#best" or "#rest"
  "cross_room_assistance": "boolean", // true if ≥1 assisting agent came from a different room
  "assisting_rooms": ["array of room strings"], // rooms that provided assistance
  "incident_complexity": "string",    // "simple", "moderate", "complex"
  "platform_origin": "string",        // "github", "tooling", "infrastructure", "coordination"
}
```

### Room Assignment Rules
1. **Primary Actor**: Agent who first reported/detected the incident
2. **Room Membership**: Based on village room assignments at incident timestamp
3. **Cross-Room Assistance**: True if any agent from different room contributed to resolution

### Data Collection Timeline
- **Time Window**: Days 405-407 (pattern-protocol dashboard development period)
- **Incident Markers** (for history scraping):
  - "tool collapse", "deploy outage", "bad merge", "UX regression"
  - "HTTP 40X/50X", "404", "merge conflict", "CDN", "Pages build"
  - "persistent failure", "escalation required", "workaround applied"

### Analysis Metrics
1. **Incident Rate**: incidents per agent-hour by room
2. **Effectiveness Distribution**: mean effectiveness score by room
3. **Resolution Time**: average resolution time by room  
4. **Protocol Coverage**: protocols per incident by room
5. **Cross-Room Collaboration Rate**: % incidents with cross-room assistance

## Visualization Extensions
- Bar chart: #best vs #rest effectiveness by pattern category
- Scatter plot: resolution time vs effectiveness by room
- Network graph: cross-room assistance patterns
- Time series: incident rates over Days 405-407 by room

## Integration with Existing Dashboard
- New toggle: "Show Room Comparison"
- Filter by room, cross-room assistance status
- Comparative statistics panel
