document.addEventListener('DOMContentLoaded', function() {
    const recommendBtn = document.getElementById('recommendBtn');
    const healthInputs = document.getElementById('healthInputs');
    const doneBtn = document.getElementById('doneBtn');
    const recommendations = document.getElementById('recommendations');
    const tabButtons = document.querySelectorAll('.tabs button');
    
    // Add lab centers section
    const searchSection = document.querySelector('.search-section');
    const labCentersHTML = `
    <div id="labCenters" class="lab-centers" style="display: none;">
        <div class="location-input">
            <h3>Find Lab Centers Near You</h3>
            <p>Please enter your location to find nearby lab centers</p>
            <div class="input-group">
                <input type="text" id="locationInput" placeholder="Enter your address or postal code">
                <button id="findLabsBtn" class="btn btn-primary">Find Labs</button>
            </div>
            <div class="or-divider">
                <span>OR</span>
            </div>
            <button id="useCurrentLocationBtn" class="btn btn-secondary">
                <svg viewBox="0 0 24 24" style="width: 16px; height: 16px; margin-right: 8px;">
                    <path fill="currentColor" d="M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M10,22C9.75,22 9.54,21.82 9.5,21.58L9.13,18.93C8.5,18.68 7.96,18.34 7.44,17.94L4.95,18.95C4.73,19.03 4.46,18.95 4.34,18.73L2.34,15.27C2.21,15.05 2.27,14.78 2.46,14.63L4.57,12.97L4.5,12L4.57,11L2.46,9.37C2.27,9.22 2.21,8.95 2.34,8.73L4.34,5.27C4.46,5.05 4.73,4.96 4.95,5.05L7.44,6.05C7.96,5.66 8.5,5.32 9.13,5.07L9.5,2.42C9.54,2.18 9.75,2 10,2H14C14.25,2 14.46,2.18 14.5,2.42L14.87,5.07C15.5,5.32 16.04,5.66 16.56,6.05L19.05,5.05C19.27,4.96 19.54,5.05 19.66,5.27L21.66,8.73C21.79,8.95 21.73,9.22 21.54,9.37L19.43,11L19.5,12L19.43,13L21.54,14.63C21.73,14.78 21.79,15.05 21.66,15.27L19.66,18.73C19.54,18.95 19.27,19.04 19.05,18.95L16.56,17.95C16.04,18.34 15.5,18.68 14.87,18.93L14.5,21.58C14.46,21.82 14.25,22 14,22H10Z" />
                </svg>
                Use Current Location
            </button>
        </div>
        <div id="labResults" class="lab-results" style="display: none;">
            <h3>Lab Centers Near You</h3>
            <div class="lab-cards">
                <div class="lab-card">
                    <img src="/lab1.jpg" alt="City Health Labs" class="lab-img">
                    <div class="lab-content">
                        <h3>City Health Labs</h3>
                        <p class="lab-address">123 Medical Plaza, Suite 101</p>
                        <p class="lab-distance">1.2 miles away</p>
                        <div class="lab-meta">
                            <span>⭐ 4.8 (120 reviews)</span>
                            <span>Open until 6:00 PM</span>
                        </div>
                        <a href="/payment.html" class="book-now">Book Appointment</a>
                    </div>
                </div>
                <div class="lab-card">
                    <img src="/lab2.jpg" alt="Metro Diagnostics" class="lab-img">
                    <div class="lab-content">
                        <h3>Metro Diagnostics</h3>
                        <p class="lab-address">456 Health Avenue</p>
                        <p class="lab-distance">2.4 miles away</p>
                        <div class="lab-meta">
                            <span>⭐ 4.6 (85 reviews)</span>
                            <span>Open until 8:00 PM</span>
                        </div>
                        <a href="/payment.html" class="book-now">Book Appointment</a>
                    </div>
                </div>
                <div class="lab-card">
                    <img src="/lab3.webp" alt="Wellness Testing Center" class="lab-img">
                    <div class="lab-content">
                        <h3>Wellness Testing Center</h3>
                        <p class="lab-address">789 Wellness Blvd</p>
                        <p class="lab-distance">3.1 miles away</p>
                        <div class="lab-meta">
                            <span>⭐ 4.9 (210 reviews)</span>
                            <span>Open until 5:30 PM</span>
                        </div>
                        <a href="/payment.html" class="book-now">Book Appointment</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    searchSection.insertAdjacentHTML('beforeend', labCentersHTML);
    
    // Add CSS for lab centers
    const style = document.createElement('style');
    style.textContent = `
    .lab-centers {
        max-width: 800px;
        margin: 30px auto 0;
    }
    
    .location-input {
        background-color: #f9f9f9;
        border-radius: 8px;
        padding: 25px;
        text-align: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.05);
    }
    
    .location-input h3 {
        margin-bottom: 10px;
        color: #333;
    }
    
    .location-input p {
        color: #666;
        margin-bottom: 20px;
    }
    
    .location-input .input-group {
        display: flex;
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .location-input input {
        flex: 1;
        padding: 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 1rem;
    }
    
    .or-divider {
        position: relative;
        text-align: center;
        margin: 20px 0;
    }
    
    .or-divider:before, .or-divider:after {
        content: "";
        position: absolute;
        top: 50%;
        width: 45%;
        height: 1px;
        background-color: #ddd;
    }
    
    .or-divider:before {
        left: 0;
    }
    
    .or-divider:after {
        right: 0;
    }
    
    .or-divider span {
        display: inline-block;
        padding: 0 10px;
        background-color: #f9f9f9;
        position: relative;
        color: #888;
    }
    
    .lab-results {
        margin-top: 30px;
    }
    
    .lab-results h3 {
        margin-bottom: 20px;
        color: #333;
        text-align: center;
    }
    
    .lab-cards {
        display: grid;
        gap: 20px;
    }
    
    .lab-card {
        display: flex;
        background-color: #fff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: transform 0.3s ease;
    }
    
    .lab-card:hover {
        transform: translateY(-5px);
    }
    
    .lab-img {
        width: 30%;
        object-fit: cover;
    }
    
    .lab-content {
        width: 70%;
        padding: 20px;
    }
    
    .lab-content h3 {
        margin-bottom: 8px;
        text-align: left;
    }
    
    .lab-address {
        color: #666;
        margin-bottom: 5px;
    }
    
    .lab-distance {
        color: #3f8554;
        font-weight: 500;
        margin-bottom: 15px;
    }
    
    .lab-meta {
        display: flex;
        justify-content: space-between;
        color: #777;
        margin-bottom: 15px;
        font-size: 0.9rem;
    }

    .book-now {
        display: inline-block;
        background-color: #4CAF50;
        color: white;
        padding: 8px 16px;
        border-radius: 4px;
        text-decoration: none;
        font-weight: 500;
        transition: background-color 0.3s;
    }
    
    .book-now:hover {
        background-color: #3e8e41;
    }
    `;
    document.head.appendChild(style);
    
    // Get elements
    const labCenters = document.getElementById('labCenters');
    const findLabsBtn = document.getElementById('findLabsBtn');
    const useCurrentLocationBtn = document.getElementById('useCurrentLocationBtn');
    const labResults = document.getElementById('labResults');
    const searchContainer = document.querySelector('.search-container');
    
    // Tab switching functionality
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            tabButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show/hide appropriate content
            if (this.textContent === 'Lab Centers') {
                searchContainer.style.display = 'none';
                recommendBtn.style.display = 'none';
                healthInputs.style.display = 'none';
                recommendations.style.display = 'none';
                labCenters.style.display = 'block';
            } else {
                searchContainer.style.display = 'block';
                recommendBtn.style.display = 'block';
                labCenters.style.display = 'none';
            }
        });
    });
    
    // Find labs button functionality
    findLabsBtn.addEventListener('click', function() {
        document.querySelector('.location-input').style.display = 'none';
        labResults.style.display = 'block';
    });
    
    // Use current location button functionality
    useCurrentLocationBtn.addEventListener('click', function() {
        if (navigator.geolocation) {
            this.textContent = 'Detecting location...';
            this.disabled = true;
            
            navigator.geolocation.getCurrentPosition(function(position) {
                document.querySelector('.location-input').style.display = 'none';
                labResults.style.display = 'block';
                useCurrentLocationBtn.textContent = 'Use Current Location';
                useCurrentLocationBtn.disabled = false;
            }, function(error) {
                alert('Unable to retrieve your location. Please enter it manually.');
                useCurrentLocationBtn.textContent = 'Use Current Location';
                useCurrentLocationBtn.disabled = false;
            });
        } else {
            alert('Geolocation is not supported by your browser. Please enter your location manually.');
        }
    });
    
    // Existing button functionality
    recommendBtn.addEventListener('click', function() {
        healthInputs.style.display = 'block';
        setTimeout(function() {
            healthInputs.classList.add('active');
        }, 10);
        recommendBtn.style.display = 'none';
    });
    
    // Form validation function
    function validateHealthForm() {
        let isValid = true;
        
        // Get all form values
        const age = document.getElementById('age').value;
        const gender = document.getElementById('gender').value;
        const height = document.getElementById('height').value;
        const weight = document.getElementById('weight').value;
        const smoking = document.getElementById('smoking').value;
        const sleepDuration = document.getElementById('sleep-duration').value;
        const sleepQuality = document.getElementById('sleep-quality').value;
        const waterIntake = document.getElementById('water-intake').value;
        const preExisting = document.getElementById('pre-existing').value;
        const familyHistory = document.getElementById('family-history').value;
        const healthGoals = document.getElementById('health-goals').value;
        
        // Remove any existing error messages
        removeErrorMessages();
        
        // Validate required fields
        if (!age) {
            showError('age', 'Age is required');
            isValid = false;
        } else if (age < 1 || age > 120) {
            showError('age', 'Please enter a valid age between 1 and 120');
            isValid = false;
        }
        
        if (!gender) {
            showError('gender', 'Please select your gender');
            isValid = false;
        }
        
        if (!height) {
            showError('height', 'Height is required');
            isValid = false;
        } else if (height < 50 || height > 300) {
            showError('height', 'Please enter a valid height between 50 and 300 cm');
            isValid = false;
        }
        
        if (!weight) {
            showError('weight', 'Weight is required');
            isValid = false;
        } else if (weight < 20 || weight > 500) {
            showError('weight', 'Please enter a valid weight between 20 and 500 kg');
            isValid = false;
        }
        
        if (!smoking) {
            showError('smoking', 'Please select your smoking status');
            isValid = false;
        }
        
        if (!sleepDuration) {
            showError('sleep-duration', 'Sleep duration is required');
            isValid = false;
        } else if (sleepDuration < 0 || sleepDuration > 24) {
            showError('sleep-duration', 'Please enter valid sleep duration between 0 and 24 hours');
            isValid = false;
        }
        
        if (!sleepQuality) {
            showError('sleep-quality', 'Please select your sleep quality');
            isValid = false;
        }
        
        if (!waterIntake) {
            showError('water-intake', 'Water intake is required');
            isValid = false;
        } else if (waterIntake < 0 || waterIntake > 10) {
            showError('water-intake', 'Please enter valid water intake between 0 and 10 liters');
            isValid = false;
        }
        
        if (!preExisting) {
            showError('pre-existing', 'Please provide pre-existing conditions');
            isValid = false;
        }
        
        if (!familyHistory) {
            showError('family-history', 'Please provide family history');
            isValid = false;
        }
        
        if (!healthGoals) {
            showError('health-goals', 'Please select your health goals');
            isValid = false;
        }
        
        return isValid;
    }
    
    function showError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.style.color = '#ff3333';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        field.parentNode.appendChild(errorDiv);
        field.style.borderColor = '#ff3333';
    }
    
    function removeErrorMessages() {
        // Remove all error messages
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(error => error.remove());
        
        // Reset field styles
        const fields = document.querySelectorAll('input, select');
        fields.forEach(field => field.style.borderColor = '');
    }
    
    // Add real-time validation
    const formFields = ['age', 'gender', 'height', 'weight', 'smoking', 
                         'sleep-duration', 'sleep-quality', 'water-intake', 
                         'pre-existing', 'family-history', 'health-goals'];
    
    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field) {
            field.addEventListener('input', function() {
                // Remove error styling when user starts typing
                this.style.borderColor = '';
                const errorMessage = this.parentNode.querySelector('.error-message');
                if (errorMessage) {
                    errorMessage.remove();
                }
            });
        }
    });
    
    // Important: Replace the doneBtn event listener with our validated version
    doneBtn.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Only proceed if form validation passes
        if (validateHealthForm()) {
            healthInputs.classList.remove('active');
            setTimeout(function() {
                healthInputs.style.display = 'none';
                recommendations.style.display = 'block';
                setTimeout(function() {
                    recommendations.classList.add('active');
                }, 10);
            }, 400);
        }
        // If validation fails, form stays visible with error messages
    });
});

// Footer loading
fetch("footer.html")
    .then(response => response.text())
    .then(data => document.getElementById("footer").innerHTML = data);