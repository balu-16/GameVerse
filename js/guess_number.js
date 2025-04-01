let randomNumber = Math.floor(Math.random() * 100) + 1;
let attempts = 0;
let bestScore = localStorage.getItem('guessNumberBestScore') || 0;

function initScoreboard() {
    // Create best score display if it doesn't exist
    if (!document.querySelector('.best-score')) {
        const bestScoreDisplay = document.createElement('div');
        bestScoreDisplay.classList.add('best-score');
        bestScoreDisplay.innerHTML = `
            <p>Best Score: <span id="best-score">${bestScore || 'N/A'}</span> attempts</p>
        `;
        
        const gameArea = document.querySelector('.game-area');
        gameArea.insertBefore(bestScoreDisplay, document.querySelector('p:first-child'));
        
        // Add reset button
        const resetButton = document.createElement('button');
        resetButton.innerText = 'New Game';
        resetButton.classList.add('secondary-btn');
        resetButton.onclick = resetGame;
        gameArea.appendChild(resetButton);
    }
}

function checkGuess() {
    const userGuess = Number(document.getElementById('guess').value);
    
    if (isNaN(userGuess) || userGuess < 1 || userGuess > 100) {
        document.getElementById('feedback').innerText = 'Please enter a valid number between 1 and 100.';
        document.getElementById('feedback').className = '';
        return;
    }
    
    attempts++;
    let feedback = '';

    if (userGuess === randomNumber) {
        feedback = `Correct! You guessed the number in ${attempts} attempts.`;
        document.getElementById('feedback').classList.add('win');
        
        // Update best score
        if (bestScore === 0 || attempts < bestScore) {
            bestScore = attempts;
            localStorage.setItem('guessNumberBestScore', bestScore);
            document.getElementById('best-score').innerText = bestScore;
            feedback += ' New best score!';
        }
        
        // Disable input
        document.getElementById('guess').disabled = true;
        document.querySelector('button').disabled = true;
    } else if (userGuess < randomNumber) {
        feedback = 'Too low! Try again.';
        document.getElementById('feedback').classList.remove('win');
    } else {
        feedback = 'Too high! Try again.';
        document.getElementById('feedback').classList.remove('win');
    }

    document.getElementById('feedback').innerText = feedback;
}

function resetGame() {
    randomNumber = Math.floor(Math.random() * 100) + 1;
    attempts = 0;
    document.getElementById('guess').value = '';
    document.getElementById('guess').disabled = false;
    document.querySelector('button').disabled = false;
    document.getElementById('feedback').innerText = '';
    document.getElementById('feedback').className = '';
}

// Add event listener to allow pressing Enter key
document.getElementById('guess').addEventListener('keyup', function(event) {
    if (event.key === 'Enter') {
        checkGuess();
    }
});

// Initialize scoreboard on page load
document.addEventListener('DOMContentLoaded', initScoreboard); 