let fitnessGrowthChart;
let classesGrowthChart;

document.addEventListener('DOMContentLoaded', function() {
    initializeFitnessGrowthChart();
    initializeClassesGrowthChart();
    fetchDashboardStats();
    
    // Handle time range changes
    document.getElementById('timeRange').addEventListener('change', function() {
        const months = parseInt(this.value);
        updateFitnessChartData(months);
    });

    document.getElementById('classTimeRange').addEventListener('change', function() {
        const months = parseInt(this.value);
        updateClassesChartData(months);
    });
});

async function fetchDashboardStats() {
    try {
        const response = await fetch('http://localhost:3001/api/admin/dashboard-stats', {
            credentials: 'include' // Add this if you're using sessions
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Received data:', data); // Debug log
        
        if (data.success) {
            updateStats(data.stats);
        } else {
            throw new Error(data.error || 'Failed to fetch stats');
        }
    } catch (error) {
        console.error('Fetch error:', error);
        showError();
    }
}

function showLoading() {
    document.querySelectorAll('.stat-card .number').forEach(num => {
        num.style.display = 'none';
    });
    document.querySelectorAll('.stat-card .loader').forEach(loader => {
        loader.style.display = 'block';
    });
}

function updateStats(stats) {
    console.log('Updating stats:', stats); // Debug log
    
    if (!stats) {
        console.error('No stats data received');
        showError();
        return;
    }

    const statElements = {
        'fitness-users': stats.fitnessEnthusiasts,
        'trainers': stats.trainers,
        'lab-partners': stats.labPartners,
        'total-classes': stats.totalClasses
    };

    Object.entries(statElements).forEach(([id, value]) => {
        const card = document.getElementById(id);
        if (!card) {
            console.error(`Element with id ${id} not found`);
            return;
        }

        const numberEl = card.querySelector('.number');
        const loaderEl = card.querySelector('.loader');

        if (numberEl && loaderEl) {
            numberEl.textContent = value || '0';
            numberEl.style.display = 'block';
            loaderEl.style.display = 'none';
        }
    });
}

function showError() {
    document.querySelectorAll('.stat-card').forEach(card => {
        const numberElement = card.querySelector('.number');
        const loaderElement = card.querySelector('.loader');
        
        if (numberElement && loaderElement) {
            numberElement.textContent = 'Error';
            numberElement.style.color = '#dc3545';
            numberElement.style.display = 'block';
            loaderElement.style.display = 'none';
        }
    });
}

function initializeFitnessGrowthChart() {
    const ctx = document.getElementById('fitnessGrowthChart').getContext('2d');
    fitnessGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'New Fitness Enthusiasts',
                data: [],
                borderColor: '#3f8554',
                backgroundColor: 'rgba(63, 133, 84, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

function initializeClassesGrowthChart() {
    const ctx = document.getElementById('classesGrowthChart').getContext('2d');
    classesGrowthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Total Classes',
                data: [],
                borderColor: '#4fb16d',
                backgroundColor: 'rgba(79, 177, 109, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        precision: 0
                    }
                }
            }
        }
    });
}

async function updateFitnessChartData(months) {
    try {
        const response = await fetch(`http://localhost:3001/api/admin/fitness-growth?months=${months}`);
        const data = await response.json();
        
        if (data.success) {
            fitnessGrowthChart.data.labels = data.labels;
            fitnessGrowthChart.data.datasets[0].data = data.data;
            fitnessGrowthChart.update();
        } else {
            console.error('Failed to fetch growth data');
        }
    } catch (error) {
        console.error('Error fetching growth data:', error);
    }
}

async function updateClassesChartData(months) {
    try {
        const response = await fetch(`http://localhost:3001/api/admin/classes-growth?months=${months}`);
        const data = await response.json();
        
        if (data.success) {
            classesGrowthChart.data.labels = data.labels;
            classesGrowthChart.data.datasets[0].data = data.data;
            classesGrowthChart.update();
        } else {
            console.error('Failed to fetch classes growth data');
        }
    } catch (error) {
        console.error('Error fetching classes growth data:', error);
    }
}