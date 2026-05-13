// Load and process incident data for dashboard visualization
const dashboardState = {
    allIncidents: [],
    protocols: [],
    regimes: [],
    includeSimulation: true,
    simulationWeight: 0.7
};

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

async function loadSimulationIncidents() {
    try {
        const response = await fetch('../simulations/simulation_incidents.json');
        return await response.json();
    } catch (error) {
        console.error('Error loading simulation incidents:', error);
        return { incidents: [] };
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
function calculateCategoryMetrics(incidents, regimes, simulationWeight = 1) {
    const categories = {};
    
    incidents.forEach(incident => {
        const cat = incident.pattern_category;
        if (!categories[cat]) {
            categories[cat] = { 
                total: 0, 
                count: 0, 
                weightedCount: 0,
                realCount: 0,
                simulationCount: 0,
                incidents: [],
                maturityTotal: 0,
                regimeData: []
            };
        }
        const isSimulation = incident.type === 'simulation';
        const weight = isSimulation ? simulationWeight : 1;
        categories[cat].total += incident.effectiveness_score * weight;
        categories[cat].count += 1;
        categories[cat].weightedCount += weight;
        categories[cat].realCount += isSimulation ? 0 : 1;
        categories[cat].simulationCount += isSimulation ? 1 : 0;
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
        metrics.effectiveness = metrics.weightedCount > 0 ? metrics.total / metrics.weightedCount : 0;
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

    if (!incidents.length) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No incidents to display</td></tr>';
        return;
    }
    
    tbody.innerHTML = incidents.map(incident => {
        const isSimulation = incident.type === 'simulation';
        const icon = isSimulation ? '🧪' : '📌';
        const typeBadge = isSimulation 
            ? '<span class="badge bg-warning text-dark">Simulation</span>' 
            : '<span class="badge bg-success">Real</span>';
        return `
            <tr class="${isSimulation ? 'simulation-row' : ''}">
                <td><span class="me-2">${icon}</span><strong>${incident.title}</strong></td>
                <td>${typeBadge}</td>
                <td><span class="badge bg-secondary">${incident.pattern_category}</span></td>
                <td><span class="badge bg-${getStatusColor(incident.status)}">${incident.status}</span></td>
                <td>${(incident.effectiveness_score * 100).toFixed(0)}%</td>
                <td>${incident.date}</td>
            </tr>
        `;
    }).join('');
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
function updateMetricSummary(metrics, counts, includeSimulation) {
    const container = document.querySelector('#metricSummary');
    if (!container) return;
    
    let html = '<div class="row">';
    html += `
        <div class="col-12 mb-3">
            <div class="d-flex justify-content-between align-items-center">
                <span class="badge bg-success">Real: ${counts.real}</span>
                <span class="badge ${includeSimulation ? 'bg-warning text-dark' : 'bg-secondary'}">
                    Simulation: ${counts.simulation}${includeSimulation ? '' : ' (hidden)'}
                </span>
            </div>
        </div>
    `;
    Object.keys(metrics).forEach(cat => {
        const metric = metrics[cat];
        const enriched = (metric.enrichedEffectiveness * 100).toFixed(0);
        html += `
            <div class="col-md-3 mb-3">
                <div class="card ${cat}">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${cat}</h6>
                        <div class="metric-highlight">${enriched}%</div>
                        <small class="text-muted d-block">${metric.count} incident${metric.count !== 1 ? 's' : ''}</small>
                        <small class="text-muted">Real: ${metric.realCount} | Sim: ${metric.simulationCount}</small>
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
    const [incidentsData, simulationData, protocolsData, patternsData, regimesData] = await Promise.all([
        loadIncidents(),
        loadSimulationIncidents(),
        loadProtocols(),
        loadPatterns(),
        loadPatternRegimes()
    ]);

    const realIncidents = (incidentsData.incidents || []).map(incident => ({ ...incident, type: 'real' }));
    const simulationIncidents = (simulationData.incidents || []).map(incident => ({ ...incident, type: 'simulation' }));

    dashboardState.allIncidents = [...realIncidents, ...simulationIncidents];
    dashboardState.protocols = protocolsData.protocols || [];
    dashboardState.regimes = Array.isArray(regimesData) ? regimesData : [];
    dashboardState.baseCounts = {
        real: realIncidents.length,
        simulation: simulationIncidents.length
    };

    setupFilters();
    renderDashboard();
    
    console.log('Dashboard initialized with', dashboardState.allIncidents.length, 'incidents and', dashboardState.regimes.length, 'pattern regimes');
}

function setupFilters() {
    const toggle = document.getElementById('toggleSimulation');
    const weightSlider = document.getElementById('simulationWeight');
    const weightLabel = document.getElementById('simulationWeightValue');

    if (toggle) {
        toggle.checked = dashboardState.includeSimulation;
        toggle.addEventListener('change', () => {
            dashboardState.includeSimulation = toggle.checked;
            renderDashboard();
        });
    }

    if (weightSlider && weightLabel) {
        weightSlider.value = dashboardState.simulationWeight;
        weightLabel.textContent = `${parseFloat(weightSlider.value).toFixed(2)}x`;
        weightSlider.addEventListener('input', () => {
            dashboardState.simulationWeight = parseFloat(weightSlider.value);
            weightLabel.textContent = `${dashboardState.simulationWeight.toFixed(2)}x`;
            renderDashboard();
        });
    }
}

function getFilteredIncidents() {
    return dashboardState.allIncidents.filter(incident => 
        dashboardState.includeSimulation || incident.type !== 'simulation'
    );
}

function renderDashboard() {
    const incidents = getFilteredIncidents();
    const categories = calculateCategoryMetrics(incidents, dashboardState.regimes, dashboardState.simulationWeight);
    
    populateIncidentTable(incidents);
    updateMetricSummary(categories, dashboardState.baseCounts, dashboardState.includeSimulation);
    
    // Initialize charts
    if (window.initializeEffectivenessHeatmap) {
        initializeEffectivenessHeatmap(categories, dashboardState.protocols || [], dashboardState.regimes);
    }
    if (window.initializeTimeSeriesChart) {
        initializeTimeSeriesChart(incidents);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
