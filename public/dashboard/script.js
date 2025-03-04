
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









