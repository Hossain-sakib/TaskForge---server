const express = require("express");
const app = express();
const port = process.env.PORT || 5000;
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
require("dotenv").config();

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyhidjj.mongodb.net/tfDB?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // await client.connect();
    const userCollection = client.db("tfDB").collection("users");
    const todosCollection = client.db("tfDB").collection("myTodos");

    // Create user
    app.post("/users", async (req, res) => {
      const user = req.body;
      const query = { email: user.email };
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: "user already exist", insertedId: null });
      }
      const result = await userCollection.insertOne(user);
      res.send(result);
    });
    app.get("/users", async (req, res) => {
      const result = await userCollection.find().toArray();
      res.send(result);
    });
    
    // Create a new todo
    app.post("/todos", async (req, res) => {
      const todo = req.body;
      const result = await todosCollection.insertOne(todo);
      res.send(result);
    });

    // Get todos based on user's email
    app.get("/todos", async (req, res) => {
      const request = req.query;
      let query = {};
      if (request.email) {
        query = { user: request.email };
      }
      const result = await todosCollection.find(query).toArray();
      res.send(result);
    });

    // Delete a todo by ID
    app.delete("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await todosCollection.deleteOne(query);
      res.send(result);
    });

    // Update the status of a todo by ID
    app.patch("/todos/:id", async (req, res) => {
      const id = req.params.id;
      const { status } = req.body;
      const query = { _id: new ObjectId(id) };
      const update = { $set: { status: status } };
      const result = await todosCollection.updateOne(query, update);
      res.send(result);
    });

    console.log("Connected to MongoDB!");
  } finally {
    // 
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
