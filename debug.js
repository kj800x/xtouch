const xtouch = require("./index");

xtouch.on('connectionStateChange', (value) => console.log("Connected: " + value));
xtouch.on('message', (message) => console.log(message));

xtouch.autoconnect();