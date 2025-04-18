const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

let players = 0;
let board = Array(15).fill(null).map(() => Array(15).fill(null));
let turn = 0;

io.on('connection', (socket) => {
    if (players >= 2) {
        socket.emit('full');
        socket.disconnect();
        return;
    }

    socket.playerId = players;
    players++;

    socket.emit('playerId', { id: socket.playerId, turn: turn });
    io.emit('updateBoard', { board: board, turn: turn });

    socket.on('move', ({ i, j, state }) => {
        if (board[i][j] === null) {
            board[i][j] = {
                owner: socket.playerId,
                state: mapState(state),
                measured: false,
                color: null
            };
            turn = 1 - turn;
            io.emit('updateBoard', { board: board, turn: turn });
        }
    });

    socket.on('measure', (basis) => {
        for (let i = 0; i < 15; i++) {
            for (let j = 0; j < 15; j++) {
                const stone = board[i][j];
                if (stone && !stone.measured) {
                    if (basis === 'standard') {
                        if (stone.state === '+' || stone.state === '-') {
                            stone.state = Math.random() < 0.5 ? '0' : '1';
                        }
                    } else if (basis === 'hadamard') {
                        if (stone.state === '0' || stone.state === '1') {
                            stone.state = Math.random() < 0.5 ? '+' : '-';
                        }
                    }

                    if (stone.state === '0' || stone.state === '+') {
                        stone.color = 'black';
                    } else {
                        stone.color = 'white';
                    }
                    stone.measured = true;
                }
            }
        }

        turn = 1 - turn;

        const winnerColor = checkWin(board);
        if (winnerColor) {
            io.emit('win', { winner: winnerColor });
        }

        io.emit('updateBoard', { board: board, turn: turn });
    });

    socket.on('restart', () => {
        board = Array(15).fill(null).map(() => Array(15).fill(null));
        turn = 0;
        io.emit('restart');
        io.emit('updateBoard', { board: board, turn: turn });
    });

    socket.on('disconnect', () => {
        players--;
        if (players <= 0) {
            board = Array(15).fill(null).map(() => Array(15).fill(null));
            turn = 0;
        }
    });
});

function mapState(state) {
    if (state === '|0>') return '0';
    if (state === '|1>') return '1';
    if (state === '|+>') return '+';
    if (state === '|->') return '-';
    return state;
}

function checkWin(board) {
    const directions = [
        [0, 1],  // right
        [1, 0],  // down
        [1, 1],  // right+down
        [1, -1], // left+down
    ];

    for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
            const stone = board[i][j];
            if (!stone || !stone.color) continue;

            for (const [dx, dy] of directions) {
                let count = 1;
                let x = i + dx;
                let y = j + dy;
                while (x >= 0 && x < 15 && y >= 0 && y < 15 && board[x][y] && board[x][y].color === stone.color) {
                    count++;
                    if (count === 5) {
                        return stone.color; // 5 in a row
                    }
                    x += dx;
                    y += dy;
                }
            }
        }
    }
    return null;
}

http.listen(3000, () => {
    console.log('Server running at http://localhost:3000');
});
