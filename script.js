let gridSize = 2;
let tileSize = 80;
let moves = 0;
let tiles = [];
let emptyIndex = -1;
let tileElements = {}; // Added: Object to store tile DOM elements

function initGame() {
    const container = document.getElementById('puzzle');
    container.style.width = `${gridSize * tileSize}px`;
    container.style.height = `${gridSize * tileSize}px`;

    // Create tiles
    tiles = Array.from({length: gridSize * gridSize - 1}, (_, i) => i + 1);
    tiles.push(0); // 0 represents empty space
    emptyIndex = tiles.length - 1;

    // Shuffle tiles
    shuffleTiles();

    // Render tiles
    container.innerHTML = '';
    tiles.forEach((num, index) => {
        const tile = document.createElement('div');
        tile.className = `puzzle-tile${num === 0 ? ' empty' : ''}`;
        tile.textContent = num || '';
        tile.style.width = `${tileSize - 2}px`;
        tile.style.height = `${tileSize - 2}px`;

        // Calculate position
        const x = (index % gridSize) * tileSize;
        const y = Math.floor(index / gridSize) * tileSize;
        tile.style.transform = `translate(${x}px, ${y}px)`;

        // Add click event listener
        tile.addEventListener('click', () => {
            const clickedIndex = tiles.indexOf(num);
            moveTile(clickedIndex);
        });

        container.appendChild(tile);
        tileElements[num] = tile; // Added: Store the element reference
    });

    moves = 0;
    document.getElementById('moveCounter').textContent = moves;
    document.getElementById('message').textContent = '';
}

function shuffleTiles() {
    // Shuffle by making valid moves in reverse
    let shuffleSteps = gridSize * 50;
    let lastMoved = -1;

    for (let i = 0; i < shuffleSteps; i++) {
        const neighbors = getValidMoves(emptyIndex);
        const validMoves = neighbors.filter(idx => idx !== lastMoved);
        const randomIdx = validMoves[Math.floor(Math.random() * validMoves.length)];

        // Swap tiles
        [tiles[emptyIndex], tiles[randomIdx]] = [tiles[randomIdx], tiles[emptyIndex]];
        lastMoved = emptyIndex;
        emptyIndex = randomIdx;
    }
}

function getValidMoves(index) {
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const moves = [];

    if (col > 0) moves.push(index - 1); // left
    if (col < gridSize - 1) moves.push(index + 1); // right
    if (row > 0) moves.push(index - gridSize); // up
    if (row < gridSize - 1) moves.push(index + gridSize); // down

    return moves;
}

function moveTile(clickedIndex) {
    if (!getValidMoves(emptyIndex).includes(clickedIndex)) return;

    // Swap positions
    [tiles[emptyIndex], tiles[clickedIndex]] = [tiles[clickedIndex], tiles[emptyIndex]];

    // Update positions with animation based on current tile positions
    const container = document.getElementById('puzzle'); // Keep this line if needed elsewhere, or remove if only used for children lookup
    tiles.forEach((num, index) => {
        const tileElement = tileElements[num]; // Changed: Get the correct element from our stored references
        if (tileElement) { // Added: Check if element exists
            const x = (index % gridSize) * tileSize;
            const y = Math.floor(index / gridSize) * tileSize;
            tileElement.style.transform = `translate(${x}px, ${y}px)`; // Changed: Apply transform to the correct element
        }
    });

    emptyIndex = clickedIndex;
    moves++;
    document.getElementById('moveCounter').textContent = moves;
    document.getElementById('moveSound').play(); // Play move sound

    if (checkWin()) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
        });
        document.getElementById('message').textContent = `You won! Next level: ${gridSize + 1}x${gridSize + 1}`;
        showCongratsScreen();
        document.getElementById('winSound').play(); // Play win sound
    }
}

function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
}

// --- Color Picker Logic ---
const colorPicker = document.getElementById('colorPicker');
const root = document.documentElement;

// Helper function to adjust hex color brightness
function adjustColor(hex, percent) {
    hex = hex.replace('#', '');
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    r = Math.min(255, Math.max(0, Math.round(r * (1 + percent / 100))));
    g = Math.min(255, Math.max(0, Math.round(g * (1 + percent / 100))));
    b = Math.min(255, Math.max(0, Math.round(b * (1 + percent / 100))));

    const rr = r.toString(16).padStart(2, '0');
    const gg = g.toString(16).padStart(2, '0');
    const bb = b.toString(16).padStart(2, '0');

    return `#${rr}${gg}${bb}`;
}

// Helper function to convert hex to rgba with alpha
function hexToRgba(hex, alpha) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}


function updateThemeColors(baseColor) {
    const hoverColor = adjustColor(baseColor, -15); // Darker for hover
    const headerColor = adjustColor(baseColor, -40); // Even darker for header
    const puzzleBgColor = adjustColor(baseColor, 30); // Lighter for puzzle background
    const accentColor = adjustColor(baseColor, 15); // Slightly lighter/different for accent
    const patternColor = hexToRgba(baseColor, 0.05); // Very transparent for pattern

    root.style.setProperty('--tile-bg', baseColor);
    root.style.setProperty('--tile-hover-bg', hoverColor);
    root.style.setProperty('--header-color', headerColor);
    root.style.setProperty('--puzzle-bg', puzzleBgColor);
    root.style.setProperty('--accent-color', accentColor);
    root.style.setProperty('--pattern-color', patternColor);

    // Optional: Adjust background based on brightness? Could be complex.
    // For now, keep --bg-color light. Maybe derive from baseColor too?
    // Let's try a very light version of the base color for the main background
    const mainBgColor = adjustColor(baseColor, 80); // Very light version
    root.style.setProperty('--bg-color', mainBgColor);
}

colorPicker.addEventListener('input', (event) => {
    updateThemeColors(event.target.value);
});

// Initial color set on load
updateThemeColors(colorPicker.value);
// --- End Color Picker Logic ---


// Congratulation screen functions
function showCongratsScreen() {
    document.querySelector('.congrats-moves').textContent = moves;
    document.querySelector('.congrats-screen').style.display = 'flex';
}

function hideCongratsScreen() {
    document.querySelector('.congrats-screen').style.display = 'none';
}

// Continue button handler
document.querySelector('.continue-btn').addEventListener('click', () => {
    gridSize++;
    hideCongratsScreen();
    initGame();
});

// Start the game
initGame();
