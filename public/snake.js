const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box }; // Hoofd
snake[1] = { x: 8 * box, y: 10 * box }; // Staart

let direction = 'RIGHT';
let food = generateFood();
let game; // Verplaats het game interval naar de buitenkant

let score = 0; // Variabele voor de score

// Laad de afbeeldingen
const snakeHeadImg = new Image();
snakeHeadImg.src = 'snakehead.png'; // Pad naar je slang hoofd afbeelding

const snakeBodyImg = new Image();
snakeBodyImg.src = 'snakebody.png'; // Pad naar je slang lichaam afbeelding

const snakeBodyCorner1Img = new Image();
snakeBodyCorner1Img.src = 'snakebody_corner1.png'; // Pad naar je slang lichaam met hoek 1 afbeelding

const snakeBodyCorner2Img = new Image();
snakeBodyCorner2Img.src = 'snakebody_corner2.png'; // Pad naar je slang lichaam met hoek 2 afbeelding

const snakeBodyCorner3Img = new Image();
snakeBodyCorner3Img.src = 'snakebody_corner3.png'; // Pad naar je slang lichaam met hoek 3 afbeelding

const snakeBodyCorner4Img = new Image();
snakeBodyCorner4Img.src = 'snakebody_corner4.png'; // Pad naar je slang lichaam met hoek 4 afbeelding

const snakeTailImg = new Image();
snakeTailImg.src = 'snaketail.png'; // Enige afbeelding voor de staart

const foodImg = new Image();
foodImg.src = 'apple.png'; // Pad naar je voedsel afbeelding

document.addEventListener('keydown', startGame);

function startGame(event) {
    if (!game) {
        game = setInterval(draw, snakeSpeed);
        document.removeEventListener('keydown', startGame);
        document.addEventListener('keydown', setDirection);
        setDirection(event);
    }
}

function setDirection(event) {
    if (event.keyCode === 37 && direction !== 'RIGHT') {
        direction = 'LEFT';
    } else if (event.keyCode === 38 && direction !== 'DOWN') {
        direction = 'UP';
    } else if (event.keyCode === 39 && direction !== 'LEFT') {
        direction = 'RIGHT';
    } else if (event.keyCode === 40 && direction !== 'UP') {
        direction = 'DOWN';
    }
}

function generateFood() {
    let possibleFoodLocations = [];
    for (let i = 0; i < canvas.width / box; i++) {
        for (let j = 0; j < canvas.height / box; j++) {
            let location = { x: i * box, y: j * box };
            let occupied = false;
            for (let k = 0; k < snake.length; k++) {
                if (snake[k].x === location.x && snake[k].y === location.y) {
                    occupied = true;
                    break;
                }
            }
            if (!occupied) {
                possibleFoodLocations.push(location);
            }
        }
    }
    let randomIndex = Math.floor(Math.random() * possibleFoodLocations.length);
    return possibleFoodLocations[randomIndex];
}

function collision(newHead, array) {
    for (let i = 1; i < array.length; i++) {
        if (newHead.x === array[i].x && newHead.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Wis het canvas

    // Teken de lichtgroene achtergrond
    ctx.fillStyle = '#8bc34a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            drawRotatedImage(snakeHeadImg, snake[i].x, snake[i].y, getHeadRotation(direction));
        } else if (i === snake.length - 1) {
            drawRotatedImage(snakeTailImg, snake[i].x, snake[i].y, getTailRotation(snake[i - 1], snake[i]));
        } else {
            let prev = snake[i - 1];
            let curr = snake[i];
            let next = snake[i + 1];

            let img;
            if ((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y)) {
                img = snakeBodyImg;
            } else {
                img = getBodyImage(prev, curr, next);
            }

            drawRotatedImage(img, curr.x, curr.y, getBodyRotation(prev, curr, next));
        }
    }

    ctx.drawImage(foodImg, food.x, food.y, box, box);

    if (!game) return;

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX === food.x && snakeY === food.y) {
        let newPart = { x: snake[snake.length - 1].x, y: snake[snake.length - 1].y };
        snake.push(newPart);
        food = generateFood();

        // Update the score
        score++;
        document.getElementById('score-value').textContent = score;
    } else {
        snake.pop();
    }

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        setTimeout(gameOverModal, 100);
    }

    snake.unshift(newHead);
}

