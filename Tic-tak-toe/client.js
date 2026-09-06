const net = require('node:net');

const client = net.createConnection({
  host: 'localhost',
  port: 3000,
});

let buffer = '';
let mySymbol = null;
let myTurn = false;

client.on('connect', () => {
  console.log('Connected to server');

  process.stdin.resume();
  process.stdin.setEncoding('utf8');
});

client.on('data', (data) => {
  buffer += data.toString();
  let index = buffer.indexOf('\n');

  while (index !== -1) {
    const message = buffer.slice(0, index);
    buffer = buffer.slice(index + 1);
    const [command, value] = message.split('|');

    switch (command) {
      case 'SYMBOL':
        mySymbol = value;
        console.log(`You are playing as ${mySymbol}`);
        break;

      case 'BOARD': {
        const board = value.split(',');
        drawBoard(board);
        break;
      }

      case 'TURN':
        if (value === mySymbol) {
          myTurn = true;
          console.log('Your turn. Enter a position (0-8):');
        } else {
          myTurn = false;
          console.log('Waiting for opponent...');
        }
        break;

      case 'REJECTED':
        console.log(`Rejected: ${value}`);

        if (value === 'not your turn') {
          myTurn = false;
        }

        if (
          (value === 'invalid position' || value === 'position is occupied') &&
          myTurn
        ) {
          console.log('Try again. Enter a position (0-8):');
        }
        break;

      case 'WIN':
        myTurn = false;
        console.log(value === mySymbol ? 'You win!' : 'You lose!');
        break;

      case 'DRAW':
        myTurn = false;
        console.log('Draw!');
        break;

      case 'OPPONENT_LEFT':
        myTurn = false;
        console.log('Opponent left.');
        client.end();
        break;

      default:
        // Plain-text notices that aren't part of the COMMAND|value
        // protocol (e.g. "server is full", "waiting for opponent...")
        // - just show them as-is.
        console.log(message);
    }

    index = buffer.indexOf('\n');
  }
});

process.stdin.on('data', (data) => {
  const message = data.toString().trim();

  if (!myTurn) {
    return;
  }

  client.write(`MOVE|${message}\n`);
});

function drawBoard(board) {
  board = board.map((position) => {
    return position === '_' ? '.' : position;
  });

  console.log(` ${board[0]} | ${board[1]} | ${board[2]} `);
  console.log('-----------');
  console.log(` ${board[3]} | ${board[4]} | ${board[5]} `);
  console.log('-----------');
  console.log(` ${board[6]} | ${board[7]} | ${board[8]} `);
}

client.on('close', () => {
  console.log('Disconnected from server');
  process.exit(0);
});

client.on('error', (err) => {
  console.log(err.message);
});