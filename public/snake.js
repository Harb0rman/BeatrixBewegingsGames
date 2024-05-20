const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const box = 20;
let snake = [];
snake[0] = { x: 9 * box, y: 10 * box };

let direction;
let food = generateFood();

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
    // Lijst van mogelijke locaties voor voedsel
    let possibleFoodLocations = [];
    for (let i = 0; i < canvas.width / box; i++) {
        for (let j = 0; j < canvas.height / box; j++) {
            let location = { x: i * box, y: j * box };
            // Controleer of de locatie niet door de slang wordt ingenomen
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

    // Kies een willekeurige locatie uit de lijst van mogelijke locaties
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

    for (let i = 0; i < snake.length; i++) {
        ctx.fillStyle = (i === 0) ? 'green' : 'white';
        ctx.fillRect(snake[i].x, snake[i].y, box, box);

        ctx.strokeStyle = 'red';
        ctx.strokeRect(snake[i].x, snake[i].y, box, box);
    }

    ctx.fillStyle = 'red';
    ctx.fillRect(food.x, food.y, box, box);

    let snakeX = snake[0].x;
    let snakeY = snake[0].y;

    if (direction === 'LEFT') snakeX -= box;
    if (direction === 'UP') snakeY -= box;
    if (direction === 'RIGHT') snakeX += box;
    if (direction === 'DOWN') snakeY += box;

    let newHead = { x: snakeX, y: snakeY };

    if (snakeX === food.x && snakeY === food.y) {
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

function resetGame() {
    snake = [];
    snake[0] = { x: 9 * box, y: 10 * box };
    direction = null;
    food = generateFood();
    game = setInterval(draw, 100);
}

let game = setInterval(draw, 100);
