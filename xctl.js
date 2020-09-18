const midi = require('midi');

const input = new midi.input();
const output = new midi.output();

let connectedIn = false;
let connectedOut = true;

output.openVirtualPort("xctl driver")

// function attemptInConnection() {
//   if (connectedIn) {
//     return;
//   }

//   const count = input.getPortCount();
//   for (let i = 0; i < count; i++) {
//     if (input.getPortName(i) === "X-Touch 28:0") {
//       input.openPort(i);
//       console.log("Connected In")
//       connectedIn = true;
//       return;
//     }
//   }
// }

// function attemptOutConnection() {
//   if (connectedOut) {
//     return;
//   }

//   const count = output.getPortCount();
//   for (let i = 0; i < count; i++) {
//     if (output.getPortName(i) === "X-Touch 28:0") {
//       output.openPort(i);
//       console.log("Connected Out")
//       connectedOut = true;
//       return;
//     }
//   }
// }

function attemptConnection() {
  // attemptInConnection();
  // attemptOutConnection();
}

function heartbeat() {
  if (connectedOut) {
    console.log("sending heartbeat")
    output.sendMessage([0x00, 0xF0, 0x00, 0x00, 0x66, 0x14, 0x00, 0xF7])
  }
}

setInterval(attemptConnection, 100)
setInterval(heartbeat, 1000)