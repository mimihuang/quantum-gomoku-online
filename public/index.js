let socket;
let playerId = null;
let board = Array(15).fill(null).map(() => Array(15).fill(null));
let turn = 0;
let selectedState = '|0>';
let moveMadeThisTurn = false;
let firstMove = false;

function joinRoom() {
    const roomKey = document.getElementById('room-key').value.trim();
    if (!roomKey) {
        alert("Please enter a room key!");
        return;
    }

    socket = io();
    socket.emit('joinRoom', roomKey);

    socket.on('playerId', (data) => {
        playerId = data.id;
        turn = data.turn;
        if (playerId === 0) firstMove = true;

        document.getElementById('room-setup').style.display = 'none';
        document.getElementById('controls').style.display = 'flex';

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

    socket.on('full', () => {
        alert('Room is full! Please use another key.');
    });
}

// 下面的 canvas、draw、selectState、measure、restart、updatePlayerTurnDisplay、showWinAnimation、removeWinOverlay 都保持跟原本一樣（不用改）
