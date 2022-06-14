import {
  queueMutable
} from "./chunk-3DWD5YJK.js";
import {
  string
} from "./chunk-EHDDJNDI.js";
import {
  StateMachine
} from "./chunk-B2FJRUWR.js";
import {
  continuously,
  retry,
  waitFor
} from "./chunk-LN3DFHLP.js";
import {
  indexOfCharCode,
  omitChars,
  splitByLength
} from "./chunk-IMPA6CRY.js";
import {
  SimpleEventEmitter
} from "./chunk-TIBI6QSU.js";
import {
  __export,
  __publicField
} from "./chunk-FQLUQVDZ.js";

// src/io/index.ts
var io_exports = {};
__export(io_exports, {
  Bluetooth: () => NordicBleDevice_exports,
  Camera: () => Camera_exports,
  Espruino: () => EspruinoDevice_exports,
  Serial: () => Serial_exports
});

// src/io/NordicBleDevice.ts
var NordicBleDevice_exports = {};
__export(NordicBleDevice_exports, {
  NordicBleDevice: () => NordicBleDevice,
  defaultOpts: () => defaultOpts
});

// src/io/Codec.ts
var Codec = class {
  constructor() {
    __publicField(this, "enc", new TextEncoder());
    __publicField(this, "dec", new TextDecoder(`utf-8`));
  }
  toBuffer(str) {
    return this.enc.encode(str);
  }
  fromBuffer(buffer) {
    return this.dec.decode(buffer);
  }
};

// src/io/StringReceiveBuffer.ts
var StringReceiveBuffer = class {
  constructor(onData, separator = `
`) {
    this.onData = onData;
    this.separator = separator;
    __publicField(this, "buffer", ``);
    __publicField(this, "stream");
  }
  clear() {
    this.buffer = ``;
  }
  writable() {
    if (this.stream === void 0)
      this.stream = this.createWritable();
    return this.stream;
  }
  createWritable() {
    const b = this;
    return new WritableStream({
      write(chunk) {
        b.add(chunk);
      },
      close() {
        b.clear();
      }
    });
  }
  addImpl(str) {
    const pos = str.indexOf(this.separator);
    if (pos < 0) {
      this.buffer += str;
      return ``;
    }
    const part = str.substring(0, pos);
    try {
      this.onData(this.buffer + part);
      str = str.substring(part.length + this.separator.length);
    } catch (ex) {
      console.warn(ex);
    }
    this.buffer = ``;
    return str;
  }
  add(str) {
    while (str.length > 0) {
      str = this.addImpl(str);
    }
  }
};

// src/io/StringWriteBuffer.ts
var StringWriteBuffer = class {
  constructor(onData, chunkSize = -1) {
    this.onData = onData;
    this.chunkSize = chunkSize;
    __publicField(this, "paused", false);
    __publicField(this, "queue");
    __publicField(this, "writer");
    __publicField(this, "intervalMs");
    __publicField(this, "stream");
    this.intervalMs = 10;
    this.queue = queueMutable();
    this.writer = continuously(() => this.onWrite(), this.intervalMs);
  }
  clear() {
    this.queue = queueMutable();
  }
  writable() {
    if (this.stream === void 0)
      this.stream = this.createWritable();
    return this.stream;
  }
  createWritable() {
    const b = this;
    return new WritableStream({
      write(chunk) {
        b.add(chunk);
      },
      close() {
        b.clear();
      }
    });
  }
  async onWrite() {
    if (this.queue.isEmpty) {
      return false;
    }
    if (this.paused) {
      console.warn(`WriteBuffer.onWrite: paused...`);
      return true;
    }
    const s = this.queue.dequeue();
    if (s === void 0)
      return false;
    await this.onData(s);
    return true;
  }
  add(str) {
    if (this.chunkSize > 0) {
      this.queue.enqueue(...splitByLength(str, this.chunkSize));
    } else {
      this.queue.enqueue(str);
    }
    this.writer.start();
  }
};

