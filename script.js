// Coin System
let coinAmount = 0;
let coinRate = 0;
let coinInterval;

// Initialize coin system
function initCoinSystem() {
    // Load from localStorage
    const savedAmount = localStorage.getItem('coinAmount');
    const savedRate = localStorage.getItem('coinRate');
    
    coinAmount = savedAmount ? parseInt(savedAmount) : 0;
    coinRate = savedRate ? parseInt(savedRate) : 0;
    
    updateCoinDisplay();
    
    // Start the rate timer (every 3 seconds)
    coinInterval = setInterval(() => {
        if (coinRate > 0) {
            coinAmount += coinRate;
            saveCoinData();
            updateCoinDisplay();
        }
    }, 3000);
}

// Save coin data to localStorage
function saveCoinData() {
    localStorage.setItem('coinAmount', coinAmount.toString());
    localStorage.setItem('coinRate', coinRate.toString());
}

// Update coin display
function updateCoinDisplay() {
    const coinAmountElement = document.getElementById('coinAmount');
    if (coinAmountElement) {
        coinAmountElement.textContent = coinAmount.toLocaleString();
    }
}

// Navigation System
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.getAttribute('data-page');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');
            
            // Show target page
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === `${targetPage}-page`) {
                    page.classList.add('active');
                }
            });
        });
    });
}

// Wheel System
let isSpinning = false;

function initWheel() {
    const wheel = document.getElementById('wheel');
    const spinButton = document.getElementById('spinButton');
    const wheelResult = document.getElementById('wheelResult');
    
    if (spinButton) {
        spinButton.addEventListener('click', () => {
            if (!isSpinning) {
                spinWheel();
            }
        });
    }
}

function spinWheel() {
    if (isSpinning) return;
    
    isSpinning = true;
    const spinButton = document.getElementById('spinButton');
    const wheelResult = document.getElementById('wheelResult');
    const wheel = document.getElementById('wheel');
    
    // Disable button
    spinButton.disabled = true;
    spinButton.textContent = 'Spinning...';
    
    // Clear previous result
    wheelResult.textContent = '';
    
    // Random rotation (5-10 full rotations + random segment)
    const rotations = 5 + Math.random() * 5;
    const segmentAngle = 360 / 8; // 8 segments
    const randomSegment = Math.floor(Math.random() * 8);
    const finalAngle = rotations * 360 + (randomSegment * segmentAngle);
    
    // Apply rotation
    wheel.style.transform = `rotate(${finalAngle}deg)`;
    
    // Wait for animation to complete
    setTimeout(() => {
        // Calculate which segment the arrow points to
        // The arrow points to the top (12 o'clock position)
        // We need to find which segment is at the top after the wheel stops
        const normalizedAngle = finalAngle % 360;
        // Since the wheel rotates clockwise, we need to find which segment is at the top
        // The top position is 0 degrees, so we calculate which segment is there
        const segmentIndex = Math.floor(normalizedAngle / segmentAngle) % 8;
        
        // Get the result based on the calculated segment
        const segments = document.querySelectorAll('.wheel-segment');
        const winningSegment = segments[segmentIndex];
        const action = winningSegment.getAttribute('data-action');
        const value = winningSegment.getAttribute('data-value');
        
        // Apply the result
        applyWheelResult(action, value);
        
        // Show result message
        showWheelResult(action, value, winningSegment.textContent);
        
        // Re-enable button
        isSpinning = false;
        spinButton.disabled = false;
        spinButton.textContent = 'SPIN!';
        
    }, 3000);
}

function applyWheelResult(action, value) {
    switch (action) {
        case 'add':
            coinAmount += parseInt(value);
            break;
        case 'multiply':
            coinAmount = Math.floor(coinAmount * parseInt(value));
            break;
        case 'divide':
            coinAmount = Math.floor(coinAmount / parseInt(value));
            break;
        case 'lose-all':
            coinAmount = 0;
            break;
        case 'rate':
            coinRate += parseInt(value);
            break;
    }
    
    // Ensure coin amount doesn't go negative
    if (coinAmount < 0) coinAmount = 0;
    
    saveCoinData();
    updateCoinDisplay();
}

function showWheelResult(action, value, text) {
    const wheelResult = document.getElementById('wheelResult');
    let message = '';
    let color = '#333';
    
    switch (action) {
        case 'add':
            message = `You won ${value} coins!`;
            color = '#4CAF50';
            break;
        case 'multiply':
            message = `Your coins were multiplied by ${value}!`;
            color = '#2196F3';
            break;
        case 'divide':
            message = `Your coins were divided by ${value}!`;
            color = '#FF9800';
            break;
        case 'lose-all':
            message = 'You lost all your coins!';
            color = '#f44336';
            break;
        case 'rate':
            message = `Your coin rate increased by ${value}!`;
            color = '#9C27B0';
            break;
    }
    
    wheelResult.textContent = message;
    wheelResult.style.color = color;
    
    // Add animation
    wheelResult.style.animation = 'none';
    setTimeout(() => {
        wheelResult.style.animation = 'pulse 0.5s ease-in-out';
    }, 10);
}

// Add pulse animation
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCoinSystem();
    initNavigation();
    initWheel();
    
    // Show initial coin rate if it exists
    if (coinRate > 0) {
        console.log(`Coin rate: +${coinRate} every 3 seconds`);
    }
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    saveCoinData();
}); 