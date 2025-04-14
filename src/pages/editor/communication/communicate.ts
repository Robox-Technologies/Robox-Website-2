
const piVendorId = 0x2e8a

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
type firmwareOptions = {
    upToDate: boolean;
}
type picoOptions = {
    message: string
}
type EventPayload = { event: 'console'; options: picoOptions } | { event: 'firmware'; options: firmwareOptions } | { event: 'confirmation'; options: picoOptions } | { event: 'error'; options: picoOptions } | { event: 'connect'; options: connectOptions } | { event: 'disconnect'; options: disconnectOptions }

class Pico extends EventTarget {
    communication: USBCommunication
    firmwareVersion: number
    restarting: boolean
    firmware: boolean
    constructor(method: "USB" | "Bluetooth", firmwareVersion=1) {
        super()
        if (method === "USB") this.communication = new USBCommunication(this)
        this.restarting = false
        this.firmware = false
        this.firmwareVersion = 1
    }
    init() {
        navigator.serial.addEventListener("connect", (event) => { //When pico is connected 
            if (!event.target) return
            if ('getInfo' in event.target) {
                const port = event.target as SerialPort;
                let portInfo = port.getInfo()
                if (portInfo.usbVendorId === piVendorId) {
                    //Could be a future issue
                    // pico.connect(port || event.port)
                    this.connect(port)
                }
            }
        });
        
        navigator.serial.addEventListener("disconnect", async (event) => { //When pico is disconnected 
            if (!event.target) return
            if ('getInfo' in event.target) {
                const port = event.target as SerialPort;
                let portInfo = port.getInfo()
                if (portInfo.usbVendorId === piVendorId) {
                    await this.disconnect()
                }
            }
        });
    }
    async disconnect() {
        
        let disconnected = await this.communication.disconnect()
        if (disconnected) this.emit({event: "disconnect", options: {error: false, restarting: this.restarting}})
    }
    emit(payload: EventPayload) {
        this.dispatchEvent(new CustomEvent(payload.event, {detail: payload.options}));
    }
    read(payload: picoMessage) {
        let type = payload["type"]
        if (type === "confirmation") {
            this.firmware = true //The firmware check was successful!
        }
        this.emit({event: type, options: payload})
    }
    write(command: string) {
        this.communication.write(command) 
    }
    firmwareCheck() {
        this.write(COMMANDS.FIRMWARECHECK)
        setTimeout(() => {
            this.emit({"event": "firmware", "options": {upToDate: this.firmware}})

        }, 1000);
    }
    restart() {
        this.communication.write([
            COMMANDS.KEYBOARDINTERRUPT, 
            "import machine\r",
            "machine.reset()\r"
        ])
    }
    request() {
        this.communication.request()
    }
    sendCode(code: string) {
        this.communication.write([
            `${COMMANDS.STARTUPLOAD}${code}\r${COMMANDS.ENDUPLOAD}`, 
            `${COMMANDS.STARTPROGRAM}`
        ])
    }
    async connect(port: any) {
        let connected = await this.communication.connect(port)
        if (connected) {
            this.emit({event: "connect", options: {}})
            this.firmwareCheck()
        }
    }
    startupConnect() { //Check if the Pico is already connected to the website on startup
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

}
class USBCommunication {
    baudRate: number
    port: SerialPort 
    textEncoder: TextEncoderStream
    currentWriter: WritableStreamDefaultWriter
    textDecoder: TextDecoderStream
    currentReader: ReadableStreamDefaultReader
    currentWriterStreamClosed: Promise<void> 
    currentReadableStreamClosed: Promise<void>
    constructor(private parent: Pico, baudRate = 9600) {
        
    }
    
    async read() {
        const terminationLength = "\n".length
        try {
            let message = ""
            while (true) { //Forever loop for reading the pico
                const { value, done } = await this.currentReader.read()
                if (done) {
                    this.currentReader.releaseLock(); //Disconnects the serial port since the port is released
                    break;
                }
                message += value
                let lineBreak = message.indexOf("\n")
                let consoleMessages : picoMessage[] = []
                while (lineBreak !== -1) {
                    let terminatedMessage = message.slice(0, lineBreak)
                    message = message.slice(lineBreak + terminationLength)
                    consoleMessages.push(JSON.parse(terminatedMessage))
                    lineBreak = message.indexOf("\n")
                }
                for (const message of consoleMessages) {
                    this.parent.read(message)
                }
            }
        } catch(err) {
            console.warn(err)
        }
    }
    async write(messages: string | string[]) {
        try {
            if (typeof messages === "object") { //Check if its an array object
                for (const message of messages) {
                    await this.currentWriter.write(message)
                }                
            }
            else {
                this.currentWriter.write(messages)
            }
        }
        catch(err) {
            this.parent.emit({"event": "error", options: { "message": "Could not write to pico!"}})
        }
    }
    async connect(port: SerialPort) {
        this.port = port

        //Opening the ports
        try {
            await this.port.open({ baudRate: 9600 });
        }
        catch(err) {
            this.parent.emit({event: "error", options: {message: "We are unable to open the port on the pico! Try resetting it?"}})
            return false
        }
        if (!this.port) {
            this.parent.emit({event: "error", options: {message: "The port was not provided! Please reopen the window, click the pico device then press connect!"}})
            return false
        }
        if (!this.port.writable) {
            this.parent.emit({event: "error", options: {message: "We could not write to the pico! Try resetting it and make sure no other editors are open!"}})
            return false
        }
        if (!this.port.readable) {
            this.parent.emit({event: "error", options: {message: "We could not read the pico! Try resetting it and make sure no other editors are open!"}})
            return false
        }
        //Piping our reader and streaming into the right port
        this.currentWriterStreamClosed = this.textEncoder.readable.pipeTo(this.port.writable);
        this.currentReadableStreamClosed = this.port.readable.pipeTo(this.textDecoder.writable);
        
        this.read()
        return true
    }
    async disconnect() {
        if (this.currentReader) {
            try {
                await this.currentReader.cancel()
                await this.currentReadableStreamClosed?.catch((e) => { /* Ignore the error */ });
            }
            catch(err) {
                this.parent.emit({"event": "error", options: { "message": "Cound not close Pico reader"}})
                return
            }
        }
        if (this.currentWriter) {
            this.currentWriter.close();
            await this.currentWriterStreamClosed;
        }
        if (this.port) await this.port.close()

        this.textEncoder = new TextEncoderStream();
        this.currentWriter = this.textEncoder.writable.getWriter();
        this.textDecoder = new TextDecoderStream()
        this.currentReader = this.textDecoder.readable.getReader();
        return true
    }
    async request() {
        const device = navigator.serial.requestPort({ filters: [{ usbVendorId: piVendorId }] });
        device.then(async (port) => {
            this.parent.connect(port)
        })
        .catch((error) => { //User did not select a port (or error connecting) show toolbar?
            if (error.name === "NotFoundError") return
            this.parent.emit({event: "error", options: {message: "Could not connect to the pico! Try resetting it?"}})
            console.warn("Could not connect to the port")
            return
        })
    }
}
export let pico = new Pico("USB")