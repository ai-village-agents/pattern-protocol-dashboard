// Cross-room analysis visualization module
// Extends dashboard with #best vs #rest comparative metrics
// Updated by Claude Opus 4.5 + GPT-5.1 to use corrected data with window_status filtering

const crossRoomAnalysis = {
    bestIncidents: [],
    restIncidents: [],
    crossRoomAssistanceIncidents: [],
    allIncidents: [],
    
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
        return incidents.filter(inc => {
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
    
    // Partition incidents by room
    partitionByRoom(incidents) {
        this.bestIncidents = incidents.filter(inc => inc.room_of_primary_actor === '#best');
        this.restIncidents = incidents.filter(inc => inc.room_of_primary_actor === '#rest');
        this.crossRoomAssistanceIncidents = incidents.filter(inc => inc.cross_room_assistance === true);
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
                incidentsByCategory: {}
            };
        }
        
        const resolved = incidents.filter(i => i.status === 'resolved').length;
        const escalated = incidents.filter(i => i.status === 'escalated_to_human').length;
        
        const complexityScore = {
            'simple': 1,
            'moderate': 2,
            'complex': 3
        };
        
        const avgComplexity = incidents.reduce((sum, i) => 
            sum + (complexityScore[i.incident_complexity] || 2), 0) / incidents.length;
        
        const avgEffectiveness = incidents.reduce((sum, i) => 
            sum + (typeof i.effectiveness === 'number' ? i.effectiveness : 0), 0) / incidents.length;
        
        const resolvedWithTime = incidents.filter(i => 
            i.status === 'resolved' && typeof i.resolution_time_minutes === 'number');
        const avgResolutionTime = resolvedWithTime.length > 0
            ? resolvedWithTime.reduce((sum, i) => sum + i.resolution_time_minutes, 0) / resolvedWithTime.length
            : 0;
        
        // Count by category
        const incidentsByCategory = {};
        incidents.forEach(i => {
            const cat = i.pattern_category || 'unknown';
            incidentsByCategory[cat] = (incidentsByCategory[cat] || 0) + 1;
        });
        
        return {
            room,
            count: incidents.length,
            avgEffectiveness: Math.round(avgEffectiveness * 100) / 100,
            avgResolutionTime: Math.round(avgResolutionTime),
            totalResolved: resolved,
            totalEscalated: escalated,
            avgComplexity: Math.round(avgComplexity * 100) / 100,
            incidentsByCategory
        };
    },
    
    // Calculate cross-room assistance statistics
    calculateCrossRoomStats(incidents) {
        if (!Array.isArray(incidents) || incidents.length === 0) {
            return {
                totalIncidents: 0,
                crossRoomCount: 0,
                crossRoomRate: 0,
                assistancePatterns: {}
            };
        }
        
        const crossRoom = incidents.filter(i => i.cross_room_assistance === true);
        
        // Count assistance patterns (de-duplicated)
        const assistancePatterns = {};
        crossRoom.forEach(i => {
            const rooms = [...new Set(i.assisting_rooms || [])];
            const pattern = `${i.room_of_primary_actor} ← ${rooms.join(', ') || 'unknown'}`;
            assistancePatterns[pattern] = (assistancePatterns[pattern] || 0) + 1;
        });
        
        return {
            totalIncidents: incidents.length,
            crossRoomCount: crossRoom.length,
            crossRoomRate: Math.round((crossRoom.length / incidents.length) * 100),
            assistancePatterns
        };
    },
    
    // Generate comparative report
    async generateComparativeReport() {
        const allIncidents = await this.loadAnnotatedIncidents();
        // Filter to strict in-window incidents only
        const incidents = this.filterInWindowIncidents(allIncidents);
        this.allIncidents = incidents;
        this.partitionByRoom(incidents);
        
        const bestMetrics = this.calculateRoomMetrics(this.bestIncidents, '#best');
        const restMetrics = this.calculateRoomMetrics(this.restIncidents, '#rest');
        const crossRoomStats = this.calculateCrossRoomStats(incidents);
        
        // Generate key findings text
        const keyFindings = [];
        
        if (bestMetrics.count === 0 && restMetrics.count > 0) {
            keyFindings.push("All in-window operational incidents were handled by #rest; #best had no platform incidents in this window.");
        } else if (bestMetrics.count > 0 && restMetrics.count > 0) {
            const ratio = restMetrics.count / (bestMetrics.count || 1);
            keyFindings.push(`#rest handled ${ratio.toFixed(1)}x more incidents than #best (${restMetrics.count} vs ${bestMetrics.count}).`);
        }
        
        keyFindings.push(`Incident distribution: #rest ${restMetrics.count} (${Math.round(restMetrics.count / (incidents.length || 1) * 100)}%), #best ${bestMetrics.count} (${Math.round(bestMetrics.count / (incidents.length || 1) * 100)}%).`);
        keyFindings.push(`${crossRoomStats.crossRoomRate}% of in-window incidents involved cross-room assistance${crossRoomStats.crossRoomCount === 0 ? ' (all entries are same-room only)' : ''}.`);
        
        if (restMetrics.avgEffectiveness > 0) {
            keyFindings.push(`#rest average effectiveness: ${(restMetrics.avgEffectiveness * 100).toFixed(0)}%.`);
        }
        
        return {
            totalInWindowIncidents: incidents.length,
            totalAllIncidents: allIncidents.length,
            historicalExcluded: allIncidents.length - incidents.length,
            bestMetrics,
            restMetrics,
            crossRoomStats,
            keyFindings
        };
    }
};

// Export for use in dashboard
if (typeof module !== 'undefined' && module.exports) {
    module.exports = crossRoomAnalysis;
}
