

const COMMANDS = {
    FIRMWARECHECK: "x019FIRMCHECK\r",
    STARTUPLOAD: "x032BEGINUPLD\r",
    ENDUPLOAD: "x04\r",
    STARTPROGRAM: "x021STARTPROG\r",
    KEYBOARDINTERRUPT: "\x03\n"
}

type picoMessage = {
    type: "console" | "confirmation" | "error",
    message: string,
}

type disconnectOptions = {
    error: boolean, 
    restarting: boolean,
}
type connectOptions = {
    
}
type picoOptions = {
    message: string
}
type EventPayload = { event: 'console'; options: picoOptions } | { event: 'confirmation'; options: picoOptions } | { event: 'error'; options: picoOptions } | { event: 'connect'; options: connectOptions } | { event: 'disconnect'; options: disconnectOptions }

class Pico extends EventTarget {
    baudRate: number
    port: SerialPort
    textEncoder: TextEncoderStream
    currentWriter: WritableStreamDefaultWriter
    textDecoder: TextDecoderStream
    currentReader: ReadableStreamDefaultReader
    currentWriterStreamClosed: Promise<void>
    currentReadableStreamClosed: Promise<void>
    firmwareVersion: number
    restarting: boolean
    firmware: boolean
    constructor(baudRate = 9600, firmwareVersion=1) {
        super();
        //Initing all the things we need!
        this.baudRate = baudRate;
        this.port;
        this.textEncoder = new TextEncoderStream();
        this.currentWriter = this.textEncoder.writable.getWriter();
        this.textDecoder = new TextDecoderStream()
        this.currentReader = this.textDecoder.readable.getReader();
        this.currentWriterStreamClosed;
        this.currentReadableStreamClosed;
        this.firmwareVersion = firmwareVersion
        this.restarting = false //So that we know when a disconnect is from us or unexpected
        this.firmware = false //CHecking if the pico is the right firmware version
        this.#startupConnect()
    }
    //For events that will be happening
    //EVENTS:
    //Connect: no info needed
    //Disconnect: {error: bool, message: """}
    //Message: {type: type, message: ""}
    #emitChangeEvent(payload: EventPayload) {
        this.dispatchEvent(new CustomEvent(payload.event, {detail: payload.options}));
    }
    #startupConnect() { //Check if the Pico is already connected to the website on startup
        navigator.serial.getPorts().then(ports => {
            for (const port of ports) {
                let portInfo = port.getInfo()
                if (portInfo.usbVendorId === piVendorId) {
                    this.connect(port)
                    break;
                }
            }
        });
    }
    async request() {
        const device = navigator.serial.requestPort({ filters: [{ usbVendorId: piVendorId }] });
        device.then(async (port) => {
            this.connect(port)
        })
        .catch((error) => { //User did not select a port (or error connecting) show toolbar?
            if (error.name === "NotFoundError") return
            this.#emitChangeEvent({event: "error", options: {message: "Could not connect to the pico! Try resetting it?"}})
            console.warn("Could not connect to the port")
        })
    }
    async disconnect() {
        return new Promise(async (resolve, reject) => {
            if (this.currentReader) {
                try {
                    await this.currentReader.cancel()
                    await this.currentReadableStreamClosed?.catch((e) => { /* Ignore the error */ });
                }
                catch(err) {
                    reject(err)
                }
            }
            if (this.currentWriter) {
                this.currentWriter.close();
                await this.currentWriterStreamClosed;
            }
            if (this.port) await this.port.close()
            this.#emitChangeEvent({event: "disconnect", options: {error: false, restarting: this.restarting}})
            this.textEncoder = new TextEncoderStream();
            this.currentWriter = this.textEncoder.writable.getWriter();
            this.textDecoder = new TextDecoderStream()
            this.currentReader = this.textDecoder.readable.getReader();
            resolve("")
        });
    }
    async connect(port: SerialPort) {
        this.port = port
        
        //Opening the ports
        try {
            await this.port.open({ baudRate: 9600 });
        }
        catch(err) {
            this.#emitChangeEvent({event: "error", options: {message: "We are unable to open the port on the pico! Try resetting it?"}})
            console.warn("Unable to connect to pico port")
        }
        if (!this.port) {
            this.#emitChangeEvent({event: "error", options: {message: "The port was not provided! Please reopen the window, click the pico device then press connect!"}})
            return console.warn("Pico port was not provided")
        }
        if (!this.port.writable) {
            this.#emitChangeEvent({event: "error", options: {message: "We could not write to the pico! Try resetting it and make sure no other editors are open!"}})
            return console.warn("Could not open writer")
        }
        if (!this.port.readable) {
            this.#emitChangeEvent({event: "error", options: {message: "We could not read the pico! Try resetting it and make sure no other editors are open!"}})
            return console.warn("Could not open reader")
        }
        //Piping our reader and streaming into the right port
        this.currentWriterStreamClosed = this.textEncoder.readable.pipeTo(this.port.writable);
        this.currentReadableStreamClosed = this.port.readable.pipeTo(this.textDecoder.writable);
        this.restarting = false
        this.#emitChangeEvent({event: "connect", options: {}})
        this.read()
        return this.firmwareCheck()
    }
    async firmwareCheck() {
        return new Promise(async (resolve, reject) => {
            this.write(COMMANDS.FIRMWARECHECK)
            setTimeout(() => {
                if (this.firmware) {
                    resolve("Firmware is up to date")
                }
                else {
                    reject("Firmware is not up to date (or pico isnt responding)") //TODO: Add a way to distinguish, maybe make the pico respond with firmware version?
                }
            }, 1000);
        })
    }
    async sendCode(code: String) {
        return new Promise(async (resolve, reject) => {
            this.write(`${COMMANDS.STARTUPLOAD}${code}\r${COMMANDS.ENDUPLOAD}`)
            this.write(`${COMMANDS.STARTPROGRAM}`)
            resolve("Code has been written!")
        })
    }
    async restart() {
        await this.currentWriter.write(COMMANDS.KEYBOARDINTERRUPT) //Stop whatever program is currently running, the pico enters REPL
        await this.currentWriter.write("import machine\r")
        await this.currentWriter.write("machine.reset()\r") 
        this.restarting = true //We are manually restarting the pico so we can add that to the disconnect context
    }
    async write(message: string) {
        return new Promise(async (resolve, reject) => {
            try {
                await this.currentWriter.write(message)
                resolve("Written")
            }
            catch(err) {
                reject("Writing error!")
            }
        })
    }
    async read() {
        let error_string = ''
        try {
            usbloop: while (true) { //Forever loop for reading the pico
                const { value, done } = await this.currentReader.read()
                if (done) {
                    this.currentReader.releaseLock(); //Disconnects the serial port since the port is released
                    break;
                }
                let consoleMessages : picoMessage[] = [] //The console messages SHOULD be sent full JSON, but sometimes that does not happen
                try {
                    if (typeof value !== "string") continue
                    consoleMessages = [JSON.parse(value)] //If the message is broken JSON then this errors and goes to the next step
                    error_string = ''
                }
                catch (err) {
                    error_string += value
                    let rawErrorMessages = error_string.split("\n")
                    let index = 0
                    errorloop: for (const errorMessage of rawErrorMessages) { //Every JSON object is delimited by a new line, so even if the message is split if you loop over it you can join them together!
                        try {
                            if (typeof errorMessage !== "string") {
                                throw new Error("Invalid input: expected a JSON string");
                            }
                            consoleMessages.push(JSON.parse(errorMessage))
                        }
                        catch (err) {
                            break errorloop; //Not yet a full JSON message
                        }
                        index += 1
                    }
                    if (index !== rawErrorMessages.length - 1) { //Check if we chugged through all the broken JSON
                        rawErrorMessages.splice(0, index + 1) //If we have chugged through some but not all remove the non-broken JSON
                    }
                    error_string = rawErrorMessages.join("\n") 
    
                }
    
                for (const message of consoleMessages) {
                    let type = message["type"]
                    if (type === "confirmation") {
                        this.firmware = true //The firmware check was successful!
                    }
                    this.#emitChangeEvent({event: type, options: {message: message["message"]}})
                }
            }
        } catch(err) {
            console.warn(err)
        }
    }
    
}
export let pico = new Pico()
const piVendorId = 0x2e8a

navigator.serial.addEventListener("connect", (event) => { //When pico is connected 
    if (!event.target) return
    if ('getInfo' in event.target) {
        const port = event.target as SerialPort;
        let portInfo = port.getInfo()
        if (portInfo.usbVendorId === piVendorId) {
            //Could be a future issue
            // pico.connect(port || event.port)
            pico.connect(port)
        }
    }
});

navigator.serial.addEventListener("disconnect", async (event) => { //When pico is disconnected 
    if (!event.target) return
    if ('getInfo' in event.target) {
        const port = event.target as SerialPort;
        let portInfo = port.getInfo()
        if (portInfo.usbVendorId === piVendorId) {
            await pico.disconnect()
        }
    }
});