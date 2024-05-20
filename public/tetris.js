const canvas = document.getElementById('tetrisCanvas');
const nextBlockCanvas = document.getElementById('nextBlockCanvas'); // New canvas for next block
const ctx = canvas.getContext('2d');

const blockSize = 20; // Size of each block in pixels
const rows = canvas.height / blockSize;
const cols = canvas.width / blockSize;
let score = 0; // Initialize score

// Define Tetris block shapes
const blockShapes = [
    [[1, 1], [1, 1]],  // Square block
    [[1, 1, 1, 1]],    // Line block
    [[1, 1, 0], [0, 1, 1]],  // S block
    [[0, 1, 1], [1, 1, 0]],  // Z block
    [[0, 1, 0], [1, 1, 1]],  // T block
    [[1, 1, 1], [0, 0, 1]],  // L block
    [[1, 1, 1], [1, 0, 0]],  // J block
];

let currentBlock = makeRandomBlock()


let landedBlocks = Array.from({ length: rows }, () => Array(cols).fill(false));
let gameOver = false;
let nextBlockShape;

function makeRandomBlock() {
    const blockShapes = [
        [[1, 1], [1, 1]],  // Square block
        [[1, 1, 1, 1]],    // Line block
        [[1, 1, 0], [0, 1, 1]],  // S block
        [[0, 1, 1], [1, 1, 0]],  // Z block
        [[0, 1, 0], [1, 1, 1]],  // T block
        [[1, 1, 1], [0, 0, 1]],  // L block
        [[1, 1, 1], [1, 0, 0]],  // J block
    ];

    const colors = ['blue', 'red', 'green', 'purple', 'orange', 'cyan']; // Define a list of colors
    const randomColor = colors[Math.floor(Math.random() * colors.length)]; // Choose a random color

    const randomShape = blockShapes[Math.floor(Math.random() * blockShapes.length)];
    const randomX = Math.floor(cols / 2) - 1; // Random x coordinate
    const randomY = 0; // Initial y coordinate

    return {
        color: randomColor,
        shape: randomShape,
        x: randomX,
        y: randomY
    };
}

function rotateBlock(shape, direction) {
    const rows = shape.length;
    const cols = shape[0].length;
    const rotatedShape = Array.from({ length: cols }, () => Array(rows).fill(0));
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            if (direction === 'left') {
                rotatedShape[cols - 1 - x][y] = shape[y][x];
            } else {
                rotatedShape[x][rows - 1 - y] = shape[y][x];
            }
        }
    }
    return rotatedShape;
}

function drawBlock(block) {
    ctx.fillStyle = block.color; // Set the fill color
    ctx.strokeStyle = 'black'; // Set stroke color
    ctx.lineWidth = 1; // Set line width
    for (let y = 0; y < block.shape.length; y++) {
        for (let x = 0; x < block.shape[y].length; x++) {
            if (block.shape[y][x]) {
                ctx.fillRect((block.x + x) * blockSize, (block.y + y) * blockSize, blockSize, blockSize);
                ctx.strokeRect((block.x + x) * blockSize, (block.y + y) * blockSize, blockSize, blockSize); // Draw stroke
            }
        }
    }
}

function drawGrid() {
    ctx.strokeStyle = 'lightgray';
    for (let i = 0; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * blockSize);
        ctx.lineTo(canvas.width, i * blockSize);
        ctx.stroke();
    }
    for (let j = 0; j < cols; j++) {
        ctx.beginPath();
        ctx.moveTo(j * blockSize, 0);
        ctx.lineTo(j * blockSize, canvas.height);
        ctx.stroke();
    }
}

function checkCollision(x, y, shape) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                const newX = x + col;
                const newY = y + row;
                if (newX < 0 || newX >= cols || newY >= rows || landedBlocks[newY][newX]) {
                    return true; // Collision detected
                }
            }
        }
    }
    return false; // No collision
}

function dropBlock() {
    if (!gameOver && !checkCollision(currentBlock.x, currentBlock.y + 1, currentBlock.shape)) {
        currentBlock.y++;
    } else {
        // Block has reached the bottom or collided with another block, add it to landed blocks
        if (!gameOver) {
            addBlockToLandedBlocks(currentBlock);
            checkFullRows();
            spawnNewBlock();
        }
    }
    if (currentBlock.y === 0 && checkCollision(currentBlock.x, currentBlock.y, currentBlock.shape)) {
        // Game over condition: block reached the top of the grid
        gameOver = true;
        openRestartModal(); // Open the restart modal
    }
    draw();
}

function addBlockToLandedBlocks(block) {
    for (let y = 0; y < block.shape.length; y++) {
        for (let x = 0; x < block.shape[y].length; x++) {
            if (block.shape[y][x]) {
                landedBlocks[block.y + y][block.x + x] = {
                    color: block.color, // Save the color of the block
                    shape: block.shape
                };
            }
        }
    }
}

function checkFullRows() {
    let rowsCleared = 0;
    for (let r = 0; r < rows; r++) {
        if (landedBlocks[r].every(cell => cell)) {
            // Remove the full row
            landedBlocks.splice(r, 1);
            // Add an empty row at the top
            landedBlocks.unshift(Array(cols).fill(false));
            rowsCleared++;
        }
    }
    score += rowsCleared * 10; // Increment score
    updateScore();
}

