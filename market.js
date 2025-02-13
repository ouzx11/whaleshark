// Market items
const marketItems = [
    {
        id: 'fish',
        name: 'Fish',
        price: 100,
        emoji: '🐟',
        owned: false
    },
    {
        id: 'dolphin',
        name: 'Dolphin',
        price: 200,
        emoji: '🐬',
        owned: false
    },
    {
        id: 'turtle',
        name: 'Turtle',
        price: 350,
        emoji: '🐢',
        owned: false
    },
    {
        id: 'octopus',
        name: 'Octopus',
        price: 500,
        emoji: '🐙',
        owned: false
    },
    {
        id: 'whale',
        name: 'Whale',
        price: 750,
        emoji: '🐋',
        owned: false
    },
    {
        id: 'shark',
        name: 'Shark',
        price: 1000,
        emoji: '🦈',
        owned: false
    },
    {
        id: 'mermaid',
        name: 'Mermaid',
        price: 1500,
        emoji: '🧜‍♀️',
        owned: false
    }
];

let selectedCharacter = null;

// Show alert message function
function showAlert(message) {
    const alertElement = document.createElement('div');
    alertElement.className = 'market-alert';
    alertElement.textContent = message;
    document.getElementById('gameContainer').appendChild(alertElement);

    // Remove alert after 2 seconds
    setTimeout(() => {
        alertElement.classList.add('fade-out');
        setTimeout(() => alertElement.remove(), 500);
    }, 2000);
}

// Toggle market panel
function toggleMarket() {
    const marketPanel = document.getElementById('marketPanel');
    marketPanel.style.display = marketPanel.style.display === 'none' ? 'block' : 'none';
}

// Initialize market items
function initializeMarket() {
    const container = document.querySelector('.market-items');
    container.innerHTML = '';

    marketItems.forEach(item => {
        const itemElement = document.createElement('div');
        itemElement.className = `market-item ${item.owned ? 'owned' : ''}`;
        itemElement.innerHTML = `
            <div class="market-item-emoji">${item.emoji}</div>
            <div class="market-item-name">${item.name}</div>
            <div class="market-item-price">${item.price}P</div>
        `;

        itemElement.onclick = () => purchaseItem(item);
        container.appendChild(itemElement);
    });
}

// Purchase item
function purchaseItem(item) {
    const currentScore = parseInt(document.getElementById('score').textContent);
    
    if (item.owned) {
        // Select already owned character
        selectedCharacter = item;
        updateSelectedCharacter();
        showAlert(`${item.name} selected!`);
        return;
    }

    if (currentScore >= item.price) {
        item.owned = true;
        selectedCharacter = item;
        updateSelectedCharacter();
        initializeMarket(); // Update market view
        showAlert(`${item.name} purchased!`);
    } else {
        // Insufficient points warning
        showAlert(`Not enough points! Need ${item.price - currentScore}P more.`);
    }
}

// Update selected character
function updateSelectedCharacter() {
    if (selectedCharacter) {
        // Update character in game.js
        window.updateGameCharacter(selectedCharacter);
    }
}

// Reset market
function resetMarket() {
    marketItems.forEach(item => item.owned = false);
    selectedCharacter = null;
    initializeMarket();
}

// Event Listeners
document.getElementById('marketBtn').addEventListener('click', toggleMarket);
document.querySelector('.close-market').addEventListener('click', toggleMarket);

// Initialize market when page loads
document.addEventListener('DOMContentLoaded', initializeMarket);
