const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static('public'));

const rooms = {}; // 用來存所有房間資料

io.on('connection', (socket) => {
    socket.on('joinRoom', (roomKey) => {
        socket.roomKey = roomKey;

        if (!rooms[roomKey]) {
            rooms[roomKey] = {
                players: [],
                board: Array(15).fill(null).map(() => Array(15).fill(null)),
                turn: 0
            };
        }

        const room = rooms[roomKey];

        if (room.players.length >= 2) {
            socket.emit('full');
            return;
        }

        socket.playerId = room.players.length;
        room.players.push(socket.id);

        socket.join(roomKey);

        socket.emit('playerId', { id: socket.playerId, turn: room.turn });
        io.to(roomKey).emit('updateBoard', { board: room.board, turn: room.turn });

        socket.on('move', ({ i, j, state }) => {
            if (room.board[i][j] === null) {
                room.board[i][j] = {
                    owner: socket.playerId,
                    state: mapState(state),
                    measured: false,
                    color: null
                };
                room.turn = 1 - room.turn;
                io.to(roomKey).emit('updateBoard', { board: room.board, turn: room.turn });
            }
        });

        socket.on('measure', (basis) => {
            for (let i = 0; i < 15; i++) {
                for (let j = 0; j < 15; j++) {
                    const stone = room.board[i][j];
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

            room.turn = 1 - room.turn;

            const winnerColor = checkWin(room.board);
            if (winnerColor) {
                io.to(roomKey).emit('win', { winner: winnerColor });
            }

            io.to(roomKey).emit('updateBoard', { board: room.board, turn: room.turn });
        });

        socket.on('restart', () => {
            room.board = Array(15).fill(null).map(() => Array(15).fill(null));
            room.turn = 0;
            io.to(roomKey).emit('restart');
            io.to(roomKey).emit('updateBoard', { board: room.board, turn: room.turn });
        });

        socket.on('disconnect', () => {
            if (rooms[roomKey]) {
                room.players = room.players.filter(id => id !== socket.id);
                if (room.players.length === 0) {
                    delete rooms[roomKey];
                }
            }
        });
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
        [0, 1], [1, 0], [1, 1], [1, -1]
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
                        return stone.color;
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
