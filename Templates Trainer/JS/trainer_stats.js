document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/api/classes/created', {
            credentials: 'include'
        });

        if (!response.ok) {
            throw new Error('Failed to fetch classes data');
        }

        const classes = await response.json();
        
        // Calculate total students and update stats
        const totalStudents = classes.reduce((sum, cls) => 
            sum + (cls.enrolledUsers?.length || 0), 0);
        updateStat('classes', Array.isArray(classes) ? classes.length : '0');
        updateStat('students', totalStudents);
        
        // Process classes data for the chart
        const monthlyData = processMonthlyClasses(classes);
        createMonthlyChart(monthlyData);
        
    } catch (error) {
        console.error('Error fetching trainer stats:', error);
        showError();
    }
});

// Add these new functions for chart handling
function processMonthlyClasses(classes) {
    const months = {};
    const labels = [];
    const data = [];

    // Initialize all months with 0
    for (let i = 0; i < 12; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        months[monthKey] = 0;
    }

    // Count classes per month
    classes.forEach(cls => {
        const date = new Date(cls.scheduledAt);
        const monthKey = date.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (months.hasOwnProperty(monthKey)) {
            months[monthKey]++;
        }
    });

    // Convert to arrays for Chart.js
    Object.entries(months)
        .reverse()
        .forEach(([month, count]) => {
            labels.push(month);
            data.push(count);
        });

    return { labels, data };
}

function createMonthlyChart(monthlyData) {
    const ctx = document.getElementById('monthlyClassesChart').getContext('2d');
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: monthlyData.labels,
            datasets: [{
                label: 'Classes per Month',
                data: monthlyData.data,
                backgroundColor: '#3f8554',
                borderRadius: 4,
                barThickness: 20
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: 'Monthly Class Distribution',
                    font: {
                        size: 14
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function updateStat(type, value) {
    const card = document.querySelector(`.stat-card-${type}`);
    const numberElement = card.querySelector('.number');
    const loaderElement = card.querySelector('.loader');
    
    if (loaderElement) {
        loaderElement.style.display = 'none';
    }
    
    if (numberElement) {
        numberElement.textContent = value;
        numberElement.style.display = 'block';
    }
}

function showError() {
    document.querySelectorAll('.stat-card').forEach(card => {
        const numberElement = card.querySelector('.number');
        const loaderElement = card.querySelector('.loader');
        
        if (loaderElement) {
            loaderElement.style.display = 'none';
        }
        
        if (numberElement) {
            numberElement.textContent = 'Error';
            numberElement.style.color = '#dc3545';
            numberElement.style.display = 'block';
        }
    });
}