function spawnNewBlock() {
    if (!nextBlockShape) {
        nextBlockShape = makeRandomBlock();
    }
    const currentShape = nextBlockShape;
    nextBlockShape = makeRandomBlock();
    drawNextBlock(nextBlockShape); // Draw the next block
    currentBlock = currentShape
}

function drawLandedBlocks() {
    ctx.strokeStyle = 'black'; // Set stroke color
    ctx.lineWidth = 1; // Set line width
    for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
            const block = landedBlocks[y][x];
            if (block) {
                ctx.fillStyle = block.color; // Set color of the block
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.strokeRect(x * blockSize, y * blockSize, blockSize, blockSize); // Draw stroke
            }
        }
    }
}

function drawShadowBlock() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // Set color with transparency
    let shadowY = currentBlock.y;
    while (!checkCollision(currentBlock.x, shadowY + 1, currentBlock.shape)) {
        shadowY++; // Move the shadow block down until it collides
    }
    // Draw the shadow block
    for (let y = 0; y < currentBlock.shape.length; y++) {
        for (let x = 0; x < currentBlock.shape[y].length; x++) {
            if (currentBlock.shape[y][x]) {
                ctx.fillRect((currentBlock.x + x) * blockSize, (shadowY + y) * blockSize, blockSize, blockSize);
            }
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawGrid();
    drawLandedBlocks();
    drawShadowBlock(); // Draw the shadow block
    drawBlock(currentBlock);
}

function drawNextBlock(nextBlock) {
    const nextBlockCtx = nextBlockCanvas.getContext('2d');
    const blockSize = nextBlockCanvas.width / 4; // Adjust the blockSize to fit 4 cells horizontally

    nextBlockCtx.clearRect(0, 0, nextBlockCanvas.width, nextBlockCanvas.height);

    nextBlockCtx.fillStyle = nextBlock.color; // Use the color of the next block
    nextBlockCtx.strokeStyle = 'black';
    nextBlockCtx.lineWidth = 1;

    // Calculate the starting position for drawing the next block
    const startX = (nextBlockCanvas.width - nextBlock.shape[0].length * blockSize) / 2;
    const startY = (nextBlockCanvas.height - nextBlock.shape.length * blockSize) / 2;

    for (let y = 0; y < nextBlock.shape.length; y++) {
        for (let x = 0; x < nextBlock.shape[y].length; x++) {
            if (nextBlock.shape[y][x]) {
                nextBlockCtx.fillRect(startX + x * blockSize, startY + y * blockSize, blockSize, blockSize);
                nextBlockCtx.strokeRect(startX + x * blockSize, startY + y * blockSize, blockSize, blockSize);
            }
        }
    }
}



function drawGameOver() {
    ctx.fillStyle = 'red';
    ctx.font = '30px Arial';
    ctx.fillText('Game Over', canvas.width / 2 - 80, canvas.height / 2);
}

function updateScore() {
    const scoreElement = document.getElementById('score');
    scoreElement.textContent = 'Score: ' + score;
}

function openRestartModal() {
    const restartModal = document.getElementById('restartModal');
    restartModal.style.display = 'block'; // Show the restart modal
}

// Event listener for restart button
document.getElementById('restartButton').addEventListener('click', restartGame);

// Event listener for Enter key when the restart modal is open
document.addEventListener('keydown', function(event) {
    if (gameOver && event.keyCode === 13) { // Enter key
        restartGame();
    }
});

// Function to restart the game
function restartGame() {
    // Reset the game
    gameOver = false;
    score = 0;
    landedBlocks = Array.from({ length: rows }, () => Array(cols).fill(false));
    spawnNewBlock();
    draw();
    updateScore();
    // Hide the restart modal
    const restartModal = document.getElementById('restartModal');
    restartModal.style.display = 'none';
}

// Event listener for arrow keys and rotation keys
document.addEventListener('keydown', function(event) {
    if (!gameOver) {
        switch(event.keyCode) {
            case 37: // Left arrow
                if (!checkCollision(currentBlock.x - 1, currentBlock.y, currentBlock.shape)) {
                    currentBlock.x--;
                    draw();
                }
                break;
            case 39: // Right arrow
                if (!checkCollision(currentBlock.x + 1, currentBlock.y, currentBlock.shape)) {
                    currentBlock.x++;
                    draw();
                }
                break;
            case 40: // Down arrow
                if (!checkCollision(currentBlock.x, currentBlock.y + 1, currentBlock.shape)) {
                    currentBlock.y++;
                    draw();
                }
                break;
            case 81: // 'Q' key for rotate left
                const rotatedLeft = rotateBlock(currentBlock.shape, 'left');
                if (!checkCollision(currentBlock.x, currentBlock.y, rotatedLeft)) {
                    currentBlock.shape = rotatedLeft;
                    draw();
                }
                break;
            case 69: // 'E' key for rotate right
                const rotatedRight = rotateBlock(currentBlock.shape, 'right');
                if (!checkCollision(currentBlock.x, currentBlock.y, rotatedRight)) {
                    currentBlock.shape = rotatedRight;
                    draw();
                }
                break;
        }
    }
});

// Game loop
setInterval(dropBlock, 500); // Drop the block every 0.5 seconds

draw(); // Initial drawing
updateScore(); // Initialize score display