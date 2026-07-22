document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const passwordInput = document.getElementById('password-input');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const clearPasswordBtn = document.getElementById('clear-password');
    const scoreLabel = document.getElementById('score-label');
    const scoreNumber = document.getElementById('score-number');
    const progressBar = document.getElementById('progress-bar');
    const scoreCircle = document.getElementById('score-circle');
    const crackTimeDisplay = document.getElementById('crack-time-display');
    const suggestionsList = document.getElementById('suggestions-container');
    const suggestionsUl = document.getElementById('suggestions-list');
    
    // Requirements Elements
    const reqs = {
        length: document.getElementById('req-length'),
        uppercase: document.getElementById('req-uppercase'),
        lowercase: document.getElementById('req-lowercase'),
        numbers: document.getElementById('req-numbers'),
        symbols: document.getElementById('req-symbols')
    };

    // Generator Elements
    const lengthSlider = document.getElementById('length-slider');
    const lengthDisplay = document.getElementById('length-display');
    const incUppercase = document.getElementById('inc-uppercase');
    const incLowercase = document.getElementById('inc-lowercase');
    const incNumbers = document.getElementById('inc-numbers');
    const incSymbols = document.getElementById('inc-symbols');
    const generateBtn = document.getElementById('generate-btn');
    const copyBtn = document.getElementById('copy-btn');
    const generatedPassword = document.getElementById('generated-password');

    // Simulation Elements
    const runSimBtn = document.getElementById('run-sim-btn');
    const bfScreen = document.getElementById('brute-force-screen');
    const bfProgress = document.getElementById('brute-force-progress');
    const bfStatus = document.getElementById('bf-status');
    const bfAttemptsLabel = document.getElementById('bf-attempts');
    
    const dictScreen = document.getElementById('dictionary-screen');
    const dictProgress = document.getElementById('dict-progress');
    const dictStatus = document.getElementById('dict-status');
    const dictAttemptsLabel = document.getElementById('dict-attempts');

    // UI Elements
    const themeToggle = document.getElementById('theme-toggle');
    const hamburger = document.getElementById('hamburger');
    const navLinksContainer = document.querySelector('.nav-links');
    const navLinks = document.querySelectorAll('.nav-link');
    const scrollTopBtn = document.getElementById('scroll-to-top');
    const currentYear = document.getElementById('current-year');

    // State Variables
    const COMMON_WORDS = ['password', 'admin', 'welcome', 'india123', 'qwerty', '123456', '123456789', 'letmein', 'root', 'superman', 'batman', 'dragon'];
    let simTimeouts = []; // Array to track and clear timeouts safely
    let currentScore = 0; // Store the global score for simulation logic

    // Set Year
    if(currentYear) currentYear.textContent = new Date().getFullYear();

    // Intersection Observer for Scroll Animations
    const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

    // ScrollSpy Logic
    const sections = document.querySelectorAll('section');
    window.addEventListener('scroll', () => {
        let current = '';
        const scrollY = window.pageYOffset;

        // Active link logic
        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });

        // Scroll to Top visibility
        if (scrollY > 400) {
            scrollTopBtn.style.display = 'flex';
        } else {
            scrollTopBtn.style.display = 'none';
        }
    });

    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        document.getElementById('moon-icon').style.display = isLight ? 'none' : 'block';
        document.getElementById('sun-icon').style.display = isLight ? 'block' : 'none';
    });

    // Mobile Menu
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinksContainer.classList.toggle('active');
    });

    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinksContainer.classList.remove('active');
        });
    });

    // Toggle Password Visibility
    let isPasswordVisible = false;
    togglePasswordBtn.addEventListener('click', () => {
        isPasswordVisible = !isPasswordVisible;
        passwordInput.setAttribute('type', isPasswordVisible ? 'text' : 'password');
        
        // Update feather icon dynamically
        togglePasswordBtn.innerHTML = isPasswordVisible 
            ? '<i data-feather="eye-off"></i>' 
            : '<i data-feather="eye"></i>';
        feather.replace();
    });

    // Clear Password
    clearPasswordBtn.addEventListener('click', () => {
        passwordInput.value = '';
        analyzePassword();
        passwordInput.focus();
    });

    // Main Analyzer Listener
    passwordInput.addEventListener('input', analyzePassword);

    function updateRequirement(el, condition, text) {
        if (condition) {
            el.classList.add('valid');
            el.innerHTML = `<i data-feather="check-circle" class="icon"></i> <span class="text">${text}</span>`;
        } else {
            el.classList.remove('valid');
            el.innerHTML = `<i data-feather="x-circle" class="icon"></i> <span class="text">${text}</span>`;
        }
        feather.replace();
    }

    function calculateScore(pwd) {
        let score = 0;
        let suggestions = [];
        const len = pwd.length;

        const hasUpper = /[A-Z]/.test(pwd);
        const hasLower = /[a-z]/.test(pwd);
        const hasNum = /[0-9]/.test(pwd);
        const hasSym = /[^A-Za-z0-9]/.test(pwd);

        updateRequirement(reqs.length, len >= 8, `Length (${len})`);
        updateRequirement(reqs.uppercase, hasUpper, 'Uppercase');
        updateRequirement(reqs.lowercase, hasLower, 'Lowercase');
        updateRequirement(reqs.numbers, hasNum, 'Numbers');
        updateRequirement(reqs.symbols, hasSym, 'Symbols');

        if (len === 0) return { score: 0, suggestions: [] };

        if (len <= 5) { score += 10; suggestions.push("Increase length to at least 12 characters."); }
        else if (len <= 8) { score += 25; suggestions.push("Length is okay, but 12+ characters is recommended."); }
        else if (len <= 12) { score += 45; }
        else { score += 60; }

        if (hasUpper) score += 10; else suggestions.push("Add uppercase letters.");
        if (hasLower) score += 10; else suggestions.push("Add lowercase letters.");
        if (hasNum) score += 10; else suggestions.push("Add numbers.");
        
        if (hasSym) {
            score += 15;
            if (len > 8 && (pwd.match(/[^A-Za-z0-9]/g) || []).length > 1) score += 5;
        } else {
            suggestions.push("Add special symbols (!@#$%).");
        }

        // Penalties for patterns and dictionary words
        if (/(.)\1{2,}/.test(pwd)) { score -= 15; suggestions.push("Avoid repeated characters (e.g., 'aaa')."); }
        if (/(012|123|234|345|456|567|678|789|890)/.test(pwd) || /(abc|bcd|cde|def|efg|fgh)/i.test(pwd)) {
            score -= 15; suggestions.push("Avoid sequential characters (e.g., '123', 'abc').");
        }
        if (/(qwerty|asdf|zxcv)/i.test(pwd)) { score -= 15; suggestions.push("Avoid keyboard patterns (e.g., 'qwerty')."); }
        
        COMMON_WORDS.forEach(word => {
            if (pwd.toLowerCase().includes(word)) {
                score -= 30; suggestions.push("Avoid common dictionary words.");
            }
        });

        score = Math.max(0, Math.min(100, score));
        return { score, suggestions };
    }

    function estimateCrackTime(score, len) {
        if (len === 0) return "Enter a password";
        if (score <= 20) return "Instantly";
        if (score <= 40) return "Minutes";
        if (score <= 60) return "Hours to Days";
        if (score <= 80) return "Years";
        return "Centuries";
    }

    function updateUI(score, suggestions, crackTime) {
        currentScore = score;
        scoreNumber.textContent = score;
        progressBar.style.width = `${score}%`;
        
        // Update SVG Circle Dashboard
        if (score > 0) {
            scoreCircle.setAttribute('stroke-dasharray', `${score}, 100`);
        } else {
            scoreCircle.setAttribute('stroke-dasharray', `0, 100`);
        }

        crackTimeDisplay.textContent = crackTime;
        
        let label = '';
        let color = '';

        if (score === 0 && passwordInput.value.length === 0) {
            label = "Awaiting Input...";
            color = 'var(--text-muted)';
            progressBar.style.backgroundColor = color;
        } else if (score <= 30) {
            label = "Vulnerable";
            color = '#ff3366'; // Neon Red
            progressBar.style.backgroundColor = color;
        } else if (score <= 60) {
            label = "Moderate";
            color = '#ff9900'; // Neon Orange
            progressBar.style.backgroundColor = color;
        } else if (score <= 80) {
            label = "Strong";
            color = 'var(--accent)'; // Neon Green
            progressBar.style.backgroundColor = color;
        } else {
            label = "Military Grade";
            color = 'var(--primary)'; // Neon Blue
            progressBar.style.backgroundColor = color;
        }

        scoreLabel.textContent = `Strength: ${label}`;
        scoreLabel.style.color = color;
        scoreCircle.style.stroke = color;

        // Update Suggestions
        if (suggestions.length > 0 && passwordInput.value.length > 0) {
            suggestionsList.style.display = 'block';
            suggestionsUl.innerHTML = '';
            const uniqueSuggestions = [...new Set(suggestions)].slice(0, 4);
            uniqueSuggestions.forEach(sug => {
                const li = document.createElement('li');
                li.textContent = sug;
                suggestionsUl.appendChild(li);
            });
        } else {
            suggestionsList.style.display = 'none';
        }

        runSimBtn.disabled = passwordInput.value.length === 0;
    }

    function analyzePassword() {
        const pwd = passwordInput.value;
        const analysis = calculateScore(pwd);
        const crackTime = estimateCrackTime(analysis.score, pwd.length);
        updateUI(Math.round(analysis.score), analysis.suggestions, crackTime);
        clearSimulations(); // Auto reset simulations on typing
    }

    // Generator Functions
    lengthSlider.addEventListener('input', (e) => {
        lengthDisplay.textContent = e.target.value;
    });

    function generatePassword() {
        const length = parseInt(lengthSlider.value);
        const useUpper = incUppercase.checked;
        const useLower = incLowercase.checked;
        const useNum = incNumbers.checked;
        const useSym = incSymbols.checked;

        if (!useUpper && !useLower && !useNum && !useSym) {
            generatedPassword.textContent = "Error: Select options";
            generatedPassword.style.color = '#ff3366';
            return;
        }

        const upperChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        const lowerChars = "abcdefghijklmnopqrstuvwxyz";
        const numChars = "0123456789";
        const symChars = "!@#$%^&*()_+~`|}{[]:;?><,./-=";

        let charset = "";
        let password = "";

        if (useUpper) { charset += upperChars; password += upperChars[Math.floor(Math.random() * upperChars.length)]; }
        if (useLower) { charset += lowerChars; password += lowerChars[Math.floor(Math.random() * lowerChars.length)]; }
        if (useNum) { charset += numChars; password += numChars[Math.floor(Math.random() * numChars.length)]; }
        if (useSym) { charset += symChars; password += symChars[Math.floor(Math.random() * symChars.length)]; }

        while (password.length < length) {
            charset += (useUpper?upperChars:"") + (useLower?lowerChars:"") + (useNum?numChars:"") + (useSym?symChars:"");
            password += charset[Math.floor(Math.random() * charset.length)];
        }

        password = password.split('').sort(() => 0.5 - Math.random()).join('');
        generatedPassword.textContent = password;
        generatedPassword.style.color = 'var(--text-main)';
        
        // Auto analyze generated password
        passwordInput.value = password;
        analyzePassword();
    }

    generateBtn.addEventListener('click', generatePassword);

    // Copy Password Toast
    function showToast() {
        const toast = document.getElementById('toast');
        toast.className = "toast show";
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    copyBtn.addEventListener('click', async () => {
        const text = generatedPassword.textContent;
        if (text === "Select options to generate" || text === "Error: Select options") return;
        
        try {
            await navigator.clipboard.writeText(text);
            showToast();
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    });

    // ----------------------------------------------------
    // Safe Attack Simulations (Hacker Terminal Logic)
    // ----------------------------------------------------
    
    function clearSimulations() {
        simTimeouts.forEach(t => clearTimeout(t));
        simTimeouts = [];
        
        bfScreen.innerHTML = `Waiting for target...<span class="sim-cursor"></span>`;
        bfProgress.style.width = '0%';
        bfStatus.textContent = "IDLE";
        bfStatus.className = "status-label";
        bfAttemptsLabel.textContent = "0 keys checked";
        
        dictScreen.innerHTML = `Waiting for target...<span class="sim-cursor"></span>`;
        dictProgress.style.width = '0%';
        dictStatus.textContent = "IDLE";
        dictStatus.className = "status-label";
        dictAttemptsLabel.textContent = "0% scanned";
        
        runSimBtn.innerHTML = '<i data-feather="play"></i> Initiate Attack Simulation';
        runSimBtn.disabled = passwordInput.value.length === 0;
        feather.replace();
    }

    function runSimulations() {
        const pwd = passwordInput.value;
        if (!pwd) return;

        clearSimulations(); // Clean state before starting
        runSimBtn.disabled = true;
        runSimBtn.innerHTML = '<i data-feather="loader"></i> Simulating Attack...';
        feather.replace();

        // Dynamic speed based on password score (Higher score = slower simulation)
        // This gives the illusion that a stronger password is harder to crack
        const bfDelay = Math.max(10, currentScore * 1.5); 
        const dictDelay = Math.max(100, currentScore * 3);

        const chars = "abcdefghijklmnopqrstuvwxyz0123456789!@#";
        const maxAttempts = 100;
        let bfAttempts = 0;

        // Setup Terminal Status
        bfStatus.textContent = "COMPUTING...";
        bfStatus.className = "status-label status-checking";
        dictStatus.textContent = "SCANNING...";
        dictStatus.className = "status-label status-checking";

        // Brute Force Simulation
        function animateBruteForce() {
            if (bfAttempts >= maxAttempts) {
                // Determine outcome based on score
                if (currentScore < 50) {
                    bfScreen.innerHTML = `> CRACKED: <span style="color:#ff3366">${pwd}</span><span class="sim-cursor"></span>`;
                    bfStatus.textContent = "PASSWORD CRACKED";
                    bfStatus.className = "status-label status-cracked";
                    bfProgress.style.width = "100%";
                } else {
                    bfScreen.innerHTML = `> Timeout. Key space too large.<span class="sim-cursor"></span>`;
                    bfStatus.textContent = "SIMULATION FAILED";
                    bfStatus.className = "status-label status-failed";
                }
                checkCompletion();
                return;
            }
            
            let guess = "";
            for(let i=0; i<Math.min(pwd.length, 8); i++) {
                guess += chars.charAt(Math.floor(Math.random() * chars.length));
            }
            
            bfScreen.innerHTML = `> Try: ${guess}<span class="sim-cursor"></span>`;
            bfProgress.style.width = `${(bfAttempts/maxAttempts)*100}%`;
            bfAttemptsLabel.textContent = `${(bfAttempts * 1420).toLocaleString()} keys checked`;
            
            // If very weak, crack it early
            if (currentScore < 20 && bfAttempts > 30) {
                bfScreen.innerHTML = `> CRACKED: <span style="color:#ff3366">${pwd}</span><span class="sim-cursor"></span>`;
                bfStatus.textContent = "PASSWORD CRACKED";
                bfStatus.className = "status-label status-cracked";
                bfProgress.style.width = "100%";
                checkCompletion();
                return;
            }
            
            bfAttempts++;
            simTimeouts.push(setTimeout(animateBruteForce, bfDelay));
        }

        // Dictionary Attack Simulation
        const simDict = [...COMMON_WORDS, '12345', 'qwerty123', 'admin123', 'root', 'superman', 'batman'];
        let dictIndex = 0;

        function animateDictionary() {
            if (dictIndex >= simDict.length) {
                dictScreen.innerHTML = `> No matches found in DB.<span class="sim-cursor"></span>`;
                dictStatus.textContent = "SIMULATION FAILED";
                dictStatus.className = "status-label status-failed";
                dictProgress.style.width = "100%";
                checkCompletion();
                return;
            }
            
            const word = simDict[dictIndex];
            dictScreen.innerHTML = `> Checking hash for: ${word}<span class="sim-cursor"></span>`;
            dictProgress.style.width = `${(dictIndex/simDict.length)*100}%`;
            dictAttemptsLabel.textContent = `${Math.round((dictIndex/simDict.length)*100)}% scanned`;
            
            if (pwd.toLowerCase().includes(word.toLowerCase())) {
                dictScreen.innerHTML = `> MATCH FOUND: <span style="color:#ff3366">${word}</span><span class="sim-cursor"></span>`;
                dictStatus.textContent = "VULNERABILITY DETECTED";
                dictStatus.className = "status-label status-cracked";
                dictProgress.style.width = "100%";
                dictAttemptsLabel.textContent = "100% scanned";
                
                // If dictionary finds it, force brute force to fail or halt
                simTimeouts.forEach(t => clearTimeout(t)); // Stop other animations
                bfScreen.innerHTML = `> Halted by external process.<span class="sim-cursor"></span>`;
                bfStatus.textContent = "HALTED";
                bfStatus.className = "status-label";
                
                checkCompletion();
                return;
            }
            
            dictIndex++;
            simTimeouts.push(setTimeout(animateDictionary, dictDelay));
        }

        let completedSims = 0;
        function checkCompletion() {
            completedSims++;
            if (completedSims >= 2 || (dictStatus.textContent === "VULNERABILITY DETECTED")) {
                setTimeout(() => {
                    runSimBtn.disabled = false;
                    runSimBtn.innerHTML = '<i data-feather="rotate-cw"></i> Restart Simulation';
                    feather.replace();
                }, 1000);
            }
        }

        // Start animations
        simTimeouts.push(setTimeout(animateBruteForce, 100));
        simTimeouts.push(setTimeout(animateDictionary, 300));
    }

    runSimBtn.addEventListener('click', runSimulations);

    // Initial check
    analyzePassword();
});
