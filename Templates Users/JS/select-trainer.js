document.addEventListener('DOMContentLoaded', function() {
    // Load nav and footer
    $(function(){
        $("#nav-placeholder").load("Nav_bar.html");
    });
    
    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data);

    // Get class type from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const classType = urlParams.get('class');

    // Handle time slot selection
    const timeSlotSelects = document.querySelectorAll('.time-slot-select');
    timeSlotSelects.forEach(select => {
        select.addEventListener('change', function() {
            const bookBtn = this.nextElementSibling;
            bookBtn.disabled = !this.value;
        });
    });

    // Handle booking
    const bookButtons = document.querySelectorAll('.book-class-btn');
    bookButtons.forEach(button => {
        button.addEventListener('click', function() {
            const select = this.previousElementSibling;
            const selectedSlot = select.value;
            
            if (selectedSlot) {
                const [day, time] = selectedSlot.split('-');
                const trainerName = this.closest('.trainer-card')
                    .querySelector('.trainer-details h3').textContent;
                
                // Show confirmation dialog
                const confirmed = confirm(
                    `Confirm booking:\nTrainer: ${trainerName}\nDay: ${day}\nTime: ${time}\n\nProceed with booking?`
                );
                
                if (confirmed) {
                    alert('Class booked successfully! Check your email for confirmation.');
                    // Here you would typically make an API call to save the booking
                }
            }
        });
    });
});
