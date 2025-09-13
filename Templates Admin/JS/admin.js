document.addEventListener('DOMContentLoaded', function() {
    // Get the chart context once
    const ctx = document.getElementById('chart').getContext('2d');
    
    // Create chart data
    const chartData = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Monthly Users',
            data: [65, 59, 80, 81, 56, 55],
            borderColor: '#3f8554',
            backgroundColor: 'rgba(63, 133, 84, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        },
        {
            label: 'Revenue Growth ($)',
            data: [4200, 4800, 5100, 5400, 5800, 6200],
            borderColor: '#4fb16d',
            backgroundColor: 'rgba(79, 177, 109, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4
        }]
    };

    // Chart configuration
    const config = {
        type: 'line',
        data: chartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Monthly Growth Analysis',
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    padding: 20
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        font: {
                            size: 12
                        }
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };

    // Initialize the chart
    const monthlyGrowthChart = new Chart(ctx, config);

    // Handle time range changes
    document.getElementById('timeRange').addEventListener('change', function() {
        const months = parseInt(this.value);
        updateChartData(monthlyGrowthChart, months);
    });

    // Add active class to current nav item
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', function() {
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
});

function updateChartData(chart, months) {
    // Sample data for different time ranges
    const data = {
        3: {
            labels: ['Apr', 'May', 'Jun'],
            users: [81, 56, 55],
            revenue: [5400, 5800, 6200]
        },
        6: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            users: [65, 59, 80, 81, 56, 55],
            revenue: [4200, 4800, 5100, 5400, 5800, 6200]
        },
        12: {
            labels: ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            users: [45, 51, 55, 58, 62, 64, 65, 59, 80, 81, 56, 55],
            revenue: [3600, 3800, 4000, 4100, 4150, 4180, 4200, 4800, 5100, 5400, 5800, 6200]
        }
    };

    // Update chart data
    chart.data.labels = data[months].labels;
    chart.data.datasets[0].data = data[months].users;
    chart.data.datasets[1].data = data[months].revenue;
    
    // Update the chart
    chart.update();
}