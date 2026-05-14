// Cross-room analysis visualization module
// Extends dashboard with #best vs #rest comparative metrics.
// Updated by Claude Opus 4.5 + GPT-5.1 to use corrected data with window_status filtering.
// Extended by GPT-5.1 (Day 408) to support incident_type slicing and a richer summary API
// that matches dashboard/cross_room_dashboard.html.

const crossRoomAnalysis = {
    bestIncidents: [],
    restIncidents: [],
    crossRoomAssistanceIncidents: [],
    allIncidents: [],
    currentIncidents: [],

    // Load cross-room annotated incidents - primary: corrected, fallback: original
    async loadAnnotatedIncidents() {
        try {
            // Try corrected file first (with proper room assignments)
            const response = await fetch('../data/cross_room_incidents_corrected.json');
            if (response.ok) {
                return await response.json();
            }
        } catch (error) {
            console.warn('Could not load corrected incidents, trying fallback:', error);
        }

        try {
            // Fallback to original annotated file
            const response = await fetch('../data/cross_room_incidents_annotated.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading cross-room incidents:', error);
            return [];
        }
    },

    // Filter to strict in-window incidents only (Days 405-407)
    filterInWindowIncidents(incidents) {
        if (!Array.isArray(incidents)) return [];
        return incidents.filter((inc) => {
            // Explicit in-window status
            if (inc.window_status === 'in-window') return true;
            // Exclude historical-context-only
            if (inc.window_status === 'historical-context-only') return false;
            // Handle context_only field
            if (inc.context_only === true) return false;
            if (inc.context_only === false) return true;
            // Default: include if no status field (conservative)
            return !inc.window_status;
        });
    },

    // Filter incidents by incident_type, with backward-compatible defaults.
    // incidentType values:
    //   - 'platform_operational' (default)
    //   - 'research_integrity'
    //   - 'coordination_failure'
    //   - 'all' (no type filtering)
    filterByIncidentType(incidents, incidentType) {
        if (!Array.isArray(incidents)) return [];
        if (!incidentType || incidentType === 'all') return incidents;

        return incidents.filter((inc) => {
            const type = inc.incident_type || 'platform_operational';
            if (incidentType === 'platform_operational') {
                // Treat missing incident_type as platform-operational for backward compatibility
                return type === 'platform_operational';
            }
            return type === incidentType;
        });
    },

    // Partition incidents by room
    partitionByRoom(incidents) {
        if (!Array.isArray(incidents)) {
            this.bestIncidents = [];
            this.restIncidents = [];
            this.crossRoomAssistanceIncidents = [];
            return;
        }
        this.bestIncidents = incidents.filter((inc) => inc.room_of_primary_actor === '#best');
        this.restIncidents = incidents.filter((inc) => inc.room_of_primary_actor === '#rest');
        this.crossRoomAssistanceIncidents = incidents.filter((inc) => inc.cross_room_assistance === true);
    },

    // Calculate room-specific effectiveness metrics
    calculateRoomMetrics(incidents, room) {
        if (!Array.isArray(incidents) || incidents.length === 0) {
            return {
                room,
                count: 0,
                avgEffectiveness: 0,
                avgResolutionTime: 0,
                totalResolved: 0,
                totalEscalated: 0,
                avgComplexity: 0,
                incidentsByCategory: {},
            };
        }

        const resolved = incidents.filter((i) => i.status === 'resolved').length;
        const escalated = incidents.filter((i) => i.status === 'escalated_to_human').length;

        const complexityScore = {
            simple: 1,
            moderate: 2,
            complex: 3,
        };

        const count = incidents.length;

        const avgComplexityRaw =
            incidents.reduce((sum, i) => sum + (complexityScore[i.incident_complexity] || 2), 0) /
            count;

        const totalEffectiveness = incidents.reduce(
            (sum, i) => sum + (typeof i.effectiveness === 'number' ? i.effectiveness : 0),
            0,
        );
        const avgEffectivenessRaw = totalEffectiveness / count;

        const resolvedWithTime = incidents.filter(
            (i) => i.status === 'resolved' && typeof i.resolution_time_minutes === 'number',
        );
        const avgResolutionTimeRaw =
            resolvedWithTime.length > 0
                ? resolvedWithTime.reduce((sum, i) => sum + i.resolution_time_minutes, 0) /
                  resolvedWithTime.length
                : 0;

        // Count by category, track both count and effectiveness sum
        const incidentsByCategory = {};
        incidents.forEach((i) => {
            const cat = i.pattern_category || 'unknown';
            if (!incidentsByCategory[cat]) {
                incidentsByCategory[cat] = { count: 0, effectivenessSum: 0 };
            }
            incidentsByCategory[cat].count += 1;
            if (typeof i.effectiveness === 'number') {
                incidentsByCategory[cat].effectivenessSum += i.effectiveness;
            }
        });

        return {
            room,
            count,
            avgEffectiveness: Math.round(avgEffectivenessRaw * 100) / 100,
            avgResolutionTime: Math.round(avgResolutionTimeRaw),
            totalResolved: resolved,
            totalEscalated: escalated,
            avgComplexity: Math.round(avgComplexityRaw * 100) / 100,
            incidentsByCategory,
        };
    },

    // Calculate cross-room assistance statistics
    calculateCrossRoomStats(incidents) {
        if (!Array.isArray(incidents) || incidents.length === 0) {
            return {
                totalIncidents: 0,
                crossRoomAssistanceCount: 0,
                sameRoomOnlyCount: 0,
                crossRoomAssistanceRate: 0,
                assistancePatterns: {},
            };
        }

        const totalIncidents = incidents.length;
        const crossRoom = incidents.filter((i) => i.cross_room_assistance === true);
        const crossRoomAssistanceCount = crossRoom.length;
        const sameRoomOnlyCount = totalIncidents - crossRoomAssistanceCount;
        const crossRoomAssistanceRate =
            totalIncidents > 0
                ? Math.round((crossRoomAssistanceCount / totalIncidents) * 100)
                : 0;

        // Count assistance patterns (de-duplicated) with effectiveness
        const assistancePatterns = {};
        crossRoom.forEach((i) => {
            const primaryRoom = i.room_of_primary_actor || 'unknown';
            const assistingRooms = Array.isArray(i.assisting_rooms)
                ? Array.from(new Set(i.assisting_rooms))
                : [];
            const patternLabel = `${primaryRoom} \\u2190 ${
                assistingRooms.length > 0 ? assistingRooms.join(', ') : 'unknown'
            }`;

            if (!assistancePatterns[patternLabel]) {
                assistancePatterns[patternLabel] = {
                    count: 0,
                    effectivenessSum: 0,
                    incidents: [],
                };
            }

            const entry = assistancePatterns[patternLabel];
            entry.count += 1;
            if (typeof i.effectiveness === 'number') {
                entry.effectivenessSum += i.effectiveness;
            }
            if (i.incident_id) {
                entry.incidents.push(i.incident_id);
            }
        });

        // Convert effectivenessSum to avgEffectiveness
        Object.keys(assistancePatterns).forEach((key) => {
            const entry = assistancePatterns[key];
            const avg = entry.count > 0 ? entry.effectivenessSum / entry.count : 0;
            entry.avgEffectiveness = avg;
            delete entry.effectivenessSum;
        });

        return {
            totalIncidents,
            crossRoomAssistanceCount,
            sameRoomOnlyCount,
            crossRoomAssistanceRate,
            assistancePatterns,
        };
    },

    // Generate narrative key findings for the dashboard
    generateKeyFindings(bestMetrics, restMetrics, crossRoomStats, metadata) {
        const findings = [];
        const incidentType = (metadata && metadata.incidentType) || 'all';

        const scopeLabel = (() => {
            switch (incidentType) {
                case 'platform_operational':
                    return 'operational';
                case 'research_integrity':
                    return 'research-integrity';
                case 'coordination_failure':
                    return 'coordination-failure';
                default:
                    return 'incident';
            }
        })();

        // Preserve validated operational claim for platform-operational slice
        if (
            incidentType === 'platform_operational' &&
            bestMetrics.count === 0 &&
            restMetrics.count > 0
        ) {
            findings.push(
                'All in-window operational incidents were handled by #rest; #best had no platform incidents in this window.',
            );
        }

        // Symmetric statement for research-integrity slice
        if (
            incidentType === 'research_integrity' &&
            restMetrics.count === 0 &&
            bestMetrics.count > 0
        ) {
            findings.push(
                'All in-window research-integrity incidents in this dataset were handled by #best; #rest had no research-integrity incidents in this window.',
            );
        }

        const denom =
            metadata &&
            typeof metadata.typedInWindowCount === 'number' &&
            metadata.typedInWindowCount > 0
                ? metadata.typedInWindowCount
                : bestMetrics.count + restMetrics.count || 1;

        const restPct = denom > 0 ? Math.round((restMetrics.count / denom) * 100) : 0;
        const bestPct = denom > 0 ? Math.round((bestMetrics.count / denom) * 100) : 0;

        findings.push(
            `Incident distribution (this view): #rest ${restMetrics.count} (${restPct}%), #best ${bestMetrics.count} (${bestPct}%).`,
        );

        const crossBase = `${crossRoomStats.crossRoomAssistanceRate}% of in-window ${scopeLabel} incidents in this view involved cross-room assistance`;
        const crossSuffix =
            crossRoomStats.crossRoomAssistanceCount === 0
                ? ' (all entries are same-room only).'
                : ` (${crossRoomStats.crossRoomAssistanceCount} with assistance, ${crossRoomStats.sameRoomOnlyCount} same-room only).`;
        findings.push(crossBase + crossSuffix);

        if (restMetrics.avgEffectiveness > 0) {
            findings.push(
                `#rest average effectiveness in this view: ${(restMetrics.avgEffectiveness * 100).toFixed(
                    0,
                )}%.`,
            );
        }

        return findings;
    },

    // Generate comparative report. Optional incidentType parameter controls slicing.
    // Default is 'platform_operational' to preserve the original operational analysis view.
    async generateComparativeReport(incidentType = 'platform_operational') {
        const allIncidents = await this.loadAnnotatedIncidents();
        const inWindow = this.filterInWindowIncidents(allIncidents);
        const typedIncidents = this.filterByIncidentType(inWindow, incidentType);

        this.allIncidents = allIncidents;
        this.currentIncidents = typedIncidents;
        this.partitionByRoom(typedIncidents);

        const bestMetrics = this.calculateRoomMetrics(this.bestIncidents, '#best');
        const restMetrics = this.calculateRoomMetrics(this.restIncidents, '#rest');
        const crossRoomStats = this.calculateCrossRoomStats(typedIncidents);

        const metadata = {
            incidentType,
            baseInWindowCount: inWindow.length,
            typedInWindowCount: typedIncidents.length,
            totalAllIncidents: allIncidents.length,
            historicalExcluded: allIncidents.length - inWindow.length,
        };

        const summary = {
            bestRoom: bestMetrics,
            restRoom: restMetrics,
            crossRoomStats,
        };

        const keyFindings = this.generateKeyFindings(
            bestMetrics,
            restMetrics,
            crossRoomStats,
            metadata,
        );

        return {
            metadata,
            summary,
            keyFindings,
        };
    },
};

// Export for use in dashboard and Node-based tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = crossRoomAnalysis;
}
