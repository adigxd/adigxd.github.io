// Coin System
let coin_amount = 0;
let coin_rate = 1; // Default rate is 1
let coinInterval;
let rollCooldown = 0;
let rollCooldownInterval;

// Theme System
let darkMode = false;
let currentTheme = 'default';
let purchasedThemes = [];

// Initialize coin system
function initCoinSystem() {
    // Load from localStorage with new snake_case keys
    const savedAmount = localStorage.getItem('amount');
    const savedRate = localStorage.getItem('rate');
    const savedDarkMode = localStorage.getItem('dark_mode');
    const savedTheme = localStorage.getItem('current_theme');
    const savedPurchasedThemes = localStorage.getItem('purchased_themes');
    
    coin_amount = savedAmount ? parseInt(savedAmount) : 0;
    coin_rate = savedRate ? parseInt(savedRate) : 1;
    darkMode = savedDarkMode === 'true';
    currentTheme = savedTheme || 'default';
    purchasedThemes = savedPurchasedThemes ? JSON.parse(savedPurchasedThemes) : [];
    
    updateCoinDisplay();
    updateThemeToggles();
    applyTheme();
    
    // Start the rate timer (every 3 seconds)
    coinInterval = setInterval(() => {
        if (coin_rate > 0) {
            coin_amount += coin_rate;
            saveCoinData();
            updateCoinDisplay();
        }
    }, 3000);
}

// Save coin data to localStorage
function saveCoinData() {
    localStorage.setItem('amount', coin_amount.toString());
    localStorage.setItem('rate', coin_rate.toString());
    localStorage.setItem('dark_mode', darkMode.toString());
    localStorage.setItem('current_theme', currentTheme);
    localStorage.setItem('purchased_themes', JSON.stringify(purchasedThemes));
}

