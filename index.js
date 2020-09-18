const midi = require('midi');
const NanoEvents = require('nanoevents');

const emitter = new NanoEvents();
const input = new midi.input();
const output = new midi.output();

let connected = false;
let bufferedMessage = [0, 0, 0];

function attemptConnection() {
  if (connected) {
    return;
  }

  const count = input.getPortCount();
  for (let i = 0; i < count; i++) {
    console.log(input.getPortName(i));
    if (input.getPortName(i) === "X-Touch 28:0") {
      input.openPort(i);
      emitter.emit("connectionStateChange", true) // TODO figure out how to emit when we lose connection
      connected = true;
      return;
    }
  }

  console.log("Unable to detect X-Touch")
}

input.ignoreTypes(false, false, false);

function isFirstOfDoubleMessage(data1) {
  return data1 === 15 || data1 < 8;
}

function isSingleMessage(data1, data2) {
  return data1 > 64 || data1 === 13;
}

function type(data2) {
  const LOOKUP = {1: "select", 2: "mute", 3: "solo", 7: "record", 0: "touch"}
  return LOOKUP[data2 >= 64 ? data2 - 64 : data2]
}

function ingestMessage(message) {
  const [status, data1, data2] = message;

  // All xtouch midi should have status 176
  if (status !== 176) {
    return { type: "invalid", message }
  }

  // Check for single message (encoders)
  // Channel strip encoder
  if (data1 >= 64 && data1 <= 71) {
    return { type: "channelEncoder", channel: data1 - 63, ticksRotated: data2 > 64 ? data2 - 64 : -data2 }
  }
  // Jog encoder
  if (data1 === 13) {
    return { type: "jogEncoder", ticksRotated: data2 > 64 ? data2 - 64 : -data2 }
  }

  // Check for firsts of double messages
  if (isFirstOfDoubleMessage(data1, data2)) {
    bufferedMessage = message;
    return null;
  }

  // Handle double messages
  // Button Presses
  if (bufferedMessage[1] === 15 && message[1] === 47) { 
    const isPressed = message[2] >= 64;
    if (bufferedMessage[2] < 8) {
      return { type: "button", isPressed, buttonType: type(message[2]), channel: bufferedMessage[2] + 1}
    }
  }
  if (bufferedMessage[1] < 8) {
    return { type: "fader position", channel: bufferedMessage[1] + 1, position: (127 * bufferedMessage[2]) + message[2] }
  }
  return { type: "unknown", message }
}

input.on('message', function(deltaTime, message) {
  emitter.emit('rawMessage', {deltaTime, message});
  const parsedMessage = ingestMessage(message);
  if (parsedMessage) {
    emitter.emit('message', parsedMessage);
  }
})

module.exports = {
  autoconnect: () => setInterval(attemptConnection, 100),
  isConnected: () => connected,
  on: emitter.on.bind(emitter)
}
