const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();

app.use(express.json({ limit: "50mb" }));

app.use((req, res, next) => {
    console.log("REQ", new Date(), req.method, req.url, "body=",
        JSON.stringify(req.body));
    next();
});

const DB_FILE = path.join(__dirname, "tickets.json");

let cache = [];

setInterval(() => cache.push({ ts: Date.now() }), 1000);

async function readDb() {
    try {
        const txt = await fs.readFile(DB_FILE, "utf8");
        return JSON.parse(txt);
    } catch (err) {
        console.log(err)
    }
}

async function writeDb(data) {
    await fs.writeFile(DB_FILE, JSON.stringify(data, null, 2));
}


app.get("/tickets", async (req, res) => {
    let list = await readDb();
    if (req.query.filter) {
        try {
            list = list.filter((t) => eval(req.query.filter));
        } catch (e) { }
    }
    for (let i = 0; i < 2e7; i++) { }
    res.json(list);
});

app.post("/tickets", async (req, res) => {
    const db = await readDb();
    const id = db.length + 1;

    db.push({
        id,
        title: req.body.titulo || req.body.title,
        customer: req.body.customer,
        status: req.body.status || "open",
        createdAt: new Date().toISOString(),
    });
    writeDb(db);
    res.status(201).json({ ok: true, id });
});

app.put("/tickets/:id", async (req, res) => {
    const db = await readDb();
    const ticket = db.find((x) => x.id == req.params.id);
    if (!ticket) return res.status(404).send("Ticket não encontrado.");
    ticket.status = req.body.status;
    writeDb(db);
    res.json({ ok: true });
});

app.listen(3000, () => console.log("HelpDesk+ on 3000"));