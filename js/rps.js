// Separate scores for each game mode
let playerScoreVsCom = 0;
let computerScoreVsCom = 0;
let tieScoreVsCom = 0;

let playerScoreVsHuman = 0;
let player2ScoreVsHuman = 0;
let tieScoreVsHuman = 0;

let vsComputer = true;
let player2Choice = null;
let waitingForPlayer2 = false;

function initGame() {
    // Create scoreboard if it doesn't exist
    if (!document.querySelector('.score-board')) {
        const scoreBoard = document.createElement('div');
        scoreBoard.classList.add('score-board');
        scoreBoard.innerHTML = `
            <div class="player player-score">
                <span id="player1-label">You</span>
                <span id="player-score">0</span>
            </div>
            <div class="player tie-score">
                <span>Ties</span>
                <span id="tie-score">0</span>
            </div>
            <div class="player computer-score">
                <span id="player2-label">Computer</span>
                <span id="computer-score">0</span>
            </div>
        `;
        const gameArea = document.querySelector('.game-area');
        gameArea.insertBefore(scoreBoard, document.querySelector('.choices'));
        
        // Add game mode selection
        const gameModeSelect = document.createElement('div');
        gameModeSelect.classList.add('game-mode');
        gameModeSelect.innerHTML = `
            <h3>Game Mode</h3>
            <div class="mode-selection">
                <button id="vs-computer" class="mode-btn active">vs Computer</button>
                <button id="vs-player" class="mode-btn">2 Players</button>
            </div>
        `;
        gameArea.insertBefore(gameModeSelect, document.querySelector('.choices'));
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.innerText = 'Reset Scores';
        resetButton.classList.add('secondary-btn');
        resetButton.onclick = resetScores;
        gameArea.appendChild(resetButton);
        
        // Add event listeners for mode selection
        document.getElementById('vs-computer').addEventListener('click', () => {
            if (vsComputer) return; // Already in this mode
            
            vsComputer = true;
            document.getElementById('vs-computer').classList.add('active');
            document.getElementById('vs-player').classList.remove('active');
            document.getElementById('player1-label').innerText = 'You';
            document.getElementById('player2-label').innerText = 'Computer';
            
            // Update scores for computer mode
            document.getElementById('player-score').innerText = playerScoreVsCom;
            document.getElementById('computer-score').innerText = computerScoreVsCom;
            document.getElementById('tie-score').innerText = tieScoreVsCom;
            
            resetGameState();
        });
        
        document.getElementById('vs-player').addEventListener('click', () => {
            if (!vsComputer) return; // Already in this mode
            
            vsComputer = false;
            document.getElementById('vs-player').classList.add('active');
            document.getElementById('vs-computer').classList.remove('active');
            document.getElementById('player1-label').innerText = 'Player 1';
            document.getElementById('player2-label').innerText = 'Player 2';
            
            // Update scores for player vs player mode
            document.getElementById('player-score').innerText = playerScoreVsHuman;
            document.getElementById('computer-score').innerText = player2ScoreVsHuman;
            document.getElementById('tie-score').innerText = tieScoreVsHuman;
            
            resetGameState();
        });
        
        // Add player 2 controls (hidden by default)
        const player2Controls = document.createElement('div');
        player2Controls.classList.add('player2-controls');
        player2Controls.style.display = 'none';
        player2Controls.innerHTML = `
            <h3>Player 2's turn</h3>
            <div class="choices player2-choices">
                <button onclick="makePlayer2Choice('rock')"><img src="img/rock.png" alt="Rock"></button>
                <button onclick="makePlayer2Choice('paper')"><img src="img/paper.png" alt="Paper"></button>
                <button onclick="makePlayer2Choice('scissors')"><img src="img/scissors.png" alt="Scissors"></button>
            </div>
        `;
        gameArea.appendChild(player2Controls);
    }
}

function play(userChoice) {
    if (waitingForPlayer2 && vsComputer === false) {
        return; // Wait for player 2
    }
    
    // Ensure game elements exist
    initGame();
    
    if (vsComputer) {
        playVsComputer(userChoice);
    } else {
        playVsHuman(userChoice);
    }
}

function playVsComputer(userChoice) {
    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * 3)];
    
    determineWinner(userChoice, computerChoice);
}

function playVsHuman(userChoice) {
    // Store player 1's choice explicitly
    window.player1Selection = userChoice;
    
    // Briefly highlight player 1's choice (just visual feedback for player 1)
    const buttons = document.querySelectorAll('.choices button');
    buttons.forEach(button => {
        const buttonChoice = button.querySelector('img').alt.toLowerCase();
        if (buttonChoice === userChoice) {
            button.classList.add('selected');
            // Remove the highlight after a very brief moment
            setTimeout(() => {
                button.classList.remove('selected');
                
                // Only after removing the highlight, proceed to hide player 1 controls
                // and show player 2 controls
                showPlayer2Controls();
            }, 300);
        }
    });
}

function showPlayer2Controls() {
    // Hide player 1 controls
    document.querySelector('.choices').style.display = 'none';
    
    // Show player 2 controls
    document.querySelector('.player2-controls').style.display = 'block';
    
    // Clear previous result
    document.getElementById('result').innerText = 'Waiting for Player 2...';
    document.getElementById('result').className = '';
    
    waitingForPlayer2 = true;
    player2Choice = null;
}

function makePlayer2Choice(choice) {
    if (!waitingForPlayer2) return;
    
    player2Choice = choice;
    waitingForPlayer2 = false;
    
    // Hide player 2 controls
    document.querySelector('.player2-controls').style.display = 'none';
    
    // Show player 1 controls
    document.querySelector('.choices').style.display = 'flex';
    
    // Remove the selection highlight from player 1's choice
    document.querySelectorAll('.choices button').forEach(button => {
        button.classList.remove('selected');
    });
    
    // Use the stored player 1 choice instead of trying to detect it
    determineWinner(window.player1Selection, player2Choice);
}

