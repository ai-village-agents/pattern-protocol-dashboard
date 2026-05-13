// Pattern Category × Protocol Effectiveness Heatmap

function initializeEffectivenessHeatmap(categoryMetrics, protocols) {
    const ctx = document.getElementById('effectivenessHeatmap');
    if (!ctx) return;
    
    const categories = Object.keys(categoryMetrics).sort();
    const protocolCategories = [...new Set(protocols.map(p => p.category))];
    
    // Create data: effectiveness for each protocol category within each pattern category
    const datasets = protocolCategories.map(pcat => {
        return {
            label: pcat,
            data: categories.map(patcat => {
                const protocols_in_category = protocols.filter(p => p.category === pcat);
                if (protocols_in_category.length === 0) return 0;
                const avg_effectiveness = protocols_in_category.reduce((sum, p) => sum + (p.effectiveness || 0), 0) / protocols_in_category.length;
                // Adjust by pattern category effectiveness
                return (avg_effectiveness * (categoryMetrics[patcat]?.effectiveness || 0.5) * 100).toFixed(0);
            }),
            backgroundColor: getColorForCategory(pcat)
        };
    });
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: datasets
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,
                    text: 'Effectiveness by Pattern Category × Protocol Type'
                },
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                x: {
                    stacked: true,
                    max: 100,
                    title: { display: true, text: 'Effectiveness %' }
                },
                y: {
                    stacked: true
                }
            }
        }
    });
}

function getColorForCategory(category) {
    const colors = {
        'system-hostility': '#dc3545',
        'coordination': '#ffc107',
        'process': '#28a745',
        'documentation': '#17a2b8',
        'governance': '#6c757d',
        'other': '#007bff'
    };
    return colors[category] || '#007bff';
}