// src/io/BleDevice.ts
var BleDevice = class extends SimpleEventEmitter {
  constructor(device, config) {
    super();
    this.device = device;
    this.config = config;
    __publicField(this, "states");
    __publicField(this, "codec");
    __publicField(this, "rx");
    __publicField(this, "tx");
    __publicField(this, "gatt");
    __publicField(this, "verboseLogging", false);
    __publicField(this, "rxBuffer");
    __publicField(this, "txBuffer");
    this.verboseLogging = config.debug;
    this.txBuffer = new StringWriteBuffer(async (data) => {
      await this.writeInternal(data);
    }, config.chunkSize);
    this.rxBuffer = new StringReceiveBuffer((line) => {
      this.fireEvent(`data`, { data: line });
    });
    this.codec = new Codec();
    this.states = new StateMachine(`ready`, {
      ready: `connecting`,
      connecting: [`connected`, `closed`],
      connected: [`closed`],
      closed: `connecting`
    });
    this.states.addEventListener(`change`, (evt) => {
      this.fireEvent(`change`, evt);
      this.verbose(`${evt.priorState} -> ${evt.newState}`);
      if (evt.priorState === `connected`) {
        this.rxBuffer.clear();
        this.txBuffer.clear();
      }
    });
    device.addEventListener(`gattserverdisconnected`, () => {
      if (this.isClosed)
        return;
      this.verbose(`GATT server disconnected`);
      this.states.state = `closed`;
    });
    this.verbose(`ctor ${device.name} ${device.id}`);
  }
  get isConnected() {
    return this.states.state === `connected`;
  }
  get isClosed() {
    return this.states.state === `closed`;
  }
  write(txt) {
    if (this.states.state !== `connected`)
      throw new Error(`Cannot write while state is ${this.states.state}`);
    this.txBuffer.add(txt);
  }
  async writeInternal(txt) {
    this.verbose(`writeInternal ${txt}`);
    const tx = this.tx;
    if (tx === void 0)
      throw new Error(`Unexpectedly without tx characteristic`);
    try {
      await tx.writeValue(this.codec.toBuffer(txt));
    } catch (ex) {
      this.warn(ex);
    }
  }
  disconnect() {
    if (this.states.state !== `connected`)
      return;
    this.gatt?.disconnect();
  }
  async connect() {
    const attempts = this.config.connectAttempts ?? 3;
    this.states.state = `connecting`;
    this.verbose(`connect`);
    const gatt = this.device.gatt;
    if (gatt === void 0)
      throw new Error(`Gatt not available on device`);
    await retry(async () => {
      const server = await gatt.connect();
      this.verbose(`Getting primary service`);
      const service = await server.getPrimaryService(this.config.service);
      this.verbose(`Getting characteristics`);
      const rx = await service.getCharacteristic(this.config.rxGattCharacteristic);
      const tx = await service.getCharacteristic(this.config.txGattCharacteristic);
      rx.addEventListener(`characteristicvaluechanged`, (evt) => this.onRx(evt));
      this.rx = rx;
      this.tx = tx;
      this.gatt = gatt;
      this.states.state = `connected`;
      await rx.startNotifications();
    }, attempts, 200);
  }
  onRx(evt) {
    const rx = this.rx;
    if (rx === void 0)
      return;
    const view = evt.target.value;
    if (view === void 0)
      return;
    let str = this.codec.fromBuffer(view.buffer);
    const plzStop = indexOfCharCode(str, 19);
    const plzStart = indexOfCharCode(str, 17);
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      str = omitChars(str, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      str = omitChars(str, plzStop, 1);
      this.txBuffer.paused = true;
    }
    this.rxBuffer.add(str);
  }
  verbose(m) {
    if (this.verboseLogging)
      console.info(`${this.config.name} `, m);
  }
  log(m) {
    console.log(`${this.config.name} `, m);
  }
  warn(m) {
    console.warn(`${this.config.name} `, m);
  }
};

// src/io/NordicBleDevice.ts
var defaultOpts = {
  chunkSize: 20,
  service: `6e400001-b5a3-f393-e0a9-e50e24dcca9e`,
  txGattCharacteristic: `6e400002-b5a3-f393-e0a9-e50e24dcca9e`,
  rxGattCharacteristic: `6e400003-b5a3-f393-e0a9-e50e24dcca9e`,
  name: `NordicDevice`,
  connectAttempts: 5,
  debug: false
};
var NordicBleDevice = class extends BleDevice {
  constructor(device, opts = {}) {
    super(device, { ...defaultOpts, ...opts });
  }
};

