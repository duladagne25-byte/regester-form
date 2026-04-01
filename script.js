// ==================== USER DATABASE (localStorage) ====================
let users = [];

// Load users from localStorage
function loadUsersFromStorage() {
    const stored = localStorage.getItem('nexusform_users');
    if(stored) {
        users = JSON.parse(stored);
    } else {
        // Seed demo users for admin showcase
        users = [
            { id: Date.now() + 1, firstName: "Alex", lastName: "Johnson", email: "alex@demo.com", password: "******", gender: "Male", country: "ethiopia", dob: "1995-06-15" },
            { id: Date.now() + 2, firstName: "Sophia", lastName: "Miller", email: "sophia@demo.com", password: "******", gender: "Female", country: "Canada", dob: "1998-03-22" }
        ];
        saveUsersToStorage();
    }
    updateAdminUI();
}

function saveUsersToStorage() {
    localStorage.setItem('nexusform_users', JSON.stringify(users));
    updateAdminUI();
}

// Helper to generate unique ID
function generateId() {
    return Date.now() + Math.floor(Math.random() * 10000);
}

// Add new user (called from registration)
function addUser(userData) {
    const newUser = {
        id: generateId(),
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        password: "encrypted_demo",
        gender: userData.gender || "Not specified",
        country: userData.country,
        dob: userData.dob || "N/A"
    };
    users.push(newUser);
    saveUsersToStorage();
    return newUser;
}

// Delete user by id
function deleteUserById(id) {
    if(confirm("Are you sure you want to delete this user?")) {
        users = users.filter(user => user.id !== id);
        saveUsersToStorage();
        showAdminFeedback("User deleted successfully!", "success");
    }
}

// Delete all users
function deleteAllUsers() {
    if(confirm("⚠️ Delete ALL registered users? This action is irreversible.")) {
        users = [];
        saveUsersToStorage();
        showAdminFeedback("All users have been removed.", "success");
    }
}

// Edit user (inline prompt style)
function editUser(id) {
    const user = users.find(u => u.id === id);
    if(!user) return;
    
    const newFirstName = prompt("Edit First Name:", user.firstName);
    if(newFirstName !== null && newFirstName.trim() !== "") user.firstName = newFirstName.trim();
    
    const newLastName = prompt("Edit Last Name:", user.lastName);
    if(newLastName !== null && newLastName.trim() !== "") user.lastName = newLastName.trim();
    
    const newEmail = prompt("Edit Email:", user.email);
    if(newEmail !== null && newEmail.trim() !== "" && newEmail.includes("@")) {
        user.email = newEmail.trim();
    } else if(newEmail !== null && !newEmail.includes("@")) {
        alert("Invalid email format, unchanged.");
    }
    
    const newCountry = prompt("Edit Country:", user.country);
    if(newCountry !== null && newCountry.trim() !== "") user.country = newCountry.trim();
    
    const newGender = prompt("Edit Gender (Male/Female/Other):", user.gender);
    if(newGender !== null && newGender.trim() !== "") user.gender = newGender.trim();
    
    saveUsersToStorage();
    showAdminFeedback(`User ${user.firstName} ${user.lastName} updated`, "success");
}

function showAdminFeedback(msg, type) {
    const feedbackDiv = document.getElementById('adminFeedback');
    feedbackDiv.innerHTML = `<div class="success-message" style="background:${type === 'success' ? '#e0f2e9' : '#ffe6e5'};">${msg}</div>`;
    setTimeout(() => { if(feedbackDiv) feedbackDiv.innerHTML = ''; }, 2500);
}

// Render admin table
function updateAdminUI() {
    const tbody = document.getElementById('userTableBody');
    const statsSpan = document.getElementById('userStats');
    if(!tbody) return;
    
    if(users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="empty-state">📭 No users registered. Create one via Register form.</td></tr>';
        if(statsSpan) statsSpan.innerText = `Total Users: 0`;
        return;
    }
    
    if(statsSpan) statsSpan.innerText = `Total Users: ${users.length}`;
    let html = '';
    users.forEach(user => {
        html += `
            <tr>
                <td>${user.id.toString().slice(-6)}</td>
                <td>${escapeHtml(user.firstName)} ${escapeHtml(user.lastName)}</td>
                <td>${escapeHtml(user.email)}</td>
                <td>${escapeHtml(user.gender || '—')}</td>
                <td>${escapeHtml(user.country)}</td>
                <td>${user.dob !== "N/A" ? user.dob : '—'}</td>
                <td>
                    <button class="edit-btn" onclick="editUser(${user.id})"><i class="fas fa-edit"></i> Edit</button>
                    <button class="delete-btn" onclick="deleteUserById(${user.id})"><i class="fas fa-trash"></i> Del</button>
                </td>
            </tr>
        `;
    });
    tbody.innerHTML = html;
}

function escapeHtml(str) { 
    if(!str) return ''; 
    return str.replace(/[&<>]/g, function(m){
        if(m === '&') return '&amp;'; 
        if(m === '<') return '&lt;'; 
        if(m === '>') return '&gt;'; 
        return m;
    }); 
}

// ==================== REGISTRATION FORM VALIDATION ====================
const form = document.getElementById('registrationForm');
const firstName = document.getElementById('firstName');
const lastName = document.getElementById('lastName');
const email = document.getElementById('email');
const password = document.getElementById('password');
const confirmPwd = document.getElementById('confirmPwd');
const dob = document.getElementById('dob');
const firstNameErr = document.getElementById('firstNameError');
const lastNameErr = document.getElementById('lastNameError');
const emailErr = document.getElementById('emailError');
const passwordErr = document.getElementById('passwordError');
const confirmErr = document.getElementById('confirmError');
const dobErr = document.getElementById('dobError');
const feedbackDiv = document.getElementById('formFeedback');

