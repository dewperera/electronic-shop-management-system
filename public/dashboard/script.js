// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("owner-login-form");

//     loginForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form from refreshing the page

//         const username = document.getElementById("owner-username").value;
//         const password = document.getElementById("owner-password").value;
//         const errorMessage = document.getElementById("error-message");

//         if (username === "user" && password === "user") {
//             alert("Login successful!"); 
//             window.location.href = "owner-dashboard.html"; // Redirect to a dashboard page (change this as needed)
//         } else {
//             errorMessage.style.display = "block"; // Show error message
//         }
//     });
// });



// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("accountant-login-form");

//     loginForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form from refreshing the page

//         const username = document.getElementById("accountant-username").value;
//         const password = document.getElementById("accountant-password").value;
//         const errorMessage = document.getElementById("error-message");

//         if (username === "user" && password === "user") {
//             alert("Login successful!"); 
//             window.location.href = "accountant-dashboard.html"; // Redirect to a dashboard page (change this as needed)
//         } else {
//             errorMessage.style.display = "block"; // Show error message
//         }
//     });
// });


// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("showroom-manager-login-form");

//     loginForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form from refreshing the page

//         const username = document.getElementById("showroom-manager-username").value;
//         const password = document.getElementById("showroom-manager-password").value;
//         const errorMessage = document.getElementById("error-message");

//         if (username === "user" && password === "user") {
//             alert("Login successful!"); 
//             window.location.href = "showroom-manager-dashboard.html"; // Redirect to a dashboard page (change this as needed)
//         } else {
//             errorMessage.style.display = "block"; // Show error message
//         }
//     });
// });


// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("stock-manager-login-form");

//     loginForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form from refreshing the page

//         const username = document.getElementById("stock-manager-username").value;
//         const password = document.getElementById("stock-manager-password").value;
//         const errorMessage = document.getElementById("error-message");

//         if (username === "user" && password === "user") {
//             alert("Login successful!"); 
//             window.location.href = "stock-manager-dashboard.html"; // Redirect to a dashboard page (change this as needed)
//         } else {
//             errorMessage.style.display = "block"; // Show error message
//         }
//     });
// });



// document.addEventListener("DOMContentLoaded", function () {
//     const loginForm = document.getElementById("cashier-login-form");

//     loginForm.addEventListener("submit", function (event) {
//         event.preventDefault(); // Prevent form from refreshing the page

//         const username = document.getElementById("cashier-username").value;
//         const password = document.getElementById("cashier-password").value;
//         const errorMessage = document.getElementById("error-message");

//         if (username === "user" && password === "user") {
//             alert("Login successful!"); 
//             window.location.href = "cashier-dashboard.html"; // Redirect to a dashboard page (change this as needed)
//         } else {
//             errorMessage.style.display = "block"; // Show error message
//         }
//     });
// });


// Common Logout Function
function logout() {
    console.log('Logout function called'); // Debugging
    localStorage.removeItem('token'); // Clear token
    window.location.href = 'http://localhost:3000/dashboard/'; // Redirect to home
}

// Attach Logout Function to Logout Buttons
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded'); // Debugging
    const logoutButton = document.getElementById('logout-btn');
    if (logoutButton) {
        console.log('Logout button found'); // Debugging
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent default link behavior

            // Ask for confirmation before logging out
            const confirmLogout = confirm('Are you sure you want to logout?');
            if (confirmLogout) {
                logout(); // Proceed with logout if user confirms
            } else {
                console.log('Logout canceled'); // Debugging
            }
        });
    } else {
        console.log('Logout button not found'); // Debugging
    }
});









