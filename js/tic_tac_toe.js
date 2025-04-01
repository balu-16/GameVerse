const board = document.getElementById('board');
const status = document.getElementById('status');
let currentPlayer = 'X';
const cells = Array(9).fill(null);
// Separate score variables for each game mode
let scoreXvsCom = 0;
let scoreOvsCom = 0;
let scoreXvsPlayer = 0;
let scoreOvsPlayer = 0;
let vsComputer = false;
let gameActive = true;

function initGame() {
    // Create game mode selection if it doesn't exist
    if (!document.querySelector('.game-mode')) {
        const gameModeSelect = document.createElement('div');
        gameModeSelect.classList.add('game-mode');
        gameModeSelect.innerHTML = `
            <h3>Game Mode</h3>
            <div class="mode-selection">
                <button id="vs-player" class="mode-btn active">2 Players</button>
                <button id="vs-computer" class="mode-btn">vs Computer</button>
            </div>
        `;
        document.querySelector('.game-area').insertBefore(gameModeSelect, board);
        
        // Add event listeners for mode selection
        document.getElementById('vs-player').addEventListener('click', () => {
            if (!vsComputer) return; // Already in this mode
            
            vsComputer = false;
            document.getElementById('vs-player').classList.add('active');
            document.getElementById('vs-computer').classList.remove('active');
            
            // Update player labels
            document.getElementById('player-x-label').innerText = 'Player X';
            document.getElementById('player-o-label').innerText = 'Player O';
            
            // Update the score display for player vs player mode
            document.getElementById('score-x').innerText = scoreXvsPlayer;
            document.getElementById('score-o').innerText = scoreOvsPlayer;
            
            resetGame();
        });
        
        document.getElementById('vs-computer').addEventListener('click', () => {
            if (vsComputer) return; // Already in this mode
            
            vsComputer = true;
            document.getElementById('vs-computer').classList.add('active');
            document.getElementById('vs-player').classList.remove('active');
            
            // Update player labels
            document.getElementById('player-x-label').innerText = 'You (X)';
            document.getElementById('player-o-label').innerText = 'Computer (O)';
            
            // Update the score display for player vs computer mode
            document.getElementById('score-x').innerText = scoreXvsCom;
            document.getElementById('score-o').innerText = scoreOvsCom;
            
            resetGame();
            
            // Randomly decide who goes first when playing against computer
            if (Math.random() > 0.5) {
                currentPlayer = 'O';
                status.innerText = `Computer's turn`;
                setTimeout(makeComputerMove, 800);
            }
        });
    }
    
    // Create score display
    if (!document.querySelector('.score-board')) {
        const scoreBoard = document.createElement('div');
        scoreBoard.classList.add('score-board');
        scoreBoard.innerHTML = `
            <div class="player x-score">
                <span id="player-x-label">Player X</span>
                <span id="score-x">0</span>
            </div>
            <div class="player o-score">
                <span id="player-o-label">Player O</span>
                <span id="score-o">0</span>
            </div>
        `;
        document.querySelector('.game-area').insertBefore(scoreBoard, board);
    }
}

function createBoard() {
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.addEventListener('click', () => handleClick(i));
        board.appendChild(cell);
    }
}

function handleClick(index) {
    if (!gameActive || cells[index] || checkWinner()) return;
    
    cells[index] = currentPlayer;
    render();
    
    if (checkWinner()) {
        endGame(`${currentPlayer} wins!`, 'win');
        
        // Update appropriate score based on game mode
        if (currentPlayer === 'X') {
            if (vsComputer) {
                scoreXvsCom++;
                document.getElementById('score-x').innerText = scoreXvsCom;
            } else {
                scoreXvsPlayer++;
                document.getElementById('score-x').innerText = scoreXvsPlayer;
            }
        } else {
            if (vsComputer) {
                scoreOvsCom++;
                document.getElementById('score-o').innerText = scoreOvsCom;
            } else {
                scoreOvsPlayer++;
                document.getElementById('score-o').innerText = scoreOvsPlayer;
            }
        }
    } else if (cells.every(cell => cell)) {
        endGame("It's a tie!", 'tie');
    } else {
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
        status.innerText = `Current player: ${currentPlayer}`;
        status.className = '';
        
        // If playing against computer, make the computer move
        if (vsComputer && currentPlayer === 'O') {
            setTimeout(makeComputerMove, 500);
        }
    }
}