function getPlayer1ChoiceFromAnimation() {
    // This function is no longer used but kept for reference
    const selectedButton = document.querySelector('.choices button.selected');
    if (selectedButton) {
        return selectedButton.querySelector('img').alt.toLowerCase();
    }
    return 'rock'; // Default if not found
}

function determineWinner(player1Choice, player2Choice) {
    let result = '';
    
    animateChoice(player1Choice, player2Choice);
    
    if (player1Choice === player2Choice) {
        result = "It's a tie!";
        document.getElementById('result').className = 'tie';
        
        if (vsComputer) {
            tieScoreVsCom++;
            document.getElementById('tie-score').innerText = tieScoreVsCom;
        } else {
            tieScoreVsHuman++;
            document.getElementById('tie-score').innerText = tieScoreVsHuman;
        }
    } else if (
        (player1Choice === 'rock' && player2Choice === 'scissors') ||
        (player1Choice === 'paper' && player2Choice === 'rock') ||
        (player1Choice === 'scissors' && player2Choice === 'paper')
    ) {
        result = vsComputer ? "You win!" : "Player 1 wins!";
        document.getElementById('result').className = 'win';
        
        if (vsComputer) {
            playerScoreVsCom++;
            document.getElementById('player-score').innerText = playerScoreVsCom;
        } else {
            playerScoreVsHuman++;
            document.getElementById('player-score').innerText = playerScoreVsHuman;
        }
    } else {
        result = vsComputer ? "You lose!" : "Player 2 wins!";
        document.getElementById('result').className = 'lose';
        
        if (vsComputer) {
            computerScoreVsCom++;
            document.getElementById('computer-score').innerText = computerScoreVsCom;
        } else {
            player2ScoreVsHuman++;
            document.getElementById('computer-score').innerText = player2ScoreVsHuman;
        }
    }

    document.getElementById('result').innerText = `${vsComputer ? 'You' : 'Player 1'} chose ${player1Choice}, ${vsComputer ? 'computer' : 'Player 2'} chose ${player2Choice}. ${result}`;
}

function animateChoice(player1Choice, player2Choice) {
    // In computer mode, highlight the user's choice only
    if (vsComputer) {
        const buttons = document.querySelectorAll('.choices button');
        buttons.forEach(button => {
            if (button.querySelector('img').alt.toLowerCase() === player1Choice) {
                button.classList.add('selected');
                setTimeout(() => button.classList.remove('selected'), 1000);
            }
        });
    } 
    // In two-player mode, show both choices after the round
    else {
        // Display both choices with visual indicators
        const result = document.getElementById('result');
        
        // Create or update choice display
        let choiceDisplay = document.querySelector('.choice-display');
        if (!choiceDisplay) {
            choiceDisplay = document.createElement('div');
            choiceDisplay.className = 'choice-display';
            result.parentNode.insertBefore(choiceDisplay, result);
        }
        
        // Show player choices with images
        choiceDisplay.innerHTML = `
            <div class="player-choice">
                <div class="choice-label">Player 1</div>
                <div class="choice-img ${player1Choice}">
                    <img src="img/${player1Choice}.png" alt="${player1Choice}">
                </div>
            </div>
            <div class="vs">VS</div>
            <div class="player-choice">
                <div class="choice-label">Player 2</div>
                <div class="choice-img ${player2Choice}">
                    <img src="img/${player2Choice}.png" alt="${player2Choice}">
                </div>
            </div>
        `;
        
        // Animate the choice display
        choiceDisplay.classList.add('animated');
        setTimeout(() => choiceDisplay.classList.remove('animated'), 1000);
    }
}

function resetScores() {
    if (vsComputer) {
        playerScoreVsCom = 0;
        computerScoreVsCom = 0;
        tieScoreVsCom = 0;
        document.getElementById('player-score').innerText = '0';
        document.getElementById('computer-score').innerText = '0';
        document.getElementById('tie-score').innerText = '0';
    } else {
        playerScoreVsHuman = 0;
        player2ScoreVsHuman = 0;
        tieScoreVsHuman = 0;
        document.getElementById('player-score').innerText = '0';
        document.getElementById('computer-score').innerText = '0';
        document.getElementById('tie-score').innerText = '0';
    }
    
    document.getElementById('result').innerText = '';
    document.getElementById('result').className = '';
    resetGameState();
}

function resetGameState() {
    waitingForPlayer2 = false;
    player2Choice = null;
    window.player1Selection = null;
    
    // Clear choice display if it exists
    const choiceDisplay = document.querySelector('.choice-display');
    if (choiceDisplay) {
        choiceDisplay.innerHTML = '';
    }
    
    // Show player 1 controls
    if (document.querySelector('.choices')) {
        document.querySelector('.choices').style.display = 'flex';
    }
    
    // Hide player 2 controls
    if (document.querySelector('.player2-controls')) {
        document.querySelector('.player2-controls').style.display = 'none';
    }
    
    document.getElementById('result').innerText = '';
}

// Initialize game on page load
document.addEventListener('DOMContentLoaded', function() {
    initGame();
    
    // Set initial scores based on default game mode
    if (vsComputer) {
        document.getElementById('player-score').innerText = playerScoreVsCom;
        document.getElementById('computer-score').innerText = computerScoreVsCom;
        document.getElementById('tie-score').innerText = tieScoreVsCom;
    } else {
        document.getElementById('player-score').innerText = playerScoreVsHuman;
        document.getElementById('computer-score').innerText = player2ScoreVsHuman;
        document.getElementById('tie-score').innerText = tieScoreVsHuman;
    }
}); 