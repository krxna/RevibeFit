// In-memory database implementation
const ContactDatabase = {
    submissions: [],
    
    // Add new submission
    addSubmission(data) {
        const submission = {
            id: Date.now(), // Unique ID using timestamp
            ...data,
            timestamp: new Date().toISOString(),
            status: 'unread'
        };
        this.submissions.push(submission);
        return submission;
    },
    
    // Get all submissions
    getAllSubmissions() {
        return this.submissions;
    },
    
    // Get submission by ID
    getSubmissionById(id) {
        return this.submissions.find(sub => sub.id === id);
    },
    
    // Update submission status
    updateStatus(id, status) {
        const submission = this.getSubmissionById(id);
        if (submission) {
            submission.status = status;
            return true;
        }
        return false;
    },
    
    // Clear all submissions
    clearSubmissions() {
        this.submissions = [];
    }
};
// Add alphabets-only validation function
function containsOnlyAlphabets(str) {
    return /^[A-Za-z\s]+$/.test(str);
}
// Modified contact form submission handler
document.querySelector('.contact-form').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get form values
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const message = document.getElementById('message').value.trim();
    
    // Reset previous error states
    removeAllErrors();
    
    // Validation flags
    let isValid = true;
    
    // Full Name validation
    if (fullName.length < 3) {
        showError('fullName', 'Name must be at least 3 characters long');
        isValid = false;
    } else if (!containsOnlyAlphabets(fullName)) {
        showError('fullName', 'Name should contain only alphabets');
        isValid = false;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        showError('email', 'Please enter a valid email address');
        isValid = false;
    }
    
    // Phone validation
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone)) {
        showError('phone', 'Please enter a valid 10-digit phone number');
        isValid = false;
    }
    
    // Message validation
    if (message.length < 10) {
        showError('message', 'Message must be at least 10 characters long');
        isValid = false;
    }
    
    // If all validations pass
    if (isValid) {
        try {
            const response = await fetch('http://localhost:3001/api/contact/submit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    fullName,
                    email,
                    phone,
                    message
                })
            });

            const data = await response.json();

            if (data.success) {
                alert('Thank you for your message! We will get back to you soon.');
                this.reset();
            } else {
                throw new Error(data.message);
            }
        } catch (error) {
            alert('Error submitting form: ' + error.message);
        }
    }
});

// Existing helper functions
function showError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    field.classList.add('error');
    field.parentNode.appendChild(errorDiv);
}

function removeAllErrors() {
    const errorMessages = document.querySelectorAll('.error-message');
    errorMessages.forEach(error => error.remove());
    
    const fields = document.querySelectorAll('.error');
    fields.forEach(field => field.classList.remove('error'));
}

// Real-time validation as user types
const fields = ['fullName', 'email', 'phone', 'message'];
fields.forEach(fieldId => {
    document.getElementById(fieldId).addEventListener('input', function() {
        this.classList.remove('error');
        const errorMessage = this.parentNode.querySelector('.error-message');
        if (errorMessage) {
            errorMessage.remove();
        }
    });
});

// Add real-time validation for the name field
document.getElementById('fullName').addEventListener('input', function() {
    this.value = this.value.replace(/[^A-Za-z\s]/g, '');
    
    const errorMessage = this.parentNode.querySelector('.error-message');
    if (errorMessage) {
        errorMessage.remove();
    }
    this.classList.remove('error');

    if (this.value.trim() && !containsOnlyAlphabets(this.value)) {
        showError('fullName', 'Name should contain only alphabets');
    }
});

// Load navigation
$(function(){
    $("#nav-placeholder").load("Nav_bar.html");
});

