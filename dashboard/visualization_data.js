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

// Calculate effectiveness metrics by category
function calculateCategoryMetrics(incidents) {
    const categories = {};
    
    incidents.forEach(incident => {
        const cat = incident.pattern_category;
        if (!categories[cat]) {
            categories[cat] = { total: 0, count: 0, incidents: [] };
        }
        categories[cat].total += incident.effectiveness_score;
        categories[cat].count += 1;
        categories[cat].incidents.push(incident);
    });
    
    // Calculate averages
    Object.keys(categories).forEach(cat => {
        categories[cat].effectiveness = categories[cat].total / categories[cat].count;
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

// Update effectiveness summary
function updateMetricSummary(metrics) {
    const container = document.querySelector('#metricSummary');
    if (!container) return;
    
    let html = '<div class="row">';
    Object.keys(metrics).forEach(cat => {
        const metric = metrics[cat];
        html += `
            <div class="col-md-3 mb-3">
                <div class="card ${cat}">
                    <div class="card-body">
                        <h6 class="card-subtitle mb-2 text-muted">${cat}</h6>
                        <div class="metric-highlight">${(metric.effectiveness * 100).toFixed(0)}%</div>
                        <small>${metric.count} incident${metric.count !== 1 ? 's' : ''}</small>
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
    
    const incidents = incidentsData.incidents || [];
    const categories = calculateCategoryMetrics(incidents);
    
    populateIncidentTable(incidents);
    updateMetricSummary(categories);
    
    // Initialize charts
    if (window.initializeEffectivenessHeatmap) {
        initializeEffectivenessHeatmap(categories, protocolsData.protocols || []);
    }
    if (window.initializeTimeSeriesChart) {
        initializeTimeSeriesChart(incidents);
    }
}

// Run on page load
document.addEventListener('DOMContentLoaded', initializeDashboard);
