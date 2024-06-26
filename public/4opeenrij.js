class ConnectFour {
    constructor(rows, cols, containerId) {
        this.rows = rows;
        this.cols = cols;
        this.board = this.createBoard();
        this.container = document.getElementById(containerId);
        this.createBoardElements();
        this.player = 1;
        this.winner = null;
        this.currentCol = 0; // Initial column for the shadow piece
        this.createShadowPiece();
        this.updateShadowPiece();
        this.scores = [0, 0]; // Track scores for player 1 and player 2
        this.updateScorecards();
        this.addResetScoresButtonListener();
        this.updatePlayerInfo();
    }

    createBoard() {
        return Array.from({ length: this.rows }, () => Array(this.cols).fill(null));
    }

    createBoardElements() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const cellElement = document.createElement('div');
                cellElement.classList.add('cell');
                cellElement.dataset.row = row;
                cellElement.dataset.col = col;
                this.container.appendChild(cellElement);
            }
        }
    }

    createShadowPiece() {
        this.shadowPiece = document.createElement('div');
        this.shadowPiece.classList.add('cell', 'shadow');
        this.container.appendChild(this.shadowPiece);
    }

    calculateDropRow(col) {
        let row = this.rows - 1;
        while (row >= 0 && this.board[row][col] !== null) {
            row--;
        }
        return row;
    }

    updateShadowPiece() {
        const dropRow = this.calculateDropRow(this.currentCol);
        if (dropRow >= 0 && this.board[dropRow][this.currentCol] === null) {
            const cell = this.container.querySelector(`[data-row='${dropRow}'][data-col='${this.currentCol}']`);
            const rect = cell.getBoundingClientRect();
            const boardRect = this.container.getBoundingClientRect();
    
            // Adjustments to shift the shadow piece up and left slightly
            const adjustX = -1; // Adjust left by 2 pixels
            const adjustY = -2; // Adjust up by 2 pixels
    
            this.shadowPiece.style.display = 'block';
            this.shadowPiece.style.transform = `translate(${rect.left - boardRect.left + adjustX}px, ${rect.top - boardRect.top + adjustY}px)`;
        } else {
            this.shadowPiece.style.display = 'none'; // Hide the shadow piece if no valid cell is found or if the row is full
        }
    }
    
    dropPiece(col) {
        if (this.winner !== null || col < 0 || col >= this.cols || this.board[0][col] !== null) {
            return false; // Invalid move
        }
    
        const row = this.calculateDropRow(col);
        if (row < 0) return false; // No valid row available
    
        this.board[row][col] = this.player;
        const cell = this.container.querySelector(`[data-row='${row}'][data-col='${col}']`);
        cell.classList.add(`player${this.player}`);
        if (this.checkWinner(row, col)) {
            this.winner = this.player;
            this.scores[this.player - 1]++;
            this.updateScorecards();
            this.showModal(`Speler ${this.winner} wint!`);
            this.resetBoard(); // Reset the board after a player wins
        } else if (this.isBoardFull()) {
            this.showModal('Gelijkspel!');
            this.resetBoard(); // Reset the board after a draw
        } else {
            this.player = this.player === 1 ? 2 : 1;
            this.updatePlayerInfo();
        }
    
        // Only update currentCol if the move was valid
        this.currentCol = col;
        this.updateShadowPiece();
    
        return true;
    }
    
    showModal(text) {
        const modal = document.getElementById('myModal');
        const modalText = document.getElementById('modal-score-text');
        modalText.textContent = text;
        modal.style.display = 'block';
    
        // Close modal functionality (retry button)
        const retryBtn = document.getElementById('modal-retry-btn');
        retryBtn.addEventListener('click', () => {
            modal.style.display = 'none';
        });
    }

    checkWinner(row, col) {
        const directions = [
            [0, 1], // Horizontal
            [1, 0], // Vertical
            [1, 1], // Diagonal /
            [-1, 1] // Diagonal \
        ];

        for (let [dx, dy] of directions) {
            let count = 1; // Count of consecutive pieces
            let r = row + dx; // Move to the next adjacent cell
            let c = col + dy;

            // Check in the positive direction
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.player) {
                count++;
                r += dx;
                c += dy;
            }

            // Move back to the original cell
            r = row - dx;
            c = col - dy;

            // Check in the negative direction
            while (r >= 0 && r < this.rows && c >= 0 && c < this.cols && this.board[r][c] === this.player) {
                count++;
                r -= dx;
                c -= dy;
            }

            // If count reaches 4, player wins
            if (count >= 4) {
                return true;
            }
        }

        return false;
    }

    isBoardFull() {
        for (let col = 0; col < this.cols; col++) {
            if (this.board[0][col] === null) {
                return false;
            }
        }
        return true;
    }

    updateScorecards() {
        document.getElementById('player1-score').textContent = `Score: ${this.scores[0]}`;
        document.getElementById('player2-score').textContent = `Score: ${this.scores[1]}`;
    }

    resetBoard() {
        this.board = this.createBoard();
        const cells = this.container.querySelectorAll('.cell');
        cells.forEach(cell => {
            cell.classList.remove('player1', 'player2');
        });
        this.player = 1;
        this.winner = null;
        this.currentCol = 0;
        this.updateShadowPiece();
        this.updatePlayerInfo();
    }

    resetScores() {
        this.scores = [0, 0];
        this.updateScorecards();
        this.resetBoard();
    }

    addResetScoresButtonListener() {
        const resetScoresButton = document.getElementById('reset-scores');
        resetScoresButton.addEventListener('click', () => {
            this.resetScores();
        });
    }

    updatePlayerInfo() {
        const player1Info = document.getElementById('player1-info');
        const player2Info = document.getElementById('player2-info');

        if (this.player === 1) {
            player1Info.classList.remove('inactive');
            player2Info.classList.add('inactive');
        } else {
            player1Info.classList.add('inactive');
            player2Info.classList.remove('inactive');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const game = new ConnectFour(6, 7, '4opeenrij');
    document.addEventListener('keydown', (event) => {
        if (game.winner !== null) return;

        switch (event.key) {
            case 'ArrowLeft':
                game.currentCol = (game.currentCol - 1 + game.cols) % game.cols;
                while (game.board[0][game.currentCol] !== null) {
                    game.currentCol = (game.currentCol - 1 + game.cols) % game.cols;
                }
                game.updateShadowPiece();
                event.preventDefault(); // Prevent the default behavior of the key
                break;
            case 'ArrowRight':
                game.currentCol = (game.currentCol + 1) % game.cols;
                while (game.board[0][game.currentCol] !== null) {
                    game.currentCol = (game.currentCol + 1) % game.cols;
                }
                game.updateShadowPiece();
                event.preventDefault(); // Prevent the default behavior of the key
                break;
            case 'ArrowDown':
                game.dropPiece(game.currentCol);
                game.updateShadowPiece();
                event.preventDefault(); // Prevent the default behavior of the key
                break;
        }
    });
});
