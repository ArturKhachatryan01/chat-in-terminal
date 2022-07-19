const net = require('net');
const readline = require('readline');
const user = {};

//Terminal interface
const terminal = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false,
})

//Create client
const client = net.createConnection(clientOptions = {
    host: 'localhost',
    port: 8124
}).setEncoding('utf8');

terminal.question('Your name: ', (name) => {
    user.name = name;
    terminal.setPrompt(`${name} >> `);
    client.write(JSON.stringify({status: 'login', name: user.name}));
    terminal.prompt();
    client.on('data', d => {
        readline.clearLine(process.stdout, -1);
        readline.cursorTo(process.stdout,0);
        const data = JSON.parse(d);
        if (data.message) {
            if (data.byUser) console.log(`${data.byUser} >> ${data.message}`);
            else console.log(data.message);
        }
        terminal.prompt();
    })

    terminal.on('line', d => {
        client.write(JSON.stringify({status: 'message', message: d}))
        terminal.prompt();
    })
})