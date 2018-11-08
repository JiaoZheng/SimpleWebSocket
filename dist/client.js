"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const webSocket = require("ws");
const ws = new webSocket('ws://127.0.0.1:8080');
ws.on('open', () => {
    ws.send(JSON.stringify({
        type: 'login',
        nickName: 'hello world',
        whatthefuck: 'whatthefuck'
    }));
});
ws.on('message', (data) => {
    console.log(data);
});
