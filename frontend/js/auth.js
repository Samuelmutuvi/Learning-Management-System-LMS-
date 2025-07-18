document.addEventListener('DOMContentLoaded', function() {
    // ========== Registration Form Handler ==========
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', handleRegistration);
    }

    // ========== Login Form Handler ==========
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // ========== Password Reset Handler ==========
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
        resetForm.addEventListener('submit', handlePasswordReset);
    }

    // ========== Email Confirmation Handler ==========
    const emailConfirmForm = document.getElementById('email-confirm-form');
    const verifyCodeBtn = document.getElementById('verify-code-btn');
    const otpInputs = document.querySelectorAll('.otp-input');

    if (emailConfirmForm) {
        // Send OTP Code
        document.getElementById('send-code-btn').addEventListener('click', function() {
            const email = document.getElementById('confirm-email').value.trim();
            
            if (!email) {
                alert('Please enter your email');
                return;
            }

            // Show OTP section
            document.getElementById('code-section').style.display = 'block';
            
            // In production: Call backend to send OTP
            console.log(`OTP would be sent to: ${email}`);
            alert(`Demo: OTP sent to ${email} (use 123456 for testing)`);
        });

        // OTP Input Auto-Tab
        otpInputs.forEach((input, index) => {
            input.addEventListener('input', (e) => {
                if (e.target.value.length === 1 && index < otpInputs.length - 1) {
                    otpInputs[index + 1].focus();
                }
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Backspace' && index > 0 && !e.target.value) {
                    otpInputs[index - 1].focus();
                }
            });
        });

        // Verify OTP
        verifyCodeBtn.addEventListener('click', function() {
            let otp = '';
            otpInputs.forEach(input => {
                otp += input.value;
            });

            if (otp.length !== 6) {
                alert('Please enter the complete 6-digit code');
                return;
            }

            // Demo verification (replace with actual API call)
            if (otp === '123456') {
                alert('Email verified successfully!');
                window.location.href = 'login.html';
            } else {
                alert('Invalid verification code');
            }
        });
    }

    // ========== Handler Functions ==========
    async function handleRegistration(e) {
        e.preventDefault();
        
        const formData = {
            firstname: e.target.elements.firstname.value.trim(),
            lastname: e.target.elements.lastname.value.trim(),
            email: e.target.elements.email.value.trim(),
            phonenumber: e.target.elements.phonenumber.value.trim(),
            password: e.target.elements.password.value,
            confirmpassword: e.target.elements.confirmpassword.value
        };

        if (!Object.values(formData).every(Boolean)) {
            alert('Please fill all fields');
            return;
        }

        if (formData.password !== formData.confirmpassword) {
            alert("Passwords don't match!");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            alert(`Registration successful! Your username: ${data.username}`);
            window.location.href = 'confirm_email.html?email=' + encodeURIComponent(formData.email);

        } catch (error) {
            console.error('Registration error:', error);
            alert(error.message);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        const username = e.target.elements.username.value;
        const password = e.target.elements.password.value;

        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Login failed');
            }

            localStorage.setItem('authToken', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));
            window.location.href = 'homepage.html';

        } catch (error) {
            console.error('Login error:', error);
            alert(error.message);
        }
    }

//

// After successful login
localStorage.setItem('user', JSON.stringify({
    firstname: data.user.firstname,
    // add other info like email, token, etc.
}));


    async function handlePasswordReset(e) {
        e.preventDefault();
        const email = e.target.elements.email.value;

        try {
            const response = await fetch('http://localhost:3000/api/forgot_password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }

            alert('Reset instructions sent to your email');
            window.location.href = 'reset-confirm.html';

        } catch (error) {
            console.error('Reset error:', error);
            alert(error.message);
        }
    }
});

// Add to your existing auth.js
document.addEventListener('DOMContentLoaded', function() {
    const verifyOtpBtn = document.getElementById('verify-otp-btn');
    const resetPasswordBtn = document.getElementById('reset-password-btn');
    const otpInputs = document.querySelectorAll('.otp-input');

    // OTP Auto-Tab Functionality
    otpInputs.forEach((input, index) => {
        input.addEventListener('input', (e) => {
            if (e.target.value.length === 1 && index < 5) {
                otpInputs[index + 1].focus();
            }
        });
        
        input.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && !e.target.value && index > 0) {
                otpInputs[index - 1].focus();
            }
        });
    });

    // DEMO VERSION - For testing purposes only
    verifyOtpBtn.addEventListener('click', function() {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        
        if (otp.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }

        // Demo verification - accepts any 6-digit code
        alert('Demo: OTP verified successfully (In production, this would call your backend)');
        document.getElementById('otp-section').style.display = 'none';
        document.getElementById('password-fields').style.display = 'block';
        document.getElementById('new-password').focus();
    });

    /* PRODUCTION VERSION - Uncomment when ready
    verifyOtpBtn.addEventListener('click', async function() {
        const otp = Array.from(otpInputs).map(input => input.value).join('');
        const email = new URLSearchParams(window.location.search).get('email');

        if (otp.length !== 6) {
            alert('Please enter the complete 6-digit code');
            return;
        }

        try {
            const response = await fetch('http://yourdomain.com/api/forgot_password/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email: email,
                    otp: otp 
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'OTP verification failed');
            }

            // Show password fields after successful verification
            document.getElementById('otp-section').style.display = 'none';
            document.getElementById('password-fields').style.display = 'block';
            document.getElementById('new-password').focus();

        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
            // Clear OTP fields for retry
            otpInputs.forEach(input => input.value = '');
            otpInputs[0].focus();
        }
    });
    */

    // Password Reset Handler (works for both demo and production)
    resetPasswordBtn.addEventListener('click', async function(e) {
        e.preventDefault();
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const token = new URLSearchParams(window.location.search).get('token');

        if (newPassword !== confirmPassword) {
            alert("Passwords don't match!");
            return;
        }

        if (newPassword.length >= 8) {
            alert("Password must be at least 8 characters");
            return;
        }

        try {
            // DEMO VERSION
            alert('Demo: Password would be reset now (In production, this would call your backend)');
            window.location.href = 'login.html';

            /* PRODUCTION VERSION - Uncomment when ready
            const response = await fetch('http://yourdomain.com/api/forgot_password/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    token: token,
                    newPassword: newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Password reset failed');
            }

            alert('Password reset successfully!');
            window.location.href = 'login.html';
            */
        } catch (error) {
            console.error('Error:', error);
            alert(error.message);
        }
    });
    
});