// Update coin display
function updateCoinDisplay() {
    const coinAmountElement = document.getElementById('coinAmount');
    if (coinAmountElement) {
        coinAmountElement.textContent = coin_amount.toLocaleString();
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

// Slot Machine System
let isRolling = false;

function initSlotMachine() {
    const rollButton = document.getElementById('rollButton');
    const rollTimer = document.getElementById('rollTimer');
    
    if (rollButton) {
        rollButton.addEventListener('click', () => {
            if (!isRolling && rollCooldown <= 0) {
                rollSlotMachine();
            }
        });
    }
    
    // Start cooldown timer
    rollCooldownInterval = setInterval(() => {
        if (rollCooldown > 0) {
            rollCooldown--;
            updateRollTimer();
        }
    }, 1000);
}

function rollSlotMachine() {
    if (isRolling || rollCooldown > 0) return;
    
    isRolling = true;
    const rollButton = document.getElementById('rollButton');
    const rollResult = document.getElementById('rollResult');
    const slotReel = document.getElementById('slotReel');
    
    // Disable button
    rollButton.disabled = true;
    rollButton.textContent = 'Rolling...';
    
    // Clear previous result
    rollResult.textContent = '';
    
    // Random outcome
    const outcomes = [
        { action: 'add', value: 10, text: '+10 coins' },
        { action: 'add', value: 100, text: '+100 coins' },
        { action: 'add', value: 1000, text: '+1000 coins' },
        { action: 'multiply', value: 2, text: 'coins × 2' },
        { action: 'multiply', value: 5, text: 'coins × 5' },
        { action: 'lose-all', value: 0, text: 'lose all coins' },
        { action: 'divide', value: 2, text: 'coins ÷ 2' },
        { action: 'divide', value: 5, text: 'coins ÷ 5' },
        { action: 'rate-add', value: 1, text: 'coin rate +1' },
        { action: 'rate-add', value: 10, text: 'coin rate +10' },
        { action: 'rate-multiply', value: 2, text: 'coin rate × 2' },
        { action: 'rate-divide', value: 2, text: 'coin rate ÷ 2' },
        { action: 'rate-set', value: 1, text: 'coin rate = 1' }
    ];
    
    const randomOutcome = outcomes[Math.floor(Math.random() * outcomes.length)];
    
    // Restore all slot items with bold text during roll
    const slotItems = slotReel.querySelectorAll('.slot-item');
    slotItems.forEach((item, index) => {
        item.textContent = outcomes[index].text;
        item.style.color = '#333';
        item.style.fontSize = '16px';
        item.style.fontWeight = 'bold';
    });
    
    // Animate slot reel
    const itemHeight = 80;
    const totalItems = outcomes.length;
    const randomIndex = Math.floor(Math.random() * totalItems);
    const finalPosition = -(randomIndex * itemHeight);
    
    slotReel.style.transform = `translateY(${finalPosition}px)`;
    
    // Wait for animation to complete
    setTimeout(() => {
        // Clear the landing position and show the winning text
        const winningSlotItem = slotItems[randomIndex];
        winningSlotItem.textContent = randomOutcome.text;
        winningSlotItem.style.color = getHighlightColor();
        winningSlotItem.style.fontSize = '28px';
        winningSlotItem.style.fontWeight = 'bold';
        winningSlotItem.style.transition = 'all 0.3s ease';
        
        // Apply the result
        applyRollResult(randomOutcome);
        
        // Show result message
        showRollResult(randomOutcome);
        
        // Re-enable button and start cooldown
        isRolling = false;
        rollCooldown = 5;
        updateRollTimer();
        
        // Reset slot item after a delay
        setTimeout(() => {
            winningSlotItem.style.fontSize = '16px';
            winningSlotItem.style.fontWeight = 'bold';
            winningSlotItem.style.transition = 'all 0.3s ease';
        }, 1000);
        
        // Reset slot reel
        setTimeout(() => {
            slotReel.style.transform = 'translateY(0)';
            // Restore all slot items to normal state
            slotItems.forEach((item, index) => {
                item.textContent = outcomes[index].text;
                item.style.color = '#333';
                item.style.fontSize = '16px';
                item.style.fontWeight = 'bold';
            });
        }, 2000);
        
    }, 3000);
}

function applyRollResult(outcome) {
    let coin_increase = 0;
    let before = coin_amount;
    let shouldRain = false;
    switch (outcome.action) {
        case 'add': {
            coin_increase = outcome.value;
            coin_amount += outcome.value;
            if (coin_increase >= 1000) shouldRain = true;
            break;
        }
        case 'multiply': {
            coin_amount = Math.floor(coin_amount * outcome.value);
            coin_increase = coin_amount - before;
            if (coin_increase >= 1000) shouldRain = true;
            break;
        }
        case 'divide': {
            coin_amount = Math.floor(coin_amount / outcome.value);
            coin_increase = coin_amount - before;
            break;
        }
        case 'lose-all':
            coin_amount = 0;
            break;
        case 'rate-add':
            coin_rate += outcome.value;
            break;
        case 'rate-multiply':
            coin_rate = Math.floor(coin_rate * outcome.value);
            break;
        case 'rate-divide':
            coin_rate = Math.floor(coin_rate / outcome.value);
            break;
        case 'rate-set':
            coin_rate = outcome.value;
            break;
    }
    // Ensure coin amount doesn't go negative
    if (coin_amount < 0) coin_amount = 0;
    // Ensure coin rate cannot go below 1
    coin_rate = Math.max(coin_rate, 1);
    // Debug output
    console.log('Roll outcome:', outcome, 'Before:', before, 'After:', coin_amount, 'Increase:', coin_increase);
    // Trigger coin rain only for add/multiply
    if (shouldRain) {
        triggerCoinRain();
    }
    saveCoinData();
    updateCoinDisplay();
}

function showRollResult(outcome) {
    const rollResult = document.getElementById('rollResult');
    let message = '';
    switch (outcome.action) {
        case 'add':
            message = `You won ${outcome.value} coins!`;
            break;
        case 'multiply':
            message = `Your coins were multiplied by ${outcome.value}!`;
            break;
        case 'divide':
            message = `Your coins were divided by ${outcome.value}!`;
            break;
        case 'lose-all':
            message = 'You lost all your coins!';
            break;
        case 'rate-add':
            message = `Your coin rate increased by ${outcome.value}!`;
            break;
        case 'rate-multiply':
            message = `Your coin rate was multiplied by ${outcome.value}!`;
            break;
        case 'rate-divide':
            message = `Your coin rate was divided by ${outcome.value}!`;
            break;
        case 'rate-set':
            message = `Your coin rate was set to ${outcome.value}!`;
            break;
    }
    rollResult.textContent = message;
    rollResult.style.color = getHighlightColor();
}

function triggerCoinRain() {
    const numCoins = 40;
    const durationMin = 2500; // ms
    const durationMax = 3500; // ms
    const coinSize = 48;
    for (let i = 0; i < numCoins; i++) {
        const coin = document.createElement('img');
        coin.src = 'resources/GIF-0_PST.gif'; // Use transparent/animated version
        coin.style.position = 'fixed';
        coin.style.left = `${Math.random() * 90 + 5}%`;
        coin.style.top = '-60px';
        coin.style.width = `${coinSize}px`;
        coin.style.height = `${coinSize}px`;
        coin.style.pointerEvents = 'none';
        coin.style.zIndex = 9999;
        // Random fall duration
        const fallDuration = durationMin + Math.random() * (durationMax - durationMin);
        coin.style.transition = `top ${fallDuration}ms cubic-bezier(0.4,0.7,0.6,1)`;
        // Stagger start times for GIF randomness
        const delay = Math.random() * 1200;
        setTimeout(() => {
            document.body.appendChild(coin);
            setTimeout(() => {
                coin.style.top = '100vh';
            }, 10);
            setTimeout(() => {
                if (coin.parentNode) coin.parentNode.removeChild(coin);
            }, fallDuration);
        }, delay);
    }
}

// SHA256 Hashing Function
async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Promo Code System
const promoCodes = {
    '099dff277c3cde879901c60791f5e1e1920d395a9fe9e84c4902a0b46a23ca69': 9270,
    'd75e1756b21c97ccc78ed6af6bb88eb1cb8fd84f9ec023de75d356875d312d6a': 1000,
    'a37a2500c9e50b1d729a6510adb91c884349aa5eda25f86f595a879f8e2c8d72': 4130
};

let redeemedPromoCodes = [];

function initPromoCodeSystem() {
    const promoButton = document.getElementById('promoButton');
    const promoInput = document.getElementById('promoInput');
    
    if (promoButton) {
        promoButton.addEventListener('click', () => {
            validatePromoCode();
        });
    }
    
    if (promoInput) {
        promoInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                validatePromoCode();
            }
        });
    }
    
    // Load redeemed codes from localStorage
    const savedRedeemedCodes = localStorage.getItem('redeemed_promo_codes');
    if (savedRedeemedCodes) {
        redeemedPromoCodes = JSON.parse(savedRedeemedCodes);
    }
}

