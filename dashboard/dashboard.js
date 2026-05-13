// Pattern-Protocol Effectiveness Dashboard
// Main JavaScript for dashboard functionality

class PatternProtocolDashboard {
    constructor() {
        this.patterns = [];
        this.incidents = [];
        this.metrics = {};
        this.initializeDashboard();
    }

    async initializeDashboard() {
        console.log('Initializing Pattern-Protocol Dashboard...');
        
        // Load data
        await this.loadData();
        
        // Calculate metrics
        this.calculateMetrics();
        
        // Render visualizations
        this.renderHeatmap();
        this.renderTimeSeries();
        this.renderPatternCards();
        this.renderCategoryDistribution();
        this.updateMetricsDisplay();
        
        console.log('Dashboard initialized successfully');
    }

    async loadData() {
        try {
            // Load pattern metadata
            const patternResponse = await fetch('data/pattern_metadata.json');
            this.patterns = await patternResponse.json();
            
            // Load incident data
            const incidentResponse = await fetch('data/incidents.json');
            this.incidents = await incidentResponse.json();
            
            console.log(`Loaded ${this.patterns.length} patterns and ${this.incidents.length} incidents`);
        } catch (error) {
            console.error('Error loading data:', error);
            
            // Use fallback data if fetch fails
            this.patterns = this.getFallbackPatterns();
            this.incidents = this.getFallbackIncidents();
        }
    }

    calculateMetrics() {
        // Total patterns and protocols
        this.metrics.totalPatterns = this.patterns.length;
        this.metrics.totalProtocols = this.patterns.reduce((sum, p) => sum + (p.mitigation_protocols || 0), 0);
        
        // Calculate effectiveness by category
        this.metrics.categoryEffectiveness = {};
        this.patterns.forEach(pattern => {
            const cat = pattern.category;
            if (!this.metrics.categoryEffectiveness[cat]) {
                this.metrics.categoryEffectiveness[cat] = {
                    patterns: 0,
                    protocols: 0,
                    effectiveness: 0
                };
            }
            this.metrics.categoryEffectiveness[cat].patterns++;
            this.metrics.categoryEffectiveness[cat].protocols += pattern.mitigation_protocols || 0;
            
            // Calculate effectiveness (simplified for now)
            if (cat === 'environmental') this.metrics.categoryEffectiveness[cat].effectiveness = 85;
            else if (cat === 'process') this.metrics.categoryEffectiveness[cat].effectiveness = 75;
            else if (cat === 'coordination') this.metrics.categoryEffectiveness[cat].effectiveness = 40;
            else if (cat === 'success') this.metrics.categoryEffectiveness[cat].effectiveness = 90;
            else this.metrics.categoryEffectiveness[cat].effectiveness = 0;
        });
        
        // Calculate average effectiveness
        const categories = Object.keys(this.metrics.categoryEffectiveness);
        const totalEffectiveness = categories.reduce((sum, cat) => 
            sum + this.metrics.categoryEffectiveness[cat].effectiveness, 0);
        this.metrics.avgEffectiveness = Math.round(totalEffectiveness / categories.length);
        
        // Calculate pattern maturity index (simplified)
        this.metrics.patternMaturity = Math.round((this.metrics.totalProtocols / (this.metrics.totalPatterns * 10)) * 100);
    }

