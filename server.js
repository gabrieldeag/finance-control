const express = require("express");
const { MongoClient } = require("mongodb");
const path = require("path");
const app = express();
const port = process.env.PORT || 3000;

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);

async function connectToDatabase() {
  if (!client.topology || !client.topology.isConnected()) {
    await client.connect();
  }
  const database = client.db("mydatabase");
  return database.collection("data");
}

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/index.html"));
});

app.post("/save", async (req, res) => {
  const data = req.body;
  try {
    const collection = await connectToDatabase();
    const { _id, ...restData } = data;
    await collection.updateOne({}, { $set: restData }, { upsert: true });
    res.json({ message: "Dados salvos com sucesso" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao salvar os dados" });
  }
});

app.get("/load", async (req, res) => {
  try {
    const collection = await connectToDatabase();
    const data = await collection.findOne({});
    if (data) {
      res.json(data);
    } else {
      res.json({
        categories: [],
        transactions: [],
        settings: { theme: "dark", currency: "R$" },
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erro ao carregar os dados" });
  }
});

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
