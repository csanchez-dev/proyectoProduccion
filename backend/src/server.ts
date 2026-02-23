import express from "express";
import fs from "fs";

const app = express();

app.listen(3000, () => {
  console.log("Servidor en http://localhost:3000");
});

app.get('/', (req, res) => {
    res.send("La api está lista")
});

const readData = () => {
    try{
        const data = fs.readFileSync("./db.json", "utf-8");
    console.log(JSON.parse(data));
    } catch (error) {
        console.log(error);
    }
};

readData();
