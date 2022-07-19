const net = require('net');
const PORT = 8124;
const HOST = "localhost";

const users = {};

const server = net.createServer(connection => {
    connection.setEncoding('utf8');

    const userIndex = connection.remoteAddress + ":" + connection.remotePort;
    users[userIndex] = {connection};

    connection.on('data', d => {
        const req = JSON.parse(d.toString());
        switch (req.status) {
            case "login":
                users[userIndex].name = req.name;
                for (const userKey in users) {
                    if (userKey === connection.remoteAddress + ":" + connection.remotePort) continue;
                    users[userKey].connection.write(JSON.stringify({message: `User ${req.name} joined the chat`}))
                }
                break;
            case "message":
                for (const userKey in users) {
                    if (userKey === connection.remoteAddress + ":" + connection.remotePort) continue;
                    users[userKey].connection.write(JSON.stringify({message: req.message, byUser: users[userIndex].name}))
                }
                break;
            default:
                connection.write('Request status is not defined');
        }
    })

    connection.on('close', () => {
        const userName = users[userIndex].name;
        delete users[userIndex];
        for (const userKey in users) {
            users[userKey].connection.write(JSON.stringify({message: `User ${userName} left the chat`}))
        }
    })
}).listen(PORT, HOST);

server.on('listening', () => {
    const serverAddress = server.address();
    console.log(`wss://${serverAddress.address}:${serverAddress.port}`);
});