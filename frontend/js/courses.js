document.addEventListener('DOMContentLoaded', () => {
    // DOM element selectors
    const courseButtons = document.querySelectorAll('.course-container button');
    const hamburger = document.querySelector('.hamburger');
    const nav = document.querySelector('nav');
    const learnerNamePlaceholders = document.querySelectorAll("h1, header h1");

    const user = JSON.parse(localStorage.getItem('user'));
    
    if (user && user.firstname) {
        document.getElementById('learner-name').textContent = user.firstname;
    } 
    
    // user data handling
    function loadUserData() {
        try {
            const userData = JSON.parse(localStorage.getItem('tempUser'));
            if (userData?.firstName && learnerNamePlaceholders) {
                learnerNamePlaceholders.forEach(el => {
                    if (el.textContent.includes("learner's name")) {
                        el.textContent = el.textContent.replace("learner's name", userData.firstName);
                    }
                });
            }
        } catch(error) {
            console.error('Error loading user data:', error);
        } 
    }

    // course management
    const courseData = {
        'DATA ANALYSIS': {
            description: 'Master data analysis techniques using Excel, IBM SPSS, STATA, NVIVO, KOBO, ODK, COMMCARE and later Report Writing',
            icon: '📊',
            page: 'data.html'
        },
        'BUSINESS INTELLIGENCE': {
            description: 'Learn POWER BI, Tableau for data visualization and Python and R-Programming',
            icon: '📈',
            page: 'bi.html'
        },
        'APP DEVELOPMENT': {
            description: 'Build mobile apps with Dart and Flutter',
            icon: '📱',
            page: 'app-dev.html'
        },
        'WEB DEVELOPMENT': {
            description: 'Full-stack development with HTML, CSS, Javascript, and Node js',
            icon: '💻',
            page: 'web-dev.html'
        },
        'GRAPHIC DESIGN': {
            description: 'Design with Adobe Photoshop, Illustrator, Cinema 3D and Canva',
            icon: '🎨',
            page: 'graphics.html'
        }
    };

    // track course access
    function trackCourseAccess(courseName) {
        try {
            const userData = JSON.parse(localStorage.getItem('tempUser')) || {};
            
            // initialize course history if it doesn't exist
            if (!userData.courseHistory) {  // Fixed typo: cousrseHistory -> courseHistory
                userData.courseHistory = [];
            }
            
            // add course access with timestamp
            userData.courseHistory.push({
                course: courseName,
                date: new Date().toISOString()
            });
            
            // store updated user data
            localStorage.setItem('tempUser', JSON.stringify(userData));
            console.log(`Tracked course access: ${courseName}`);  // Fixed typo: acess -> access
        } catch(error) {
            console.error('Error tracking course access:', error); 
        }
    }

    // handling course button clicks
    function setupCourseButtons() {
        courseButtons.forEach(button => {
            const courseName = button.textContent.trim().toUpperCase();
            
            // add icon if course exists in our data
            if (courseData[courseName]) {
                button.innerHTML = `${courseData[courseName].icon} ${button.textContent}`;
            }
            
            button.addEventListener('click', function(e) {  // Fixed: changed arrow function to regular function
                e.preventDefault();
                const selectedCourse = button.textContent.replace(/[^a-zA-Z ]/g, '').trim();  // Fixed: preserve spaces
                
                // store selected course in local storage
                localStorage.setItem('selectedCourse', selectedCourse);
                
                // track course access in user's history
                trackCourseAccess(selectedCourse);
                
                // redirect to course page if defined
                const coursePage = courseData[selectedCourse.toUpperCase()]?.page;
                if (coursePage) {
                    window.location.href = coursePage;
                }
            });
        });
    }

    // navigation toggle
    function setupHamburgerMenu() {
        if (hamburger && nav) {
            hamburger.addEventListener('click', () => {
                nav.classList.toggle('active');
                hamburger.classList.toggle('active');
            });
        }
    }

    // initialization
    function init() {
        loadUserData();
        setupHamburgerMenu();
        setupCourseButtons();
        
        // debug: log current course selection
        console.log('Current selected course:', localStorage.getItem('selectedCourse'));
    }

    init();
});