async function validatePromoCode() {
    const promoInput = document.getElementById('promoInput');
    const promoResult = document.getElementById('promoResult');
    const promoButton = document.getElementById('promoButton');
    
    const inputCode = promoInput.value.trim();
    
    if (!inputCode) {
        showPromoResult('Please enter a promo code.', 'error');
        return;
    }
    
    // Disable button during validation
    promoButton.disabled = true;
    promoButton.textContent = 'Validating...';
    
    try {
        // Hash the input code
        const hashedInput = await sha256(inputCode);
        
        // Check if code exists and hasn't been redeemed
        if (promoCodes[hashedInput]) {
            if (redeemedPromoCodes.includes(hashedInput)) {
                showPromoResult('This promo code has already been redeemed.', 'error');
            } else {
                // Redeem the code
                const reward = promoCodes[hashedInput];
                coin_amount += reward;
                redeemedPromoCodes.push(hashedInput);
                
                // Save to localStorage
                localStorage.setItem('redeemed_promo_codes', JSON.stringify(redeemedPromoCodes));
                saveCoinData();
                updateCoinDisplay();
                
                showPromoResult(`Successfully redeemed! You received ${reward} coins.`, 'success');
                promoInput.value = '';
            }
        } else {
            showPromoResult('Invalid promo code.', 'error');
        }
    } catch (error) {
        showPromoResult('Error validating promo code. Please try again.', 'error');
    }
    
    // Re-enable button
    promoButton.disabled = false;
    promoButton.textContent = 'Redeem';
}

function showPromoResult(message, type) {
    const promoResult = document.getElementById('promoResult');
    promoResult.textContent = message;
    promoResult.className = `promo-result ${type}`;
    
    // Clear result after 5 seconds
    setTimeout(() => {
        promoResult.textContent = '';
        promoResult.className = 'promo-result';
    }, 5000);
}

