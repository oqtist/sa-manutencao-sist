import express from 'express'
import fs from "fs/promises";
import { v4 as uuidv4 } from 'uuid';
import path from "path";
import { fileURLToPath } from "url";
const app = express();

app.use(express.json({ limit: "1mb" }));

app.use((req, res, next) => {
    console.log("REQ", new Date(), req.method, req.url, "body=",
        JSON.stringify(req.body));
    next();
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, "tickets.json");

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

    if (req.query.status) {
        list = list.filter(t => t.status === req.query.status);
    }

    if (req.query.customer) {
        list = list.filter(t => t.customer === req.query.customer);
    }

    res.json(list);
});

app.post("/tickets", async (req, res) => {
    const db = await readDb();
    const id = uuidv4();
    if (!req.body.title || !req.body.customer) {
        return res.status(400).json({ mensagem: "Um dos campos obrigatórios não foi preenchido. Tente novamente" })
    }
    if (req.body.status && !["open", "closed"].includes(req.body.status)) {
        return res.status(400).json({mensagem: "Status inválido. Opções válidas para status: 'open' ou 'closed'."})
    }
    db.push({
        id,
        title: req.body.title,
        customer: req.body.customer,
        status: req.body.status || "open",
        createdAt: new Date().toISOString(),
    });
    await writeDb(db);
    res.status(201).json({ ok: true });
});

app.put("/tickets/:id", async (req, res) => {
    const db = await readDb();
    const ticket = db.find((x) => x.id == req.params.id);
    if (!ticket) return res.status(404).send("Ticket não encontrado.");
    if (!["open", "closed"].includes(req.body.status)) {
        return res.status(400).send('Texto inválido para status. Opções válidas são "open" e "closed".')
    }
    ticket.status = req.body.status;
    await writeDb(db);
    res.json({ ok: true });
});

app.listen(3000, () => console.log("HelpDesk+ on 3000"));