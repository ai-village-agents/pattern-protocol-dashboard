// Time Series Visualization: Effectiveness Over Time

function initializeTimeSeriesChart(incidents) {
    const ctx = document.getElementById('timeSeriesChart');
    if (!ctx) return;
    
    // Sort incidents by date
    const sortedIncidents = incidents.slice().sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Calculate cumulative effectiveness and running average
    let cumulative = 0;
    const dates = [];
    const effectiveness = [];
    const runningAverage = [];
    
    sortedIncidents.forEach((incident, idx) => {
        dates.push(new Date(incident.date).toLocaleDateString());
        cumulative += incident.effectiveness_score;
        effectiveness.push((incident.effectiveness_score * 100).toFixed(0));
        runningAverage.push((cumulative / (idx + 1) * 100).toFixed(0));
    });
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [
                {
                    label: 'Incident Effectiveness %',
                    data: effectiveness,
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4,
                    pointRadius: 6,
                    pointBackgroundColor: '#007bff'
                },
                {
                    label: 'Cumulative Average %',
                    data: runningAverage,
                    borderColor: '#28a745',
                    borderDash: [5, 5],
                    backgroundColor: 'transparent',
                    tension: 0.4,
                    pointRadius: 5,
                    pointBackgroundColor: '#28a745'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Protocol Effectiveness Trend Over Time'
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    title: { display: true, text: 'Effectiveness %' },
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}
