const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser"); // Add this line
require("dotenv").config();
const app = express();
const port = process.env.PORT || 5000;

const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyhidjj.mongodb.net/tfDB?retryWrites=true&w=majority`; // Update the database name
app.use(cors());
app.use(express.json()); // Add this line

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("tfDB").collection("users");
    const taskCollection = client.db("tfDB").collection("myTodos");


    // user
    app.post("/users", async (req, res) => {
      try {
        const user = req.body;
        const query = { email: user.email };
        const existingUser = await userCollection.findOne(query);
        if (existingUser) {
          return res.send({ message: "User already exists", insertedId: null });
        }
        const result = await userCollection.insertOne(user);
        res.send(result);
      } catch (error) {
        console.error("Error in /users route:", error);
        res.status(500).send({ message: "Internal Server Error" });
      }
    });

    
    // task 
    app.post("/todos", async(req,res)=>{
      const todo = req.body;
      const result = await todosCollection.insertOne(todo);
      res.send(result);
    })
    app.get("/todos", async(req,res)=>{
      const request = req.query;
      let query = {};
      if(request.email){
        query = {
          user: request.email
        }
      }
      const result = await todosCollection.find(query).toArray();
      res.send(result);
    })


    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Commenting this line as it may close the connection immediately
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