function updateRollTimer() {
    const rollButton = document.getElementById('rollButton');
    const rollTimer = document.getElementById('rollTimer');
    
    if (rollCooldown > 0) {
        rollButton.disabled = true;
        rollButton.textContent = 'Roll';
        rollTimer.textContent = '';
    } else {
        rollButton.disabled = false;
        rollButton.textContent = 'Roll';
        rollTimer.textContent = '';
    }
}

function getHighlightColor() {
    if (currentTheme === 'blue_theme') return '#2196F3';
    if (currentTheme === 'mint_theme') return '#7FDBB6';
    if (currentTheme === 'gold_theme') return '#FFD700';
    return '#ff6b35'; // default
}

// Shop System
function initShop() {
    const buyButtons = document.querySelectorAll('.buy-button');
    
    buyButtons.forEach(button => {
        button.addEventListener('click', () => {
            const item = button.getAttribute('data-item');
            const shopItem = button.closest('.shop-item');
            const price = parseInt(shopItem.getAttribute('data-price'));
            
            if (coin_amount >= price && !purchasedThemes.includes(item)) {
                // Purchase item
                coin_amount -= price;
                purchasedThemes.push(item);
                
                // Update UI
                button.textContent = 'Owned';
                button.disabled = true;
                shopItem.style.opacity = '0.7';
                
                saveCoinData();
                updateCoinDisplay();
                updateThemeToggles();
                
                // Show purchase message
                showPurchaseMessage(item);
            }
        });
    });
    
    // Update shop UI based on owned items
    updateShopUI();
}

function updateShopUI() {
    const shopItems = document.querySelectorAll('.shop-item');
    
    shopItems.forEach(item => {
        const itemName = item.getAttribute('data-item');
        const buyButton = item.querySelector('.buy-button');
        
        if (purchasedThemes.includes(itemName)) {
            buyButton.textContent = 'Owned';
            buyButton.disabled = true;
            item.style.opacity = '0.7';
        }
    });
}

function showPurchaseMessage(item) {
    const messages = {
        'dark_mode': 'Dark mode unlocked!',
        'blue_theme': 'Blue theme unlocked!',
        'mint_theme': 'Mint theme unlocked!',
        'gold_theme': 'Fancy gold theme unlocked!'
    };
    
    const message = messages[item] || 'Item purchased!';
    
    // Create temporary notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #4CAF50;
        color: white;
        padding: 15px 25px;
        border-radius: 10px;
        font-weight: bold;
        z-index: 1000;
        animation: fadeInOut 2s ease-in-out;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        document.body.removeChild(notification);
    }, 2000);
}

// Theme System
function initThemeToggles() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorToggle = document.getElementById('colorToggle');
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', () => {
            if (purchasedThemes.includes('dark_mode')) {
                darkMode = !darkMode;
                applyTheme();
                saveCoinData();
            }
        });
    }
    
    if (colorToggle) {
        colorToggle.addEventListener('click', () => {
            if (purchasedThemes.length > 0) {
                cycleTheme();
                applyTheme();
                saveCoinData();
            }
        });
    }
}

function updateThemeToggles() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const colorToggle = document.getElementById('colorToggle');
    
    // Update dark mode toggle
    if (purchasedThemes.includes('dark_mode')) {
        darkModeToggle.classList.remove('disabled');
        darkModeToggle.classList.toggle('active', darkMode);
    } else {
        darkModeToggle.classList.add('disabled');
        darkModeToggle.classList.remove('active');
    }
    
    // Update color toggle
    if (purchasedThemes.length > 0) {
        colorToggle.classList.remove('disabled');
        colorToggle.classList.add('active');
    } else {
        colorToggle.classList.add('disabled');
        colorToggle.classList.remove('active');
    }
}

function cycleTheme() {
    const availableThemes = ['default', ...purchasedThemes.filter(theme => theme !== 'dark_mode')];
    const currentIndex = availableThemes.indexOf(currentTheme);
    const nextIndex = (currentIndex + 1) % availableThemes.length;
    currentTheme = availableThemes[nextIndex];
}

function applyTheme() {
    const body = document.body;
    
    // Remove all theme classes
    body.classList.remove('dark-mode', 'theme-blue', 'theme-mint', 'theme-gold');
    
    // Apply dark mode
    if (darkMode) {
        body.classList.add('dark-mode');
    }
    
    // Apply color theme
    if (currentTheme !== 'default') {
        body.classList.add(`theme-${currentTheme.replace('_theme', '')}`);
    }
    updateRollSplashColors();
}

