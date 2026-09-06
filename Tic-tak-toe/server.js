const net = require('node:net');

const board = Array(9).fill('_');
const players = [];

let turn = 'X';
let gameOver = false;

const server = net.createServer((socket) => {
  let buffer = '';

  if (players.length === 0) {
    players.push({
      socket: socket,
      symbol: 'X',
    });

    socket.username = 'X';
    socket.write('SYMBOL|X\n');
    socket.write('waiting for opponent...\n');
    console.log('Client connected');
  } else if (players.length === 1) {
    players.push({
      socket: socket,
      symbol: 'O',
    });

    socket.username = 'O';
    socket.write('SYMBOL|O\n');
    console.log('Client connected!');
    broadcast(`BOARD|${board.join(',')}\n`);
    broadcast('TURN|X\n');
  } else {
    socket.write('server is full\n');
    socket.end();
    console.log('Client connection rejected!');
    return;
  }

  socket.on('data', (data) => {
    buffer += data.toString();
    let index = buffer.indexOf('\n');

    while (index !== -1) {
      const message = buffer.slice(0, index);
      buffer = buffer.slice(index + 1);
      const [command, value] = message.split('|');

      if (command !== 'MOVE' || gameOver) {
        index = buffer.indexOf('\n');
        continue;
      }

      if (turn !== socket.username) {
        socket.write('REJECTED|not your turn\n');
        index = buffer.indexOf('\n');
        continue;
      }

      const position = Number(value);

      if (!Number.isInteger(position) || position < 0 || position > 8) {
        socket.write('REJECTED|invalid position\n');
        index = buffer.indexOf('\n');
        continue;
      }

      if (board[position] !== '_') {
        socket.write('REJECTED|position is occupied\n');
        index = buffer.indexOf('\n');
        continue;
      }

      board[position] = socket.username;
      const winner = checkWinner();

      if (winner) {
        gameOver = true;
        broadcast(`BOARD|${board.join(',')}\n`);
        broadcast(`WIN|${winner}\n`);
        for (const player of players) {
          player.socket.end();
        }

        return;
      }

      if (!board.includes('_')) {
        gameOver = true;
        broadcast(`BOARD|${board.join(',')}\n`);
        broadcast('DRAW\n');

        for (const player of players) {
          player.socket.end();
        }

        return;
      }

      turn = turn === 'X' ? 'O' : 'X';
      broadcast(`BOARD|${board.join(',')}\n`);
      broadcast(`TURN|${turn}\n`);
      index = buffer.indexOf('\n');
    }
  });

  socket.on('close', () => {
    console.log(`Client ${socket.username} disconnected`);
    const playerIndex = players.findIndex((player) => player.socket === socket);

    if (playerIndex !== -1) {
      players.splice(playerIndex, 1);
    }

    // Only notify the remaining player if this was an *unexpected*
    // disconnect during an active game - not a socket closing because
    // the game already ended normally (WIN/DRAW already set gameOver).
    if (!gameOver) {
      for (const player of players) {
        if (!player.socket.destroyed) {
          player.socket.write('OPPONENT_LEFT\n');
          player.socket.end();
        }
      }
    }

    // Only reset shared game state once BOTH sockets have actually
    // closed - resetting on the first close would corrupt the second
    // close's view of `gameOver` and `players`.
    if (players.length === 0) {
      board.fill('_');
      turn = 'X';
      gameOver = false;
    }
  });

  socket.on('error', (err) => {
    console.log(`Socket error: ${err.message}`);
  });
});

server.listen(3000, () => {
  console.log('Server listening on 3000');
});

function checkWinner() {
  const wins = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];

  for (const [a, b, c] of wins) {
    if (board[a] !== '_' && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function broadcast(message) {
  for (const player of players) {
    player.socket.write(message);
  }
}