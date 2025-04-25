const piVendorId = 0x2e8a


const COMMANDS = {
    FIRMWARECHECK: "x019FIRMCHECK\r",
    STARTUPLOAD: "x032BEGINUPLD\r",
    ENDUPLOAD: "x04\r",
    STARTPROGRAM: "x021STARTPROG\r",
    RESTARTPROGRAM: "x069\r",
    KEYBOARDINTERRUPT: "\x03\n"
}
const MAX_CHUNK_SIZE = 20;  // Max size for GATT write (usually 20 bytes)
type picoMessage = {
    type: "console" | "confirmation" | "error" | "awake",
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
type EventPayload = { event: 'console'; options: picoOptions } | { event: 'awake'; options: picoOptions } | { event: 'console'; options: picoOptions } | { event: 'downloaded'; options: {} } | { event: 'firmware'; options: firmwareOptions } | { event: 'confirmation'; options: picoOptions } | { event: 'error'; options: picoOptions } | { event: 'connect'; options: connectOptions } | { event: 'disconnect'; options: disconnectOptions }

class Pico extends EventTarget {
    communication: USBCommunication | BLECommunication
    firmwareVersion: number
    restarting: boolean
    firmware: boolean
    constructor(method: "USB" | "Bluetooth", firmwareVersion=1) {
        super()
        if (method === "USB") this.communication = new USBCommunication(this)
        else if (method === "Bluetooth") this.communication = new BLECommunication(this)
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
        if (type === "awake") {
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
        this.restarting = true
        this.communication.restart()
    }
    request() {
        this.communication.request()
    }
    sendCode(code: string) {
        this.communication.write([
            COMMANDS.STARTUPLOAD, 
            `${code}\r`, 
            COMMANDS.ENDUPLOAD
        ])
    }
    runCode() {
        this.communication.write([
            `${COMMANDS.STARTPROGRAM}`
        ])
    }
    async connect(port: any) {
        let connected = await this.communication.connect(port)
        if (connected) {
            this.emit({event: "connect", options: {}})
            if (this.restarting) this.restarting = false
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
        this.baudRate = baudRate;
        this.textEncoder = new TextEncoderStream();
        this.currentWriter = this.textEncoder.writable.getWriter();
        this.textDecoder = new TextDecoderStream()
        this.currentReader = this.textDecoder.readable.getReader();
    }
    restart() {
        this.write([
            COMMANDS.KEYBOARDINTERRUPT, 
            "import machine\r",
            "machine.reset()\r"
        ])
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
                    rawErrorMessages.splice(0, index)
                    error_string = rawErrorMessages.join("\n") 
                }
    
                for (const message of consoleMessages) {
                    this.parent.read(message)
                }
                consoleMessages = []
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
class BLECommunication {
    device: BluetoothDevice
    server: BluetoothRemoteGATTServer
    service: BluetoothRemoteGATTService
    characteristic: BluetoothRemoteGATTCharacteristic
    textEncoder: TextEncoder
    textDecoder: TextDecoder
    constructor(private parent: Pico) {
        this.textEncoder = new TextEncoder();
        this.textDecoder = new TextDecoder("utf-8", { ignoreBOM: true });
    }

    restart() {
        this.write(COMMANDS.RESTARTPROGRAM)
    }

    async read(): Promise<void> {
        try {
            await this.characteristic.startNotifications();
    
            let buffer = '';
    
            this.characteristic.addEventListener("characteristicvaluechanged", (event: Event) => {
                const target = event.target as BluetoothRemoteGATTCharacteristic;
                const rawValue = target.value!;
    
                // Strip null characters before processing
                const value = this.textDecoder.decode(rawValue).replace(/\u0000/g, ''); //since the null character keeps on appearing
    
                buffer += value;
    
                const parts = buffer.split('\r');
                buffer = parts.pop() ?? '';
    
                const consoleMessages: picoMessage[] = [];
    
                for (const part of parts) {
                    const trimmed = part.trim();
                    if (!trimmed) continue;
    
                    try {
                        const parsed = JSON.parse(trimmed) as picoMessage;
                        consoleMessages.push(parsed);
                    } catch {
                        // Ignore malformed JSON chunks
                    }
                }
    
                for (const message of consoleMessages) {
                    if (this.parent.restarting && message.type === "awake") {
                        this.parent.emit({ event: "connect", options: {} });
                        continue;
                    }
                    this.parent.read(message);
                }
            });
    
        } catch (err) {
            console.warn('Error starting notifications:', err);
        }
    }
    
    
    

async write(messages: string | string[]): Promise<void> {
    try {
        // If messages is an array, handle each message separately
        if (Array.isArray(messages)) {
            for (const msg of messages) {
                // Split each message into chunks of size MAX_CHUNK_SIZE
                const chunks: string[] = [];
                for (let i = 0; i < msg.length; i += MAX_CHUNK_SIZE) {
                    chunks.push(msg.slice(i, i + MAX_CHUNK_SIZE));
                }

                // Send each chunk of the message separately
                for (const chunk of chunks) {
                    console.log("Sending chunk:", chunk);  // Debugging: Check each chunk sent
                    await this.characteristic.writeValue(this.textEncoder.encode(chunk));
                    // Optional: small delay between writes to avoid flooding the Bluetooth connection
                    await new Promise(resolve => setTimeout(resolve, 10));
                }
            }
        } else {
            // If messages is a single string, just split it into chunks and send
            const chunks: string[] = [];
            for (let i = 0; i < messages.length; i += MAX_CHUNK_SIZE) {
                chunks.push(messages.slice(i, i + MAX_CHUNK_SIZE));
            }

            // Send each chunk of the message separately
            for (const chunk of chunks) {
                console.log("Sending chunk:", chunk);  // Debugging: Check each chunk sent
                await this.characteristic.writeValue(this.textEncoder.encode(chunk));
                // Optional: small delay between writes to avoid flooding the Bluetooth connection
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
    } catch (err) {
        console.warn(err);
        this.parent.emit({ event: "error", options: { message: "Could not write to pico!" } });
    }
}

    

    async connect(device: any) {
        try {
            this.device = device
            this.server = await this.device.gatt!.connect();
            this.service = await this.server.getPrimaryService(0xffe0);
            this.characteristic = await this.service.getCharacteristic(0xffe1);

            this.read(); // Start notifications
            return true;

        } catch (err) {
            this.parent.emit({ event: "error", options: { message: "Failed to connect to the Pico via BLE!" } });
            console.warn(err);
            return false;
        }
    }

    async disconnect() {
        try {
            if (this.device?.gatt?.connected) {
                await this.device.gatt.disconnect();
            }
        } catch (err) {
            this.parent.emit({ event: "error", options: { message: "Could not disconnect from Pico" } });
        }
        return true;
    }

    async request() {
        try {
            let device = navigator.bluetooth.requestDevice({
                filters: [{ services: [0xffe0] }]
            });
            device.then(async (port) => {
                this.parent.connect(port)
            })
        } 
        catch (error: any) {
            if (error.name !== "NotFoundError") {
                this.parent.emit({ event: "error", options: { message: "Could not connect to the pico! Try resetting it?" } });
                console.warn("Could not connect via BLE", error);
            }
        }
    }
}

export let pico = new Pico("Bluetooth")
pico.init()
pico.startupConnect()

