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

    if (checkWin()) {
        document.getElementById('message').textContent = `You won! Next level: ${gridSize + 1}x${gridSize + 1}`;
        setTimeout(() => {
            gridSize++;
            initGame();
        }, 1500);
    }
}

function checkWin() {
    for (let i = 0; i < tiles.length - 1; i++) {
        if (tiles[i] !== i + 1) return false;
    }
    return tiles[tiles.length - 1] === 0;
}

// Start the game
initGame();
