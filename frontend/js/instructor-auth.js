document.addEventListener('DOMContentLoaded', function() {
    console.log('[DEBUG] Script loaded successfully');
    
    const registrationForm = document.getElementById('registration-form');
    
    if (!registrationForm) {
        console.error('[ERROR] Form not found! Check your HTML ID');
        return;
    }
    
    console.log('[DEBUG] Form element found:', registrationForm);
    
    registrationForm.addEventListener('submit', function(e) {
        e.preventDefault();
        console.log('[DEBUG] Form submission intercepted');
        
        // Get form values with null checks
        const getValue = id => {
            const el = document.getElementById(id);
            if (!el) {
                console.error(`[ERROR] Element with ID ${id} not found`);
                return null;
            }
            return el.value.trim();
        };
        
        const firstName = getValue('firstname');
        const lastName = getValue('lastname');
        const email = getValue('email');
        const password = getValue('password');
        const confirmPassword = getValue('confirm-password');
        const specialization = getValue('specialization');
        
        console.log('[DEBUG] Form values:', {
            firstName, lastName, email, password, confirmPassword, specialization
        });
        
        // Validation
        if (!firstName || !lastName || !email || !password || !confirmPassword || !specialization) {
            console.warn('[VALIDATION] All fields are required');
            alert('Please fill all fields');
            return;
        }
        
        if (password.length < 8) {
            console.warn('[VALIDATION] Password too short');
            alert('Password must be at least 8 characters');
            return;
        }
        
        if (password !== confirmPassword) {
            console.warn('[VALIDATION] Passwords dont match');
            alert('Passwords do not match');
            return;
        }
        
        // Generate instructor ID
        const instructorId = 'INST' + Math.floor(1000 + Math.random() * 9000);
        console.log('[DEBUG] Generated ID:', instructorId);
        
        // Create instructor object
        const instructor = {
            instructorId,
            firstName,
            lastName,
            email,
            password,
            specialization,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        try {
            let instructors = JSON.parse(localStorage.getItem('instructors')) || [];
            instructors.push(instructor);
            localStorage.setItem('instructors', JSON.stringify(instructors));
            console.log('[DEBUG] Saved to localStorage:', instructor);
            
            // Store current instructor
            localStorage.setItem('currentInstructor', JSON.stringify({
                id: instructorId,
                name: `${firstName} ${lastName}`,
                specialization
            }));
            
            console.log('[DEBUG] Registration successful, redirecting...');
            alert(`Account created successfully!\nYour Instructor ID: ${instructorId}`);
            window.location.href = 'instructor-dashboard.html';
            
        } catch (error) {
            console.error('[ERROR] localStorage error:', error);
            alert('Registration failed. Please try again.');
        }
    });
    
    console.log('[DEBUG] Event listener attached successfully');
});