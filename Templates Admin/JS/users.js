document.addEventListener('DOMContentLoaded', function() {
    // Existing tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            document.getElementById(`${tabName}-tab`).classList.add('active');

            // Load appropriate data based on tab
            switch(tabName) {
                case 'trainers':
                    fetchTrainersData();
                    break;
                case 'clients':
                    fetchFitnessEnthusiasts();
                    break;
                case 'labs':
                    fetchLabPartners();
                    break;
            }
        });
    });

    // Add new function to fetch lab partners data
    async function fetchLabPartners() {
        const tbody = document.getElementById('lab-partners-tbody');
        tbody.innerHTML = '<tr><td colspan="7">Loading lab partners...</td></tr>';

        try {
            const response = await fetch('http://localhost:3001/api/admin/lab-partners');
            const data = await response.json();

            if (!data.success) {
                throw new Error(data.error || 'Failed to fetch lab partners');
            }

            tbody.innerHTML = data.labPartners.map((lab, index) => `
                <tr>
                    <td>#L${String(index + 1).padStart(3, '0')}</td>
                    <td>${lab.labProfile?.lab_name || 'N/A'}</td>
                    <td>${lab.name || 'N/A'}</td>
                    <td>${lab.email || 'N/A'}</td>
                    <td>${lab.phone || 'N/A'}</td>
                    <td>${lab.labProfile?.license_number || 'N/A'}</td>
                    <td><span class="status ${lab.status?.toLowerCase() || 'active'}">${lab.status || 'Active'}</span></td>
                </tr>
            `).join('');

        } catch (error) {
            console.error('Error fetching lab partners:', error);
            tbody.innerHTML = `
                <tr>
                    <td colspan="7" style="color: red;">
                        Failed to load lab partners. Please try again later.
                    </td>
                </tr>
            `;
        }
    }

    // Initial load of data based on active tab
    const activeTab = document.querySelector('.tab-btn.active').getAttribute('data-tab');
    switch(activeTab) {
        case 'trainers':
            fetchTrainersData();
            break;
        case 'clients':
            fetchFitnessEnthusiasts();
            break;
        case 'labs':
            fetchLabPartners();
            break;
    }

    // Trainer approval functionality
    const approveBtns = document.querySelectorAll('.approve-btn');
    const rejectBtns = document.querySelectorAll('.reject-btn');

    approveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.trainer-card');
            card.style.opacity = '0.5';
            setTimeout(() => card.remove(), 500);
        });
    });

    rejectBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const card = this.closest('.trainer-card');
            card.style.opacity = '0.5';
            setTimeout(() => card.remove(), 500);
        });
    });
});

async function fetchFitnessEnthusiasts() {
    const tbody = document.getElementById('fitness-users-tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading users...</td></tr>';

    try {
        const response = await fetch('http://localhost:3001/api/admin/fitness-users');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch users');
        }

        tbody.innerHTML = data.users.map((user, index) => `
            <tr>
                <td>${index + 1}</td>
                <td class="user-info">${user.name || 'N/A'}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.phone || 'N/A'}</td>
                <td>${user.fitnessProfile?.goals || 'Not set'}</td>
                <td>${user.fitnessProfile?.fitness_level || 'Not set'}</td>
                <td><span class="status active">Active</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error fetching fitness enthusiasts:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="color: red;">
                    Failed to load users. Please try again later.
                </td>
            </tr>
        `;
    }
}

async function fetchTrainersData() {
    const tbody = document.querySelector('#trainers-tab tbody');
    tbody.innerHTML = '<tr><td colspan="7">Loading trainers...</td></tr>';

    try {
        const response = await fetch('http://localhost:3001/api/admin/trainers-data');
        const data = await response.json();

        if (!data.success) {
            throw new Error(data.error || 'Failed to fetch trainers');
        }

        tbody.innerHTML = data.trainers.map((trainer, index) => `
            <tr>
                <td>#T${String(index + 1).padStart(3, '0')}</td>
                <td class="user-info">${trainer.name}</td>
                <td>${trainer.email}</td>
                <td>${trainer.specialization}</td>
                <td>${trainer.clients}</td>
                <td>${trainer.classesTaken}</td>
                <td><span class="status ${trainer.status.toLowerCase()}">${trainer.status}</span></td>
            </tr>
        `).join('');

    } catch (error) {
        console.error('Error fetching trainers:', error);
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="color: red;">
                    Failed to load trainers. Please try again later.
                </td>
            </tr>
        `;
    }
}