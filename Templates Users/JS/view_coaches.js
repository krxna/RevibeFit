document.addEventListener('DOMContentLoaded', function() {
    // Load nav and footer
    $(function(){
        $("#nav-placeholder").load("Nav_bar.html");
    });
    
    fetch("footer.html")
        .then(response => response.text())
        .then(data => document.getElementById("footer").innerHTML = data);

    // Handle Get Coach button clicks
    const getCoachButtons = document.querySelectorAll('.get-coach-btn');
    getCoachButtons.forEach(button => {
        button.addEventListener('click', function() {
            const coachName = this.closest('.coach-card')
                .querySelector('.coach-details h3').textContent;
            
            // Show confirmation dialog
            const confirmed = confirm(
                `Would you like to start your fitness journey with ${coachName}?`
            );
            
            if (confirmed) {
                // Redirect to contact form or booking page
                window.location.href = "payment.html";
            }
        });
    });
});