function updateRollSplashColors() {
    // Update roll-result splash text color
    const rollResult = document.getElementById('rollResult');
    if (rollResult) {
        rollResult.style.color = getHighlightColor();
    }
    // Update the currently splashed slot item (font-size 28px)
    const slotReel = document.getElementById('slotReel');
    if (slotReel) {
        const slotItems = slotReel.querySelectorAll('.slot-item');
        slotItems.forEach(item => {
            if (item.style.fontSize === '28px') {
                item.style.color = getHighlightColor();
            }
        });
    }
}

// Add animations
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
    }
    
    @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        20% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        80% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
    }
`;
document.head.appendChild(style);

// --- Reaction Game ---
let reaction_state = 'idle'; // 'idle', 'waiting', 'ready'
let reaction_timeout = null;
let reaction_start_time = null;

function initReactionGame() {
    const reaction_nav = document.getElementById('reactionNav');
    const reaction_page = document.getElementById('reaction-page');
    const reaction_button = document.getElementById('reactionButton');
    const reaction_splash = document.getElementById('reactionSplash');

    // Button logic
    reaction_button.addEventListener('click', () => {
        if (reaction_state === 'idle') {
            // Start waiting
            reaction_state = 'waiting';
            reaction_button.classList.add('waiting');
            reaction_button.classList.remove('ready');
            reaction_button.innerHTML = 'Wait...';
            reaction_splash.textContent = '';
            // Random delay 3-6s
            const delay = 3000 + Math.random() * 3000;
            reaction_timeout = setTimeout(() => {
                reaction_state = 'ready';
                reaction_button.classList.remove('waiting');
                reaction_button.classList.add('ready');
                reaction_button.innerHTML = 'CLICK!';
                reaction_start_time = Date.now();
            }, delay);
        } else if (reaction_state === 'waiting') {
            // Clicked too early
            clearTimeout(reaction_timeout);
            reaction_state = 'idle';
            reaction_button.classList.remove('waiting', 'ready');
            reaction_button.innerHTML = 'Click to start the Reaction Time test!<br><span class="reaction-rules">&lt; 200 ms = +2000 coins<br>&lt; 250 ms = +1000 coins<br>&gt; 250 ms = lose all coins</span>';
            reaction_splash.textContent = 'You clicked too early! You lost all your coins...';
            coin_amount = 0;
            localStorage.setItem('amount', coin_amount);
            updateCoinDisplay();
        } else if (reaction_state === 'ready') {
            // Measure reaction time
            const reaction_time = Date.now() - reaction_start_time;
            let reward = 0;
            if (reaction_time < 200) {
                reward = 2000;
                reaction_splash.textContent = `Amazing! ${reaction_time} ms. You earned 2000 coins!`;
            } else if (reaction_time < 250) {
                reward = 1000;
                reaction_splash.textContent = `Great! ${reaction_time} ms. You earned 1000 coins!`;
            } else {
                reaction_splash.textContent = `Too slow! ${reaction_time} ms. You lost all your coins...`;
                coin_amount = 0;
                localStorage.setItem('amount', coin_amount);
                updateCoinDisplay();
                resetReactionButton();
                return;
            }
            coin_amount += reward;
            localStorage.setItem('amount', coin_amount);
            updateCoinDisplay();
            resetReactionButton();
        }
    });

    function resetReactionButton() {
        reaction_state = 'idle';
        reaction_button.classList.remove('waiting', 'ready');
        reaction_button.innerHTML = 'Click to start the Reaction Time test!<br><span class="reaction-rules">&lt; 200 ms = +2000 coins<br>&lt; 250 ms = +1000 coins<br>&gt; 250 ms = lose all coins</span>';
    }
}

// Initialize everything when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initCoinSystem();
    initNavigation();
    initSlotMachine();
    initShop();
    initThemeToggles();
    initPromoCodeSystem(); // Initialize promo code system
    initReactionGame(); // Initialize reaction game
    
    console.log(`Coin rate: +${coin_rate} every 3 seconds`);
});

// Save data before page unload
window.addEventListener('beforeunload', () => {
    saveCoinData();
}); 