function makeComputerMove() {
    if (!gameActive) return;
    
    // Check for winning move
    const winningMove = findBestMove('O');
    if (winningMove !== -1) {
        handleClick(winningMove);
        return;
    }
    
    // Check for blocking move
    const blockingMove = findBestMove('X');
    if (blockingMove !== -1) {
        handleClick(blockingMove);
        return;
    }
    
    // Try to take center
    if (cells[4] === null) {
        handleClick(4);
        return;
    }
    
    // Take any available corner
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => cells[i] === null);
    if (availableCorners.length > 0) {
        const randomCorner = availableCorners[Math.floor(Math.random() * availableCorners.length)];
        handleClick(randomCorner);
        return;
    }
    
    // Take any available side
    const sides = [1, 3, 5, 7];
    const availableSides = sides.filter(i => cells[i] === null);
    if (availableSides.length > 0) {
        const randomSide = availableSides[Math.floor(Math.random() * availableSides.length)];
        handleClick(randomSide);
        return;
    }
}

function findBestMove(player) {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    // Look for a winning or blocking move
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        // Check if two cells in a line are filled by the player and the third is empty
        if (cells[a] === player && cells[b] === player && cells[c] === null) {
            return c;
        }
        if (cells[a] === player && cells[c] === player && cells[b] === null) {
            return b;
        }
        if (cells[b] === player && cells[c] === player && cells[a] === null) {
            return a;
        }
    }
    
    return -1;
}

function endGame(message, className) {
    status.innerText = message;
    status.className = className;
    gameActive = false;
    highlightWinningCells();
}

function render() {
    const cellElements = document.querySelectorAll('.cell');
    cells.forEach((cell, index) => {
        cellElements[index].innerText = cell;
        if (cell === 'X') {
            cellElements[index].classList.add('x-cell');
            cellElements[index].classList.remove('o-cell');
        } else if (cell === 'O') {
            cellElements[index].classList.add('o-cell');
            cellElements[index].classList.remove('x-cell');
        }
    });
}

function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    return winningCombinations.some(combination => {
        const [a, b, c] = combination;
        return cells[a] && cells[a] === cells[b] && cells[a] === cells[c];
    });
}

function highlightWinningCells() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    
    const cellElements = document.querySelectorAll('.cell');
    
    for (const combination of winningCombinations) {
        const [a, b, c] = combination;
        if (cells[a] && cells[a] === cells[b] && cells[a] === cells[c]) {
            cellElements[a].classList.add('winning-cell');
            cellElements[b].classList.add('winning-cell');
            cellElements[c].classList.add('winning-cell');
            break;
        }
    }
}

function resetGame() {
    cells.fill(null);
    currentPlayer = 'X';
    gameActive = true;
    status.innerText = `Current player: ${currentPlayer}`;
    status.className = '';
    
    const cellElements = document.querySelectorAll('.cell');
    cellElements.forEach(cell => {
        cell.innerText = '';
        cell.className = 'cell';
    });
    
    // If playing against computer and computer starts (O), make a move
    if (vsComputer && currentPlayer === 'O') {
        setTimeout(makeComputerMove, 500);
    }
}

function resetScores() {
    if (vsComputer) {
        scoreXvsCom = 0;
        scoreOvsCom = 0;
        document.getElementById('score-x').innerText = '0';
        document.getElementById('score-o').innerText = '0';
    } else {
        scoreXvsPlayer = 0;
        scoreOvsPlayer = 0;
        document.getElementById('score-x').innerText = '0';
        document.getElementById('score-o').innerText = '0';
    }
}

// Initialize the game
createBoard();
initGame();
status.innerText = `Current player: ${currentPlayer}`;

// Set initial player labels based on default game mode
if (vsComputer) {
    document.getElementById('player-x-label').innerText = 'You (X)';
    document.getElementById('player-o-label').innerText = 'Computer (O)';
    document.getElementById('score-x').innerText = scoreXvsCom;
    document.getElementById('score-o').innerText = scoreOvsCom;
} else {
    document.getElementById('player-x-label').innerText = 'Player X';
    document.getElementById('player-o-label').innerText = 'Player O';
    document.getElementById('score-x').innerText = scoreXvsPlayer;
    document.getElementById('score-o').innerText = scoreOvsPlayer;
} 