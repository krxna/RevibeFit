document.addEventListener('DOMContentLoaded', function() {
    // Make class cards clickable
    const classCards = document.querySelectorAll('.class-card');
    classCards.forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', function() {
            const classTitle = this.querySelector('.class-title').textContent;
            console.log(`Clicked on class: ${classTitle}`);
            // Add your navigation logic here
        });
    });

    // Set up event delegation for dynamically loaded trainer cards
    document.addEventListener('click', function(event) {
        // Check if the clicked element or its parent is a trainer card
        const trainerCard = event.target.closest('.trainer-card');
        if (trainerCard && !event.target.matches('.view-profile-btn')) {
            const trainerName = trainerCard.querySelector('.trainer-name').textContent;
            const trainerId = trainerCard.dataset.trainerId;
            console.log(`Clicked on trainer: ${trainerName}, ID: ${trainerId}`);
            window.location.href = `/trainer-profile/${trainerId}`;
        }
    });

    // Make view all links hoverable
    const viewAllLinks = document.querySelectorAll('.view-all');
    viewAllLinks.forEach(link => {
        link.style.cursor = 'pointer';
        link.addEventListener('click', function(e) {
            e.preventDefault();
            if (this.closest('.section-header').querySelector('.section-title').textContent.includes('Trainer')) {
                window.location.href = '/all-trainers';
            } else {
                window.location.href = '/all-videos';
            }
        });
    });

    // Make buttons hoverable
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => {
        button.style.cursor = 'pointer';
    });
});


