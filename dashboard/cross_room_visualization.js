// Cross-room analysis visualization module
// Extends dashboard with #best vs #rest comparative metrics

const crossRoomAnalysis = {
    bestIncidents: [],
    restIncidents: [],
    crossRoomAssistanceIncidents: [],
    
    // Load cross-room annotated incidents
    async loadAnnotatedIncidents() {
        try {
            const response = await fetch('../data/cross_room_incidents_annotated.json');
            return await response.json();
        } catch (error) {
            console.error('Error loading cross-room incidents:', error);
            return [];
        }
    },
    
    // Partition incidents by room
    partitionByRoom(incidents) {
        this.bestIncidents = incidents.filter(inc => inc.room_of_primary_actor === '#best');
        this.restIncidents = incidents.filter(inc => inc.room_of_primary_actor === '#rest');
        this.crossRoomAssistanceIncidents = incidents.filter(inc => inc.cross_room_assistance === true);
    },
    
    // Calculate room-specific effectiveness metrics
    calculateRoomMetrics(incidents, room) {
        if (incidents.length === 0) {
            return {
                room,
                count: 0,
                avgEffectiveness: 0,
                avgResolutionTime: 0,
                totalResolved: 0,
                totalEscalated: 0,
                avgComplexity: 0,
                incidentsByCategory: {}
            };
        }
        
        const resolved = incidents.filter(i => i.status === 'resolved').length;
        const escalated = incidents.filter(i => i.status === 'escalated_to_human').length;
        
        // Calculate complexity score
        const complexityScore = {
            'simple': 1,
            'moderate': 2,
            'complex': 3
        };
        const avgComplexity = incidents.reduce((sum, i) => sum + (complexityScore[i.incident_complexity] || 2), 0) / incidents.length;
        
        // Group by category
        const byCategory = {};
        incidents.forEach(incident => {
            if (!byCategory[incident.pattern_category]) {
                byCategory[incident.pattern_category] = {
                    count: 0,
                    effectiveness: 0,
                    incidents: []
                };
            }
            byCategory[incident.pattern_category].count += 1;
            byCategory[incident.pattern_category].effectiveness += incident.effectiveness || 0;
            byCategory[incident.pattern_category].incidents.push(incident.incident_id);
        });
        
        // Calculate average effectiveness
        const avgEffectiveness = incidents.reduce((sum, i) => sum + (i.effectiveness || 0), 0) / incidents.length;
        
        // Filter out null resolution times
        const resolutionTimes = incidents.filter(i => i.resolution_time_minutes).map(i => i.resolution_time_minutes);
        const avgResolutionTime = resolutionTimes.length > 0 
            ? resolutionTimes.reduce((sum, t) => sum + t, 0) / resolutionTimes.length 
            : 0;
        
        return {
            room,
            count: incidents.length,
            avgEffectiveness,
            avgResolutionTime,
            totalResolved: resolved,
            totalEscalated: escalated,
            avgComplexity,
            incidentsByCategory: byCategory
        };
    },
    
    // Calculate cross-room assistance statistics
    calculateCrossRoomStats(incidents) {
        const total = incidents.length;
        const crossRoom = incidents.filter(i => i.cross_room_assistance === true).length;
        const sameRoom = total - crossRoom;
        
        // Analyze which rooms assist which
        const assistancePatterns = {};
        incidents.forEach(incident => {
            if (incident.cross_room_assistance && incident.assisting_rooms && incident.assisting_rooms.length > 0) {
                const key = `${incident.room_of_primary_actor} ← ${incident.assisting_rooms.join(', ')}`;
                if (!assistancePatterns[key]) {
                    assistancePatterns[key] = {
                        count: 0,
                        incidents: [],
                        avgEffectiveness: 0
                    };
                }
                assistancePatterns[key].count += 1;
                assistancePatterns[key].incidents.push(incident.incident_id);
                assistancePatterns[key].avgEffectiveness += (incident.effectiveness || 0);
            }
        });
        
        // Calculate averages
        Object.keys(assistancePatterns).forEach(key => {
            const pattern = assistancePatterns[key];
            pattern.avgEffectiveness = pattern.avgEffectiveness / pattern.count;
        });
        
        return {
            totalIncidents: total,
            crossRoomAssistanceCount: crossRoom,
            sameRoomOnlyCount: sameRoom,
            crossRoomAssistanceRate: total > 0 ? (crossRoom / total * 100).toFixed(2) : 0,
            assistancePatterns
        };
    },
    
    // Generate comparative analysis report
    async generateComparativeReport() {
        const incidents = await this.loadAnnotatedIncidents();
        this.partitionByRoom(incidents);
        
        const bestMetrics = this.calculateRoomMetrics(this.bestIncidents, '#best');
        const restMetrics = this.calculateRoomMetrics(this.restIncidents, '#rest');
        const crossRoomStats = this.calculateCrossRoomStats(incidents);
        
        return {
            timestamp: new Date().toISOString(),
            summary: {
                bestRoom: bestMetrics,
                restRoom: restMetrics,
                crossRoomStats: crossRoomStats
            },
            comparativeMetrics: {
                effectivenessRatio: bestMetrics.avgEffectiveness / (restMetrics.avgEffectiveness || 1),
                resolutionTimeRatio: restMetrics.avgResolutionTime / (bestMetrics.avgResolutionTime || 1),
                bestIncidentRate: (bestMetrics.count / incidents.length * 100).toFixed(2),
                restIncidentRate: (restMetrics.count / incidents.length * 100).toFixed(2),
                crossRoomAssistanceRate: crossRoomStats.crossRoomAssistanceRate
            },
            keyFindings: this.generateKeyFindings(bestMetrics, restMetrics, crossRoomStats)
        };
    },
    
    // Generate narrative key findings
    generateKeyFindings(bestMetrics, restMetrics, crossRoomStats) {
        const findings = [];
        
        // Effectiveness finding
        if (bestMetrics.avgEffectiveness > restMetrics.avgEffectiveness) {
            const diff = ((bestMetrics.avgEffectiveness - restMetrics.avgEffectiveness) * 100).toFixed(1);
            findings.push(`#best room shows ${diff}% higher average effectiveness (${(bestMetrics.avgEffectiveness * 100).toFixed(1)}% vs ${(restMetrics.avgEffectiveness * 100).toFixed(1)}%)`);
        } else {
            const diff = ((restMetrics.avgEffectiveness - bestMetrics.avgEffectiveness) * 100).toFixed(1);
            findings.push(`#rest room shows ${diff}% higher average effectiveness (${(restMetrics.avgEffectiveness * 100).toFixed(1)}% vs ${(bestMetrics.avgEffectiveness * 100).toFixed(1)}%)`);
        }
        
        // Incident distribution
        findings.push(`#best: ${bestMetrics.count} incidents (${(bestMetrics.count / (bestMetrics.count + restMetrics.count) * 100).toFixed(1)}%), #rest: ${restMetrics.count} incidents`);
        
        // Resolution efficiency
        if (bestMetrics.avgResolutionTime > 0 && restMetrics.avgResolutionTime > 0) {
            const faster = bestMetrics.avgResolutionTime < restMetrics.avgResolutionTime ? '#best' : '#rest';
            findings.push(`${faster} room resolves incidents faster on average`);
        }
        
        // Cross-room collaboration
        findings.push(`${crossRoomStats.crossRoomAssistanceRate}% of incidents involved cross-room assistance`);
        
        // Complexity handling
        if (bestMetrics.avgComplexity !== restMetrics.avgComplexity) {
            const moreMature = bestMetrics.avgComplexity > restMetrics.avgComplexity ? '#best' : '#rest';
            findings.push(`${moreMature} room handles higher complexity incidents on average`);
        }
        
        return findings;
    }
};

// Export for use in HTML
if (typeof module !== 'undefined' && module.exports) {
    module.exports = crossRoomAnalysis;
}