    renderHeatmap() {
        const ctx = document.getElementById('effectivenessHeatmap').getContext('2d');
        const categories = Object.keys(this.metrics.categoryEffectiveness);
        const effectivenessData = categories.map(cat => this.metrics.categoryEffectiveness[cat].effectiveness);
        
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: categories.map(cat => this.capitalizeFirstLetter(cat)),
                datasets: [{
                    label: 'Protocol Effectiveness (%)',
                    data: effectivenessData,
                    backgroundColor: this.getCategoryColors(categories),
                    borderColor: '#333',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Protocol Effectiveness by Pattern Category'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Effectiveness Rate (%)'
                        }
                    }
                }
            }
        });
    }

    renderTimeSeries() {
        const ctx = document.getElementById('timeSeriesChart').getContext('2d');
        
        // Simulated time series data (will be replaced with real data)
        const timeLabels = ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Current'];
        const envData = [70, 75, 80, 82, 85];
        const procData = [60, 65, 68, 72, 75];
        const coordData = [20, 25, 30, 35, 40];
        
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: timeLabels,
                datasets: [
                    {
                        label: 'Environmental',
                        data: envData,
                        borderColor: '#dc3545',
                        backgroundColor: 'rgba(220, 53, 69, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Process',
                        data: procData,
                        borderColor: '#28a745',
                        backgroundColor: 'rgba(40, 167, 69, 0.1)',
                        tension: 0.1
                    },
                    {
                        label: 'Coordination',
                        data: coordData,
                        borderColor: '#ffc107',
                        backgroundColor: 'rgba(255, 193, 7, 0.1)',
                        tension: 0.1
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    title: {
                        display: true,
                        text: 'Protocol Effectiveness Evolution (Last 4 Weeks)'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        title: {
                            display: true,
                            text: 'Effectiveness Rate (%)'
                        }
                    }
                }
            }
        });
    }

    renderPatternCards() {
        const container = document.getElementById('patternCards');
        container.innerHTML = '';
        
        this.patterns.forEach(pattern => {
            const card = document.createElement('div');
            card.className = `col-md-3 mb-3`;
            card.innerHTML = `
                <div class="card pattern-card ${pattern.category}">
                    <div class="card-body">
                        <h6 class="card-title">${pattern.pattern_name}</h6>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge ${this.getCategoryBadgeColor(pattern.category)} category-badge">
                                ${pattern.category}
                            </span>
                            <small class="text-muted">${pattern.verification_status}</small>
                        </div>
                        <div class="row text-center small">
                            <div class="col-6">
                                <div class="fw-bold">${pattern.mitigation_protocols || 0}</div>
                                <div class="text-muted">Protocols</div>
                            </div>
                            <div class="col-6">
                                <div class="fw-bold">${pattern.failure_types || 0}</div>
                                <div class="text-muted">Failures</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderCategoryDistribution() {
        const container = document.getElementById('categoryDistribution');
        container.innerHTML = '';
        
        Object.entries(this.metrics.categoryEffectiveness).forEach(([category, data]) => {
            const percentage = Math.round((data.patterns / this.metrics.totalPatterns) * 100);
            const bar = document.createElement('div');
            bar.className = 'mb-2';
            bar.innerHTML = `
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <span class="text-capitalize">${category}</span>
                    <span>${data.patterns} pattern${data.patterns !== 1 ? 's' : ''} (${percentage}%)</span>
                </div>
                <div class="progress" style="height: 8px;">
                    <div class="progress-bar ${this.getCategoryProgressColor(category)}" 
                         style="width: ${percentage}%;"></div>
                </div>
            `;
            container.appendChild(bar);
        });
    }

    updateMetricsDisplay() {
        document.getElementById('totalPatterns').textContent = this.metrics.totalPatterns;
        document.getElementById('totalProtocols').textContent = this.metrics.totalProtocols;
        document.getElementById('avgEffectiveness').textContent = `${this.metrics.avgEffectiveness}%`;
        document.getElementById('patternMaturity').textContent = `${this.metrics.patternMaturity}%`;
    }

    // Helper methods
    capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }

    getCategoryColors(categories) {
        const colorMap = {
            'environmental': '#dc3545',
            'process': '#28a745',
            'coordination': '#ffc107',
            'governance': '#6c757d',
            'cognitive': '#17a2b8',
            'success': '#6610f2'
        };
        return categories.map(cat => colorMap[cat] || '#666666');
    }

    getCategoryBadgeColor(category) {
        const badgeMap = {
            'environmental': 'bg-danger',
            'process': 'bg-success',
            'coordination': 'bg-warning',
            'governance': 'bg-secondary',
            'cognitive': 'bg-info',
            'success': 'bg-primary'
        };
        return badgeMap[category] || 'bg-secondary';
    }

    getCategoryProgressColor(category) {
        const progressMap = {
            'environmental': 'bg-danger',
            'process': 'bg-success',
            'coordination': 'bg-warning',
            'governance': 'bg-secondary',
            'cognitive': 'bg-info',
            'success': 'bg-primary'
        };
        return progressMap[category] || 'bg-secondary';
    }

    // Fallback data for development
    getFallbackPatterns() {
        return [
            {
                "pattern_id": "system-hostility-environmental-failures-2026-05",
                "pattern_name": "System Hostility & Environmental Failures",
                "category": "environmental",
                "mitigation_protocols": 42,
                "failure_types": 19,
                "verification_status": "verified"
            }
        ];
    }

    getFallbackIncidents() {
        return [
            {
                "pattern_ids": ["system-hostility-environmental-failures-2026-05"],
                "description": "Gemini 2.5 Pro: Persistent Total Tool Collapse (Day 4)"
            }
        ];
    }
}

// Initialize dashboard when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.dashboard = new PatternProtocolDashboard();
});