// src/io/EspruinoDevice.ts
var EspruinoDevice_exports = {};
__export(EspruinoDevice_exports, {
  EspruinoDevice: () => EspruinoDevice,
  connect: () => connect,
  puck: () => puck
});
var EspruinoDevice = class extends NordicBleDevice {
  constructor(device, opts = {}) {
    super(device, opts);
    __publicField(this, "evalTimeoutMs");
    this.evalTimeoutMs = opts.evalTimeoutMs ?? 5 * 1e3;
  }
  async writeScript(code) {
    this.write(`reset();
`);
    this.write(`${code}
`);
  }
  async eval(code, opts = {}) {
    const timeoutMs = opts.timeoutMs ?? this.evalTimeoutMs;
    const assumeExclusive = opts.assumeExclusive ?? true;
    if (typeof code !== `string`)
      throw new Error(`code parameter should be a string`);
    return new Promise((resolve, reject) => {
      const id = string(5);
      const onData = (d) => {
        try {
          const dd = JSON.parse(d.data);
          if (`reply` in dd) {
            if (dd.reply === id) {
              done();
              if (`result` in dd) {
                resolve(dd.result);
              }
            } else {
              this.warn(`Expected reply ${id}, got ${dd.reply}`);
            }
          }
        } catch (ex) {
          if (assumeExclusive) {
            done(d.data);
          } else {
            this.warn(ex);
          }
        }
      };
      const onStateChange = (e) => {
        if (e.newState !== `connected`)
          done(`State changed to '${e.newState}', aborting`);
      };
      this.addEventListener(`data`, onData);
      this.addEventListener(`change`, onStateChange);
      const done = waitFor(timeoutMs, (reason) => {
        reject(reason);
      }, () => {
        this.removeEventListener(`data`, onData);
        this.removeEventListener(`change`, onStateChange);
      });
      this.write(`Bluetooth.println(JSON.stringify({reply:"${id}", result:JSON.stringify(${code})}))
`);
    });
  }
};
var puck = async (opts = {}) => {
  const name = opts.name ?? `Puck`;
  const debug = opts.debug ?? false;
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: `Puck.js` },
      { services: [defaultOpts.service] }
    ],
    optionalServices: [defaultOpts.service]
  });
  const d = new EspruinoDevice(device, { name, debug });
  await d.connect();
  return d;
};
var connect = async () => {
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      { namePrefix: `Puck.js` },
      { namePrefix: `Pixl.js` },
      { namePrefix: `MDBT42Q` },
      { namePrefix: `RuuviTag` },
      { namePrefix: `iTracker` },
      { namePrefix: `Thingy` },
      { namePrefix: `Espruino` },
      { services: [defaultOpts.service] }
    ],
    optionalServices: [defaultOpts.service]
  });
  const d = new EspruinoDevice(device, { name: `Espruino` });
  await d.connect();
  return d;
};

// src/io/Camera.ts
var Camera_exports = {};
__export(Camera_exports, {
  dumpDevices: () => dumpDevices,
  start: () => start
});
var dumpDevices = async (filterKind = `videoinput`) => {
  const devices = await navigator.mediaDevices.enumerateDevices();
  devices.forEach((d) => {
    if (d.kind !== filterKind)
      return;
    console.log(d.label);
    console.log(` Kind: ${d.kind}`);
    console.log(` Device id: ${d.deviceId}`);
  });
};
var start = async (constraints = {}) => {
  const videoEl = document.createElement(`VIDEO`);
  videoEl.style.display = `none`;
  document.body.appendChild(videoEl);
  let stopVideo = () => {
  };
  const dispose = () => {
    try {
      stopVideo();
    } catch {
    }
    videoEl.remove();
  };
  try {
    const r = await startWithVideoEl(videoEl, constraints);
    stopVideo = r.dispose;
  } catch (err) {
    console.error(err);
    dispose();
    return;
  }
  return { videoEl, dispose };
};
var startWithVideoEl = async (videoEl, constraints = {}) => {
  if (videoEl === void 0)
    throw new Error(`videoEl undefined`);
  if (videoEl === null)
    throw new Error(`videoEl null`);
  const facingMode = constraints.facingMode ?? `user`;
  const maxRes = constraints.max;
  const minRes = constraints.min;
  const c = {
    audio: false,
    video: {
      facingMode,
      width: {},
      height: {}
    }
  };
  if (maxRes) {
    c.video.width = {
      max: maxRes.width
    };
    c.video.height = {
      max: maxRes.height
    };
  }
  if (minRes) {
    c.video.width = {
      min: minRes.width
    };
    c.video.height = {
      min: minRes.height
    };
  }
  const dispose = () => {
    console.log(`Camera:dispose`);
    videoEl.pause();
    const t = stream.getTracks();
    t.forEach((track) => track.stop());
  };
  const stream = await navigator.mediaDevices.getUserMedia(c);
  videoEl.srcObject = stream;
  const ret = { videoEl, dispose };
  const p = new Promise((resolve, reject) => {
    videoEl.addEventListener(`loadedmetadata`, () => {
      videoEl.play().then(() => {
        resolve(ret);
      }).catch((ex) => {
        reject(ex);
      });
    });
  });
  return p;
};

// src/io/Serial.ts
var Serial_exports = {};
__export(Serial_exports, {
  Device: () => Device
});

