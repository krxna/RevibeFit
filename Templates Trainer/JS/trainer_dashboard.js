/* filepath: d:\Programs\Project FSD\FSD-Project\Templates Trainer\JS\trainer_dashboard.js */
document.addEventListener('DOMContentLoaded', function() {
    // Profile Engagement Chart
    const engagementCtx = document.getElementById('engagementChart').getContext('2d');
    new Chart(engagementCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Profile Views',
                data: [150, 200, 180, 250, 300, 324],
                borderColor: '#3f8554',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Revenue Growth Chart
    const revenueCtx = document.getElementById('revenueChart').getContext('2d');
    new Chart(revenueCtx, {
        type: 'bar',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Monthly Revenue ($)',
                data: [3200, 3800, 4100, 4500, 4800, 5249],
                backgroundColor: '#3f8554'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });

    // Class Distribution Chart
    const distributionCtx = document.getElementById('classDistribution').getContext('2d');
    new Chart(distributionCtx, {
        type: 'doughnut',
        data: {
            labels: ['HIIT', 'Strength', 'Yoga', 'Cardio', 'Other'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#3f8554',
                    '#4fb16d',
                    '#6dbf87',
                    '#8ccca1',
                    '#aad9bb'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false
        }
    });
});