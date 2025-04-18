const socket = io();
let playerId = null;
let board = Array(15).fill(null).map(() => Array(15).fill(null));
let turn = 0;
let selectedState = '|0>';
let moveMadeThisTurn = false;
let firstMove = false;

socket.on('playerId', (data) => {
    playerId = data.id;
    turn = data.turn;
    if (playerId === 0) firstMove = true;

    setTimeout(() => {
        alert(playerId === 0 ? 'You are Player A (black)' : 'You are Player B (white)');
        updatePlayerTurnDisplay();
        draw();
    }, 100);
});

socket.on('updateBoard', (data) => {
    board = data.board;
    turn = data.turn;
    moveMadeThisTurn = false;
    updatePlayerTurnDisplay();
    draw();
});

socket.on('restart', () => {
    board = Array(15).fill(null).map(() => Array(15).fill(null));
    turn = 0;
    moveMadeThisTurn = false;
    firstMove = (playerId === 0);
    removeWinOverlay();
    updatePlayerTurnDisplay();
    draw();
});

socket.on('win', (data) => {
    showWinAnimation(data.winner);
});

const canvas = document.createElement('canvas');
canvas.width = 560;
canvas.height = 560;
document.getElementById('game').appendChild(canvas);
const ctx = canvas.getContext('2d');

canvas.addEventListener('click', (e) => {
    if (playerId !== turn || moveMadeThisTurn) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const j = Math.round(x / 40);
    const i = Math.round(y / 40);

    if (i >= 0 && i < 15 && j >= 0 && j < 15) {
        if (board[i][j] === null) {
            if (firstMove) {
                if (playerId !== 0) {
                    alert("First move must be made by Player A!");
                    return;
                }
                firstMove = false;
            }
            socket.emit('move', { i, j, state: selectedState });
            moveMadeThisTurn = true;
        }
    }
});

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#f0d9b5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#000';
    for (let i = 0; i < 15; i++) {
        ctx.beginPath();
        ctx.moveTo(0, i * 40);
        ctx.lineTo(560, i * 40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(i * 40, 0);
        ctx.lineTo(i * 40, 560);
        ctx.stroke();
    }

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const stone = board[i][j];
            if (stone) {
                let color = stone.color || (stone.owner === 0 ? 'black' : 'white');
                ctx.beginPath();
                ctx.arc(j * 40, i * 40, 10, 0, 2 * Math.PI);
                ctx.fillStyle = color;
                ctx.fill();
                ctx.fillStyle = (color === 'black') ? 'white' : 'black';
                ctx.font = '14px Arial';
                ctx.fillText(stone.state, j * 40 - 6, i * 40 + 5);
            }
        }
    }
}

function selectState(state) {
    if (playerId !== turn || moveMadeThisTurn) return;
    selectedState = state;
}

function measure(basis) {
    if (playerId !== turn || moveMadeThisTurn) return;
    socket.emit('measure', basis);
    moveMadeThisTurn = true;
}

function restart() {
    socket.emit('restart');
}

function updatePlayerTurnDisplay() {
    const display = document.getElementById('player-turn');
    display.innerText = (turn === 0) ? 'Now Playing: Player A' : 'Now Playing: Player B';
}

function showWinAnimation(winnerColor) {
    const overlay = document.createElement('div');
    overlay.id = 'win-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = 0;
    overlay.style.left = 0;
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0,0,0,0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = 9999;
    overlay.style.fontSize = '48px';
    overlay.style.color = 'white';
    overlay.style.animation = 'fadeIn 1s ease forwards';

    if (winnerColor === 'black') {
        overlay.innerText = 'Player A Wins!';
    } else {
        overlay.innerText = 'Player B Wins!';
    }

    document.body.appendChild(overlay);

    overlay.addEventListener('click', () => {
        overlay.remove();
    });
}

function removeWinOverlay() {
    const existingOverlay = document.getElementById('win-overlay');
    if (existingOverlay) {
        existingOverlay.remove();
    }
}