// src/io/JsonDevice.ts
var JsonDevice = class extends SimpleEventEmitter {
  constructor(config = {}) {
    super();
    __publicField(this, "states");
    __publicField(this, "codec");
    __publicField(this, "verboseLogging", false);
    __publicField(this, "name");
    __publicField(this, "connectAttempts");
    __publicField(this, "chunkSize");
    __publicField(this, "rxBuffer");
    __publicField(this, "txBuffer");
    this.verboseLogging = config.debug ?? false;
    this.chunkSize = config.chunkSize ?? 1024;
    this.connectAttempts = config.connectAttempts ?? 3;
    this.name = config.name ?? `JsonDevice`;
    this.txBuffer = new StringWriteBuffer(async (data) => {
      await this.writeInternal(data);
    }, config.chunkSize);
    this.rxBuffer = new StringReceiveBuffer((line) => {
      this.fireEvent(`data`, { data: line });
    });
    this.codec = new Codec();
    this.states = new StateMachine(`ready`, {
      ready: `connecting`,
      connecting: [`connected`, `closed`],
      connected: [`closed`],
      closed: `connecting`
    });
    this.states.addEventListener(`change`, (evt) => {
      this.fireEvent(`change`, evt);
      this.verbose(`${evt.priorState} -> ${evt.newState}`);
      if (evt.priorState === `connected`) {
        this.rxBuffer.clear();
        this.txBuffer.clear();
      }
    });
  }
  get isConnected() {
    return this.states.state === `connected`;
  }
  get isClosed() {
    return this.states.state === `closed`;
  }
  write(txt) {
    if (this.states.state !== `connected`)
      throw new Error(`Cannot write while state is ${this.states.state}`);
    this.txBuffer.add(txt);
  }
  close() {
    if (this.states.state !== `connected`)
      return;
    this.onClosed();
  }
  async connect() {
    const attempts = this.connectAttempts;
    this.states.state = `connecting`;
    await this.onPreConnect();
    await retry(async () => {
      await this.onConnectAttempt();
      this.states.state = `connected`;
    }, attempts, 200);
  }
  onRx(evt) {
    const view = evt.target.value;
    if (view === void 0)
      return;
    let str = this.codec.fromBuffer(view.buffer);
    const plzStop = indexOfCharCode(str, 19);
    const plzStart = indexOfCharCode(str, 17);
    if (plzStart && plzStop < plzStart) {
      this.verbose(`Tx plz start`);
      str = omitChars(str, plzStart, 1);
      this.txBuffer.paused = false;
    }
    if (plzStop && plzStop > plzStart) {
      this.verbose(`Tx plz stop`);
      str = omitChars(str, plzStop, 1);
      this.txBuffer.paused = true;
    }
    this.rxBuffer.add(str);
  }
  verbose(m) {
    if (this.verboseLogging)
      console.info(`${this.name} `, m);
  }
  log(m) {
    console.log(`${this.name} `, m);
  }
  warn(m) {
    console.warn(`${this.name} `, m);
  }
};

// src/io/Serial.ts
var Device = class extends JsonDevice {
  constructor(config = {}) {
    super(config);
    this.config = config;
    __publicField(this, "port");
    __publicField(this, "tx");
    __publicField(this, "baudRate");
    this.baudRate = config.baudRate ?? 9600;
    if (config.name === void 0)
      super.name = `Serial.Device`;
    this.rxBuffer.separator = `\r
`;
  }
  async writeInternal(txt) {
    if (this.tx === void 0)
      throw new Error(`tx not ready`);
    try {
      this.tx.write(txt);
    } catch (ex) {
      this.warn(ex);
    }
  }
  onClosed() {
    try {
      this.port?.close();
    } catch (ex) {
      this.warn(ex);
    }
    this.states.state = `closed`;
  }
  onPreConnect() {
    return Promise.resolve();
  }
  async onConnectAttempt() {
    let reqOpts = {};
    const openOpts = {
      baudRate: this.baudRate
    };
    if (this.config.filters)
      reqOpts = { filters: [...this.config.filters] };
    this.port = await navigator.serial.requestPort(reqOpts);
    this.port.addEventListener(`disconnect`, (_) => {
      this.close();
    });
    await this.port.open(openOpts);
    const txW = this.port.writable;
    const txText = new TextEncoderStream();
    if (txW !== null) {
      txText.readable.pipeTo(txW);
      this.tx = txText.writable.getWriter();
    }
    const rxR = this.port.readable;
    const rxText = new TextDecoderStream();
    if (rxR !== null) {
      rxR.pipeTo(rxText.writable);
      rxText.readable.pipeTo(this.rxBuffer.writable());
    }
  }
};

export {
  NordicBleDevice_exports,
  EspruinoDevice_exports,
  Camera_exports,
  Serial_exports,
  io_exports
};
//# sourceMappingURL=chunk-7NG4EYZD.js.map