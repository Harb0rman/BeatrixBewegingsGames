const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let direction;
let food = generateFood();

// Laad de afbeeldingen
const snakeHeadImg = new Image();
snakeHeadImg.src = 'snakehead.png'; // Pad naar je slang hoofd afbeelding

const snakeBodyImg = new Image();
snakeBodyImg.src = 'snakebody.png'; // Pad naar je slang lichaam afbeelding

const snakeBodyTurnImg = new Image();
snakeBodyTurnImg.src = 'snakebodyturn.png'; // Pad naar je slang lichaam met draai afbeelding

const snakeTailUpImg = new Image();
snakeTailUpImg.src = 'snaketail_up.png'; // Afbeelding voor de staart omhoog

const snakeTailDownImg = new Image();
snakeTailDownImg.src = 'snaketail_down.png'; // Afbeelding voor de staart omlaag

const snakeTailRightImg = new Image();
snakeTailRightImg.src = 'snaketail_right.png'; // Afbeelding voor de staart naar rechts

const snakeTailLeftImg = new Image();
snakeTailLeftImg.src = 'snaketail_left.png'; // Afbeelding voor de staart naar links

const foodImg = new Image();
foodImg.src = 'apple.png'; // Pad naar je voedsel afbeelding

document.addEventListener('keydown', setDirection);

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
    for (let i = 0; i < array.length; i++) {
        if (newHead.x === array[i].x && newHead.y === array[i].y) {
            return true;
        }
    }
    return false;
}

function draw() {
    ctx.fillStyle = '#f0f0f0';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawGrid();

    for (let i = 0; i < snake.length; i++) {
        if (i === 0) {
            drawRotatedImage(snakeHeadImg, snake[i].x, snake[i].y, getHeadRotation(direction));
        } else if (i === snake.length - 1) {
            drawRotatedImage(getTailImage(snake[i - 1], snake[i]), snake[i].x, snake[i].y, getTailRotation(snake[i - 1], snake[i]));
        } else {
            let prev = snake[i - 1];
            let curr = snake[i];
            let next = snake[i + 1];

            let img;
            if ((prev.x === curr.x && curr.x === next.x) || (prev.y === curr.y && curr.y === next.y)) {
                img = snakeBodyImg;
            } else {
                img = snakeBodyTurnImg; // Snake body with turn image
            }

            drawRotatedImage(img, curr.x, curr.y, getBodyRotation(prev, curr, next));
        }
    }

    ctx.drawImage(foodImg, food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX === food.x && snakeY === food.y) {
        // Voeg een nieuw lichaamsdeel toe
        snake.push({ x: snake[snake.length - 1].x, y: snake[snake.length - 1].y });
        food = generateFood();
    } else {
        snake.pop();
    }

    if (snakeX < 0 || snakeY < 0 || snakeX >= canvas.width || snakeY >= canvas.height || collision(newHead, snake)) {
        clearInterval(game);
        setTimeout(() => {
            if (confirm("Game over! Wil je opnieuw proberen?")) {
                resetGame();
            }
        }, 100);
    }

    snake.unshift(newHead);
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
        return prev.y > curr.y ? 0 : Math.PI;
    } else {
        return prev.x > curr.x ? Math.PI / 2 : -Math.PI / 2;
    }
}

function getTailImage(prev, curr) {
    if (prev.x === curr.x) {
        return prev.y > curr.y ? snakeTailUpImg : snakeTailDownImg;
    } else {
        return prev.x > curr.x ? snakeTailLeftImg : snakeTailRightImg;
    }
}

function getBodyRotation(prev, curr, next) {
    if (prev.x === curr.x && curr.x === next.x) {
        return 0; // Horizontal
    } else if (prev.y === curr.y && curr.y === next.y) {
        return Math.PI / 2; // Vertical
    } else if ((prev.x < curr.x && curr.y < next.y && prev.y === curr.y) || (prev.y < curr.y && curr.x > next.x && prev.x === curr.x)) {
        return -Math.PI / 2; // Right turn
    } else if ((prev.x > curr.x && curr.y < next.y && prev.y === curr.y) || (prev.y
        < curr.y && curr.x < next.x && prev.x === curr.x)) {
            return Math.PI; // Down turn
        } else if ((prev.x > curr.x && curr.y > next.y && prev.y === curr.y) || (prev.y > curr.y && curr.x < next.x && prev.x === curr.x)) {
            return Math.PI / 2; // Left turn
        } else if ((prev.x < curr.x && curr.y > next.y && prev.y === curr.y) || (prev.y > curr.y && curr.x > next.x && prev.x === curr.x)) {
            return -Math.PI / 2; // Up turn
        }
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
        direction = null;
        food = generateFood();
        clearInterval(game);
        game = setInterval(draw, snakeSpeed);
    }
    
    const snakeSpeed = 200; // Define snake speed here
    let game = setInterval(draw, snakeSpeed);
