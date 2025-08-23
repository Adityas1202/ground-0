document.addEventListener('DOMContentLoaded', function() {
    // Check which page we're on
    const isDoctorPage = document.body.classList.contains('doctor-portal');
    const isPatientPage = document.body.classList.contains('patient-portal');
    const isHomePage = !isDoctorPage && !isPatientPage;
    
    // Base API URL
    const API_BASE = 'http://localhost:3000/api';
    
    if (isHomePage) {
        // Home page functionality
        const patientRole = document.getElementById('patientRole');
        const doctorRole = document.getElementById('doctorRole');
        
        if (patientRole && doctorRole) {
            patientRole.addEventListener('click', function() {
                window.location.href = 'patient-signin.html';
            });
            
            doctorRole.addEventListener('click', function() {
                window.location.href = 'doctor-signin.html';
            });
        }
    }
    
    if (isDoctorPage || isPatientPage) {
        // Form functionality for doctor and patient pages
        initializeAuthForms(isDoctorPage, API_BASE);
    }
    
    function showNotification(message, type) {
        const notification = document.getElementById('notification');
        if (notification) {
            notification.textContent = message;
            notification.className = 'notification ' + type;
            
            setTimeout(() => {
                notification.className = 'notification';
            }, 3000);
        } else {
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }
    
    function initializeAuthForms(isDoctorPage, API_BASE) {
        let signupForm, loginForm, toLoginLink, toSignupLink;
        
        if (isDoctorPage) {
            signupForm = document.getElementById('doctorSignupForm');
            loginForm = document.getElementById('doctorLoginForm');
            toLoginLink = document.getElementById('doctorToLogin');
            toSignupLink = document.getElementById('doctorToSignup');
        } else {
            signupForm = document.getElementById('patientSignupForm');
            loginForm = document.getElementById('patientLoginForm');
            toLoginLink = document.getElementById('patientToLogin');
            toSignupLink = document.getElementById('patientToSignup');
        }
        
        // Switch between signup and login forms
        if (toLoginLink && toSignupLink && signupForm && loginForm) {
            toLoginLink.addEventListener('click', (e) => {
                e.preventDefault();
                signupForm.classList.remove('active');
                loginForm.classList.add('active');
            });
            
            toSignupLink.addEventListener('click', (e) => {
                e.preventDefault();
                loginForm.classList.remove('active');
                signupForm.classList.add('active');
            });
        }
        
        // Form submissions
        if (isDoctorPage) {
            if (signupForm) signupForm.addEventListener('submit', (e) => handleDoctorSignup(e, API_BASE));
            if (loginForm) loginForm.addEventListener('submit', (e) => handleDoctorLogin(e, API_BASE));
        } else {
            if (signupForm) signupForm.addEventListener('submit', (e) => handlePatientSignup(e, API_BASE));
            if (loginForm) loginForm.addEventListener('submit', (e) => handlePatientLogin(e, API_BASE));
        }
    }
    
    async function handlePatientSignup(e, API_BASE) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('patientName').value,
            email: document.getElementById('patientEmail').value,
            password: document.getElementById('patientPassword').value,
            dob: document.getElementById('patientDob').value,
            phone: document.getElementById('patientPhone').value
        };
        
        try {
            showNotification('Creating account...', 'success');
            
            const response = await fetch(`${API_BASE}/auth/patients/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Account created successfully!', 'success');
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                // Redirect to patient dashboard
                setTimeout(() => {
                    window.location.href = 'patient-dashboard.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Error creating account', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
    
    async function handlePatientLogin(e, API_BASE) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('patientLoginEmail').value,
            password: document.getElementById('patientLoginPassword').value
        };
        
        try {
            showNotification('Logging in...', 'success');
            
            const response = await fetch(`${API_BASE}/auth/patients/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Login successful!', 'success');
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                // Redirect to patient dashboard
                setTimeout(() => {
                    window.location.href = 'patient-dashboard.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
    
    async function handleDoctorSignup(e, API_BASE) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('doctorName').value,
            email: document.getElementById('doctorEmail').value,
            password: document.getElementById('doctorPassword').value,
            license: document.getElementById('doctorLicense').value,
            specialty: document.getElementById('doctorSpecialty').value,
            hospital: document.getElementById('doctorHospital').value
        };
        
        try {
            showNotification('Creating account...', 'success');
            
            const response = await fetch(`${API_BASE}/auth/doctors/signup`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Account created successfully!', 'success');
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                // Redirect to doctor dashboard
                setTimeout(() => {
                    window.location.href = 'doctor-dashboard.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Error creating account', 'error');
            }
        } catch (error) {
            console.error('Signup error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
    
    async function handleDoctorLogin(e, API_BASE) {
        e.preventDefault();
        
        const formData = {
            email: document.getElementById('doctorLoginEmail').value,
            password: document.getElementById('doctorLoginPassword').value
        };
        
        try {
            showNotification('Logging in...', 'success');
            
            const response = await fetch(`${API_BASE}/auth/doctors/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });
            
            const data = await response.json();
            
            if (response.ok) {
                showNotification('Login successful!', 'success');
                // Store user data
                localStorage.setItem('user', JSON.stringify(data.user));
                localStorage.setItem('token', data.token);
                // Redirect to doctor dashboard
                setTimeout(() => {
                    window.location.href = 'doctor-dashboard.html';
                }, 1500);
            } else {
                showNotification(data.message || 'Invalid credentials', 'error');
            }
        } catch (error) {
            console.error('Login error:', error);
            showNotification('Network error. Please try again.', 'error');
        }
    }
});