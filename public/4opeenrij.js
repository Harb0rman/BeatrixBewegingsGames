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

  updateShadowPiece() {
      const gameBoard = document.querySelector('.game-board');
      const rect = gameBoard.getBoundingClientRect();
      const cellWidth = rect.width / this.cols;
      const shadowLeft = rect.left + this.currentCol * cellWidth;

      this.shadowPiece.style.position = 'absolute';
      this.shadowPiece.style.top = `${rect.top - rect.height}px`;
      this.shadowPiece.style.left = `${shadowLeft}px`; // Set left relative to game board
      this.shadowPiece.style.width = `${cellWidth}px`;
      this.shadowPiece.style.height = `${rect.height}px`;
  }

  dropPiece(col) {
      if (this.winner !== null || col < 0 || col >= this.cols || this.board[0][col] !== null) {
          return false; // Invalid move
      }

      let row = this.rows - 1;
      while (row >= 0 && this.board[row][col] !== null) {
          row--;
      }

      this.board[row][col] = this.player;
      const cell = this.container.querySelector(`[data-row='${row}'][data-col='${col}']`);
      cell.classList.add(`player${this.player}`);
      if (this.checkWinner(row, col)) {
          this.winner = this.player;
          this.scores[this.player - 1]++;
          alert(`Player ${this.winner} wins!`);
          this.updateScorecards();
      } else {
          this.player = this.player === 1 ? 2 : 1;
      }

      return true;
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

  updateScorecards() {
      document.getElementById('player1-score').textContent = `Score: ${this.scores[0]}`;
      document.getElementById('player2-score').textContent = `Score: ${this.scores[1]}`;
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const game = new ConnectFour(6, 7, '4opeenrij');
  document.addEventListener('keydown', (event) => {
      if (game.winner !== null) return;

      switch (event.key) {
          case 'ArrowLeft':
              game.currentCol = (game.currentCol - 1 + game.cols) % game.cols;
              game.updateShadowPiece();
              break;
          case 'ArrowRight':
              game.currentCol = (game.currentCol + 1) % game.cols;
              game.updateShadowPiece();
              break;
          case 'ArrowDown':
              game.dropPiece(game.currentCol);
              game.updateShadowPiece();
              break;
      }
  });
});
