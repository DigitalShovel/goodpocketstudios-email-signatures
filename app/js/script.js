// Authentication system
const AUTH_CONFIG = {
    password: 'goodp0cket', // Set your desired password here
    maxAttempts: 5,
    timeoutMinutes: 15
};

let previousCopyButton = null;
let isAuthenticated = false;
let failedAttempts = 0;
let timeoutUntil = null;

// Check if user is currently in timeout
function isInTimeout() {
    if (timeoutUntil && new Date() < timeoutUntil) {
        return true;
    }
    if (timeoutUntil && new Date() >= timeoutUntil) {
        // Timeout has expired, reset
        timeoutUntil = null;
        failedAttempts = 0;
        localStorage.removeItem('authTimeout');
        localStorage.removeItem('authFailedAttempts');
    }
    return false;
}

// Load authentication state from localStorage
function loadAuthState() {
    const savedTimeout = localStorage.getItem('authTimeout');
    const savedAttempts = localStorage.getItem('authFailedAttempts');
    
    if (savedTimeout) {
        timeoutUntil = new Date(savedTimeout);
    }
    if (savedAttempts) {
        failedAttempts = parseInt(savedAttempts);
    }
}

// Save authentication state to localStorage
function saveAuthState() {
    if (timeoutUntil) {
        localStorage.setItem('authTimeout', timeoutUntil.toISOString());
    }
    if (failedAttempts > 0) {
        localStorage.setItem('authFailedAttempts', failedAttempts.toString());
    }
}

// Show main content
function showMainContent() {
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
}

// Show authentication form
function showAuthForm() {
    document.getElementById('authOverlay').style.display = 'flex';
    document.getElementById('mainContent').style.display = 'none';
    
    if (isInTimeout()) {
        showTimeoutMessage();
    } else {
        showPasswordForm();
    }
}

// Show timeout message
function showTimeoutMessage() {
    const timeRemaining = Math.ceil((timeoutUntil - new Date()) / (1000 * 60));
    document.getElementById('passwordForm').style.display = 'none';
    document.getElementById('timeoutMessage').style.display = 'block';
    document.getElementById('timeoutMinutes').textContent = timeRemaining;
    
    // Update timeout countdown every minute
    const interval = setInterval(() => {
        const remaining = Math.ceil((timeoutUntil - new Date()) / (1000 * 60));
        if (remaining <= 0) {
            clearInterval(interval);
            showPasswordForm();
        } else {
            document.getElementById('timeoutMinutes').textContent = remaining;
        }
    }, 60000);
}

// Show password form
function showPasswordForm() {
    document.getElementById('passwordForm').style.display = 'block';
    document.getElementById('timeoutMessage').style.display = 'none';
    document.getElementById('passwordInput').focus();
    
    // Update attempts remaining
    const attemptsRemaining = AUTH_CONFIG.maxAttempts - failedAttempts;
    document.getElementById('attemptsRemaining').textContent = attemptsRemaining;
}

// Handle password submission
function handlePasswordSubmit(event) {
    event.preventDefault();
    
    if (isInTimeout()) {
        showTimeoutMessage();
        return;
    }
    
    const password = document.getElementById('passwordInput').value;
    const errorElement = document.getElementById('authError');
    
    if (password === AUTH_CONFIG.password) {
        // Correct password
        isAuthenticated = true;
        failedAttempts = 0;
        localStorage.removeItem('authFailedAttempts');
        localStorage.removeItem('authTimeout');
        showMainContent();
        document.getElementById('passwordInput').value = '';
        errorElement.textContent = '';
    } else {
        // Wrong password
        failedAttempts++;
        saveAuthState();
        
        if (failedAttempts >= AUTH_CONFIG.maxAttempts) {
            // Set timeout
            timeoutUntil = new Date(Date.now() + AUTH_CONFIG.timeoutMinutes * 60 * 1000);
            saveAuthState();
            showTimeoutMessage();
        } else {
            const attemptsRemaining = AUTH_CONFIG.maxAttempts - failedAttempts;
            errorElement.textContent = `Incorrect password. ${attemptsRemaining} attempt(s) remaining.`;
            document.getElementById('attemptsRemaining').textContent = attemptsRemaining;
        }
        
        document.getElementById('passwordInput').value = '';
    }
}

// Initialize authentication
function initAuth() {
    loadAuthState();
    
    if (isInTimeout() || !isAuthenticated) {
        showAuthForm();
    } else {
        showMainContent();
    }
    
    // Set up form submission
    document.getElementById('authForm').addEventListener('submit', handlePasswordSubmit);
    
    // Set up password toggle
    initPasswordToggle();
}

// Initialize password show/hide toggle
function initPasswordToggle() {
    const passwordInput = document.getElementById('passwordInput');
    const passwordToggle = document.getElementById('passwordToggle');
    
    passwordToggle.addEventListener('click', function() {
        if (passwordInput.type === 'password') {
            // Show password
            passwordInput.type = 'text';
            passwordToggle.textContent = '🙉'; // See no evil (showing password)
            passwordToggle.title = 'Hide Password';
        } else {
            // Hide password
            passwordInput.type = 'password';
            passwordToggle.textContent = '🙈'; // See no evil (hiding password)
            passwordToggle.title = 'Show Password';
        }
    });
}

// Email signature functionality
function initEmailSignatures() {
    document.querySelectorAll('.btn__select').forEach(buttonSelect => {
        buttonSelect.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the document click event from firing

            // If there was a previous selection, disable its copy button
            if (previousCopyButton) {
                previousCopyButton.setAttribute('disabled', 'disabled');
            }

            const signatureContainer = this.parentElement.parentElement;
            if (signatureContainer && signatureContainer.classList.contains('signature-container')) {
                const signature = signatureContainer.querySelector('.signature');
                if (signature) {
                    const range = document.createRange();
                    range.selectNode(signature);
                    window.getSelection().removeAllRanges(); // Clear previous selection
                    window.getSelection().addRange(range);

                    const copyButton = this.parentElement.querySelector('.btn__copy');
                    if (copyButton) {
                        copyButton.removeAttribute('disabled');
                        previousCopyButton = copyButton; // Keep track of the current copy button
                    }
                }
            }
        });
    });

    document.querySelectorAll('.btn__copy').forEach(buttonCopy => {
        buttonCopy.addEventListener('click', function(event) {
            event.stopPropagation(); // Prevent the document click event from firing
            document.execCommand('copy');
            window.getSelection().removeAllRanges();
            alert('Successfully copied selection to clipboard! You can now paste it into your email signature.');
        });
    });

    // Add a click event listener to the document
    document.addEventListener('click', function() {
        if (previousCopyButton) {
            previousCopyButton.setAttribute('disabled', 'disabled');
            window.getSelection().removeAllRanges();
        }
    });
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initAuth();
    initEmailSignatures();
});