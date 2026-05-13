// Load and process incident data for dashboard visualization

async function loadIncidents() {
    try {
        const response = await fetch('../data/incidents.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading incidents:', error);
        return { incidents: [] };
    }
}

async function loadProtocols() {
    try {
        const response = await fetch('../data/protocols.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading protocols:', error);
        return { protocols: [] };
    }
}

async function loadPatterns() {
    try {
        const response = await fetch('../data/patterns.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading patterns:', error);
        return { patterns: [] };
    }
}

async function loadPatternRegimes() {
    try {
        const response = await fetch('../data/pattern_regimes.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading pattern regimes:', error);
        return [];
    }
}

// Calculate maturity index based on regime metrics
function calculateMaturityIndex(regime) {
    if (!regime) return 0.5; // Default neutral
    
    const regimeScores = {
        'failure_diagnostic': 0.3,
        'solution_prescriptive': 0.6,
        'dual_dense': 0.8,
        'balanced_success': 0.9,
        'solution_prescriptive_dual_dense': 0.85
    };
    
    const regimeScore = regimeScores[regime.regime] || 0.5;
    const biasScore = regime.documentation_bias === 'balanced' ? 1.0 : 0.8;
    const balanceScore = Math.min(regime.balance_ratio / 2, 1.0); // Normalize to 0-1
    
    return (regimeScore + biasScore + balanceScore) / 3;
}

// Calculate effectiveness metrics by category, enriched with regime data
function calculateCategoryMetrics(incidents, regimes) {
    const categories = {};
    const regimeMap = new Map(regimes.map(r => [r.pattern_id, r]));
    
    incidents.forEach(incident => {
        const cat = incident.pattern_category;
        if (!categories[cat]) {
            categories[cat] = { 
                total: 0, 
                count: 0, 
                incidents: [],
                maturityTotal: 0,
                regimeData: []
            };
        }
        categories[cat].total += incident.effectiveness_score;
        categories[cat].count += 1;
        categories[cat].incidents.push(incident);
    });
    
    // Add regime data to categories
    regimes.forEach(regime => {
        const cat = regime.category;
        if (categories[cat]) {
            categories[cat].regimeData.push(regime);
            categories[cat].maturityTotal += calculateMaturityIndex(regime);
        }
    });
    
    // Calculate averages and enriched metrics
    Object.keys(categories).forEach(cat => {
        const metrics = categories[cat];
        metrics.effectiveness = metrics.total / metrics.count;
        metrics.maturityIndex = metrics.regimeData.length > 0 
            ? metrics.maturityTotal / metrics.regimeData.length 
            : 0.5;
        metrics.enrichedEffectiveness = (metrics.effectiveness * 0.7) + (metrics.maturityIndex * 0.3);
    });
    
    return categories;
}

// Populate incident table
function populateIncidentTable(incidents) {
    const tbody = document.querySelector('#incidentTable tbody');
    if (!tbody) return;
    
    tbody.innerHTML = incidents.map(incident => `
        <tr>
            <td><strong>${incident.title}</strong></td>
            <td><span class="badge bg-secondary">${incident.pattern_category}</span></td>
            <td><span class="badge bg-${getStatusColor(incident.status)}">${incident.status}</span></td>
            <td>${(incident.effectiveness_score * 100).toFixed(0)}%</td>
            <td>${incident.date}</td>
        </tr>
    `).join('');
}

function getStatusColor(status) {
    const colors = {
        'RESOLVED': 'success',
        'WORKAROUND-APPLIED': 'warning',
        'ESCALATION-REQUIRED': 'danger'
    };
    return colors[status] || 'secondary';
}

// Update effectiveness summary with maturity index
function updateMetricSummary(metrics) {
    const container = document.querySelector('#metricSummary');
    if (!container) return;
    
    let html = '<div class="row">';
    Object.keys(metrics).forEach(cat => {
        const metric = metrics[cat];
        const enriched = (metric.enrichedEffectiveness * 100).toFixed(0);
        html += `
            <div class="col-md-3 mb-3">
                <div class="card ${cat}">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${cat}</h6>
                        <div class="metric-highlight">${enriched}%</div>
                        <small class="text-muted">${metric.count} incident${metric.count !== 1 ? 's' : ''}</small>
                        <br/>
                        <small class="badge bg-info mt-2">Maturity: ${(metric.maturityIndex * 100).toFixed(0)}%</small>
                    </div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    container.innerHTML = html;
}

// Initialize dashboard
async function initializeDashboard() {
    const incidentsData = await loadIncidents();
    const protocolsData = await loadProtocols();
    const patternsData = await loadPatterns();
    const regimesData = await loadPatternRegimes();
    
    const incidents = incidentsData.incidents || [];
    const regimes = Array.isArray(regimesData) ? regimesData : [];
    const categories = calculateCategoryMetrics(incidents, regimes);
    
    populateIncidentTable(incidents);
    updateMetricSummary(categories);
    
    // Initialize charts
    if (window.initializeEffectivenessHeatmap) {
        initializeEffectivenessHeatmap(categories, protocolsData.protocols || [], regimes);
    }
    if (window.initializeTimeSeriesChart) {
        initializeTimeSeriesChart(incidents);
    }
    
    console.log('Dashboard initialized with', incidents.length, 'incidents and', regimes.length, 'pattern regimes');
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