function hideAllErrors() { 
    [firstNameErr, lastNameErr, emailErr, passwordErr, confirmErr, dobErr].forEach(e => { 
        if(e) { e.style.display = 'none'; e.innerText = ''; } 
    }); 
    if(feedbackDiv) feedbackDiv.innerHTML = ''; 
}

function showError(el, msg) { 
    if(el) { el.innerText = msg; el.style.display = 'block'; } 
}

function validateForm() {
    let isValid = true;
    hideAllErrors();
    
    const fName = firstName.value.trim();
    if(!fName) { showError(firstNameErr, 'First name required'); isValid = false; }
    
    const lName = lastName.value.trim();
    if(!lName) { showError(lastNameErr, 'Last name required'); isValid = false; }
    
    const emailVal = email.value.trim();
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if(!emailVal) { showError(emailErr, 'Email required'); isValid = false; }
    else if(!emailRegex.test(emailVal)) { showError(emailErr, 'Invalid email format'); isValid = false; }
    
    const pwd = password.value;
    if(!pwd) { showError(passwordErr, 'Password required'); isValid = false; }
    else if(pwd.length < 6) { showError(passwordErr, 'Min 6 characters'); isValid = false; }
    
    if(pwd !== confirmPwd.value) { showError(confirmErr, 'Passwords do not match'); isValid = false; }
    
    const dobVal = dob.value;
    if(dobVal) {
        const birth = new Date(dobVal);
        const age = new Date().getFullYear() - birth.getFullYear();
        if(age < 12 && age > 0) { showError(dobErr, 'Must be at least 12 years old'); isValid = false; }
        else if(age > 110) { showError(dobErr, 'Invalid birth year'); isValid = false; }
    }
    
    return isValid;
}

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(validateForm()) {
        const genderSelected = document.querySelector('input[name="gender"]:checked');
        const gender = genderSelected ? genderSelected.value : 'Not specified';
        const newUserData = {
            firstName: firstName.value.trim(),
            lastName: lastName.value.trim(),
            email: email.value.trim(),
            gender: gender,
            country: document.getElementById('country').value,
            dob: dob.value || "N/A",
        };
        addUser(newUserData);
        feedbackDiv.innerHTML = `<div class="success-message"><i class="fas fa-check-circle"></i> ✅ Registration successful! Welcome ${newUserData.firstName}! Admin can view your profile.</div>`;
        form.reset();
        setTimeout(() => { if(feedbackDiv) feedbackDiv.innerHTML = ''; }, 3000);
        
        // Update admin panel if visible
        if(document.getElementById('admin-page').classList.contains('active-page')) updateAdminUI();
    } else {
        feedbackDiv.innerHTML = '<div class="error-message"><i class="fas fa-exclamation-triangle"></i> Please fix errors above.</div>';
    }
});

// ==================== PAGE NAVIGATION ====================
const pages = {
    home: document.getElementById('home-page'),
    about: document.getElementById('about-page'),
    contact: document.getElementById('contact-page'),
    register: document.getElementById('register-page'),
    admin: document.getElementById('admin-page')
};

const navBtns = document.querySelectorAll('.nav-btn');

function switchPage(pageId) {
    Object.values(pages).forEach(p => { if(p) p.classList.remove('active-page'); });
    if(pages[pageId]) pages[pageId].classList.add('active-page');
    
    navBtns.forEach(btn => {
        if(btn.getAttribute('data-page') === pageId) btn.classList.add('active');
        else btn.classList.remove('active');
    });
    
    if(pageId === 'admin') updateAdminUI();
}

navBtns.forEach(btn => {
    btn.addEventListener('click', () => switchPage(btn.getAttribute('data-page')));
});

// Home page registration button
document.getElementById('homeRegBtn')?.addEventListener('click', () => switchPage('register'));

// Admin action buttons
document.getElementById('clearAllUsersBtn')?.addEventListener('click', () => deleteAllUsers());
document.getElementById('refreshAdminBtn')?.addEventListener('click', () => { 
    updateAdminUI(); 
    showAdminFeedback("User list refreshed", "success"); 
});

// Live error clearing on input
const allInputs = [firstName, lastName, email, password, confirmPwd, dob];
allInputs.forEach(input => {
    if(input) {
        input.addEventListener('input', () => {
            if(input.id === 'firstName' && firstNameErr) firstNameErr.style.display = 'none';
            if(input.id === 'lastName' && lastNameErr) lastNameErr.style.display = 'none';
            if(input.id === 'email' && emailErr) emailErr.style.display = 'none';
            if(input.id === 'password' && passwordErr) passwordErr.style.display = 'none';
            if(input.id === 'confirmPwd' && confirmErr) confirmErr.style.display = 'none';
            if(input.id === 'dob' && dobErr) dobErr.style.display = 'none';
            if(feedbackDiv && feedbackDiv.innerHTML.includes('fix errors')) feedbackDiv.innerHTML = '';
        });
    }
});

// Make functions globally accessible for inline onclick handlers
window.editUser = editUser;
window.deleteUserById = deleteUserById;

// Initialize application
loadUsersFromStorage();
updateAdminUI();