function getBodyImage(prev, curr, next) {
    if (prev.x === curr.x && curr.x === next.x) {
        // Verticale beweging
        if (prev.y < curr.y && curr.x < next.x) {
            return snakeBodyCorner2Img; // Van boven naar rechts
        } else if (prev.y < curr.y && curr.x > next.x) {
            return snakeBodyCorner4Img; // Van boven naar links
        } else if (prev.y > curr.y && curr.x < next.x) {
            return snakeBodyCorner1Img; // Van onder naar rechts
        } else if (prev.y > curr.y && curr.x > next.x) {
            return snakeBodyCorner3Img; // Van onder naar links
        }
    } else if (prev.y === curr.y && curr.y === next.y) {
        // Horizontale beweging
        if (prev.x < curr.x && curr.y > next.y) {
            return snakeBodyCorner3Img; // Van rechts naar boven
        } else if (prev.x < curr.x && curr.y < next.y) {
            return snakeBodyCorner1Img; // Van rechts naar onder
        } else if (prev.x > curr.x && curr.y > next.y) {
            return snakeBodyCorner4Img; // Van links naar boven
        } else if (prev.x > curr.x && curr.y < next.y) {
            return snakeBodyCorner2Img; // Van links naar onder
        }
    } else {
        // Hoekafbeeldingen voor diagonale bewegingen
        if ((prev.x < curr.x && curr.y < next.y && (next.x < curr.x || prev.y > curr.y)) || 
            (prev.y < curr.y && curr.x < next.x && (next.y < curr.y || prev.x > curr.x))) {
            return snakeBodyCorner1Img; // Van links-boven naar rechts-onder
        } else if ((prev.y < curr.y && curr.x > next.x && (next.y < curr.y || prev.x < curr.x)) ||
                   (prev.x < curr.x && curr.y < next.y && (next.x > curr.x || prev.y < curr.y))) {
            return snakeBodyCorner2Img; // Van rechts-boven naar links-onder
        } else if ((prev.x > curr.x && curr.y > next.y && (next.x > curr.x || prev.y < curr.y)) ||
                   (prev.y > curr.y && curr.x < next.x && (next.y > curr.y || prev.x > curr.x))) {
            return snakeBodyCorner3Img; // Van links-onder naar rechts-boven
        } else if ((prev.y > curr.y && curr.x > next.x && (next.y > curr.y || prev.x < curr.x)) ||
                   (prev.x > curr.x && curr.y > next.y && (next.x < curr.x || prev.y > curr.y))) {
            return snakeBodyCorner4Img; // Van rechts-onder naar links-boven
        }
    }

    return snakeBodyImg; // Standaard lichaamssegment
}

function drawGrid() {
    ctx.strokeStyle = '#cccccc';
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= canvas.width; x += box) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }

    for (let y = 0; y <= canvas.height; y += box) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function getHeadRotation(direction) {
    switch (direction) {
        case 'UP':
            return -Math.PI / 2;
        case 'DOWN':
            return Math.PI / 2;
        case 'LEFT':
            return Math.PI;
        default:
            return 0;
    }
}

function getTailRotation(prev, curr) {
    if (prev.x === curr.x) {
        return prev.y > curr.y ? -Math.PI / 2 : Math.PI / 2;
    } else {
        return prev.x > curr.x ? Math.PI : 0;
    }
}

function getBodyRotation(prev, curr, next) {
    if (prev.x === curr.x && curr.x === next.x) {
        return 0; // Verticale lijn
    } else if (prev.y === curr.y && curr.y === next.y) {
        return Math.PI / 2; // Horizontale lijn
    }

    if (prev.x < curr.x && curr.y < next.y) { // Van links naar boven
        return -Math.PI / 2; // Draai naar rechts
    } else if (prev.y < curr.y && curr.x < next.x) { // Van boven naar rechts
        return 0; // Geen draai
    } else if (prev.x > curr.x && curr.y < next.y) { // Van rechts naar boven
        return Math.PI; // Draai naar links
    } else if (prev.y < curr.y && curr.x > next.x) { // Van boven naar links
        return Math.PI / 2; // Draai naar links
    }

    return 0; // Standaard geen draai
}

function drawRotatedImage(img, x, y, rotation) {
    ctx.save();
    ctx.translate(x + box / 2, y + box / 2);
    ctx.rotate(rotation);
    ctx.drawImage(img, -box / 2, -box / 2, box, box);
    ctx.restore();
}

function resetGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    snake[1] = { x: 8 * box, y: 10 * box };
    direction = 'RIGHT';
    food = generateFood();
    score = 0;
    document.getElementById('score-value').textContent = score;
    clearInterval(game);
    game = null;
    
    // Wis het canvas voordat je begint te tekenen
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    draw(); // Teken de begintoestand
    document.addEventListener('keydown', startGame); // Voeg de event listener opnieuw toe
}

function gameOverModal() {
    const modal = document.getElementById('myModal');
    const retryButton = document.getElementById('modal-retry-btn');
    const modalScore = document.getElementById('modal-score-value'); // Nieuw element voor modale score
    modalScore.textContent = score; // Update de modale score met de huidige score

    modal.style.display = 'block';

    retryButton.onclick = function () {
        modal.style.display = 'none';
        resetGame();
    };

    // Handle clicking outside modal
    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = 'none';
            resetGame();
        }
    };
}

const snakeSpeed = 250; // Define snake speed here
draw(); // Teken de begintoestand wanneer de pagina geladen is
