import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename).replace("/build", "");

// import payment from "./shop.js"
app.use(express.json());


// app.use("/api/store", payment);

app.use("/", express.static("./dist"));

// 404
const path404 = path.join(__dirname + '/dist/404.html');

app.get('*', (_, res) => {
    res.sendFile(path404);
});

app.use((_, res) => {
    res.status(404).sendFile(path404);
});


// Serve the files on port 3000.
app.listen(3000, function () {
    console.log('Robox website listening on port 3000!\n');
}); 
