document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let emailError = document.getElementById("emailError");
    let passwordError = document.getElementById("passwordError");

    let valid = true;

    // Email validation
    if (!email.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/)) {
      emailError.style.display = "block";
      valid = false;
    } else {
      emailError.style.display = "none";
    }

    // Password validation
    if (password.length < 6) {
      passwordError.style.display = "block";
      valid = false;
    } else {
      passwordError.style.display = "none";
    }

    if (valid) {
      // Send login request to backend at http://localhost:3001/signin
      fetch("http://localhost:3001/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.success) {
            // Store user data in session/local storage
            localStorage.setItem("user", JSON.stringify(data.user));

            // Always use the redirectUrl from backend
            if (data.redirectUrl) {
              window.location.href = data.redirectUrl;
            } else {
              // Fallback to default dashboard
              window.location.href = "/userhome";
            }
          } else {
            // Display error message
            alert(data.error || "Login failed");
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          alert("Login failed. Please try again.");
        });
    }
  });
});
