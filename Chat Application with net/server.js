const net = require('net');
require('dotenv').config({ quiet: true });

const PORT = process.env.PORT;
const clients = new Map();

function broadCast(message, sender = null) {
    for (const [username, clientSocket] of clients) {
        if (clientSocket !== sender) {
            clientSocket.write(message + '\n');
        }
    }
}

const server = net.createServer((socket) => {
    let buffer = '';
    socket.write('Enter your username: ');

    socket.on('data', (data) => {
        buffer += data.toString();
        const messages = buffer.split('\n');
        buffer = messages.pop();

        for (const message of messages) {
            const cleanmsg = message.trim();

            if (!socket.username && !cleanmsg) {
                socket.write('Username cannot be empty. Enter your username:');
                continue;
            }

            if (!cleanmsg) {
                continue;
            }

            if (!socket.username) {
                if (clients.has(cleanmsg)) {
                    socket.write(`Username "${cleanmsg}" is already taken. Try another one:`);
                    continue;
                }

                socket.username = cleanmsg;
                clients.set(cleanmsg, socket);
                socket.write(`Welcome, ${socket.username}!\n`);
                console.log(`${socket.username} connected`);
                broadCast(`*** ${socket.username} joined ***`, socket);
                continue;
            }

            if (cleanmsg === '/who') {
                const usernames = [...clients.keys()];
                socket.write(`Connected users: ${usernames.join(', ')}\n`);
                continue;
            }

            if (cleanmsg.startsWith('/dm')) {
                const parts = cleanmsg.slice(3).trim().split(' ');

                if (parts.length < 2 || !parts[0]) {
                    socket.write('Usage: /dm <username> <message>\n');
                    continue;
                }

                const targetUsername = parts[0];
                const privateMessage = parts.slice(1).join(' ');

                if (!clients.has(targetUsername)) {
                    socket.write(`User "${targetUsername}" is not connected.\n`);
                    continue;
                }

                const targetSocket = clients.get(targetUsername);
                targetSocket.write(`[DM from ${socket.username}]: ${privateMessage}\n`);
                socket.write(`[you -> ${targetUsername}]: ${privateMessage}\n`);
                continue;
            }

            if (cleanmsg.startsWith('/')) {
                socket.write(`Unknown command: ${cleanmsg}\n`);
                socket.write('Available commands: /who, /dm <username> <message>\n');
                continue;
            }
            broadCast(`${socket.username}: ${cleanmsg}`, socket);
        }
    });

    socket.on('error', (err) => {
        console.log(`${socket.username || 'Unknown user'} socket error: ${err.message}`);
    });

    socket.on('close', () => {
        if (socket.username) {
            clients.delete(socket.username);
            broadCast(`*** ${socket.username} left ***`, socket);
            console.log(`${socket.username} disconnected`);
        }
    });
});

server.on('error', (err) => {
    console.error(`Server error: ${err.message}`);
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});