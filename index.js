// server.js
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fyhidjj.mongodb.net/tfDB?retryWrites=true&w=majority`;

app.use(cors());
app.use(express.json());

const client = new MongoClient(uri, {
    serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
    },
});

async function run() {
    try {
        await client.connect();
        const todosCollection = client.db("tfDB").collection("myTodos");

        app.post("/todos", async (req, res) => {
            try {
                const todo = req.body;
                const result = await todosCollection.insertOne(todo);
                res.send(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send({ error: "An error occurred." });
            }
        });

        app.get("/todos", async (req, res) => {
            try {
                const request = req.query;
                let query = {};
                if (request.email) {
                    query = { user: request.email };
                }
                const result = await todosCollection.find(query).toArray();
                res.send(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send({ error: "An error occurred." });
            }
        });

        app.delete("/todos/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const query = { _id: new ObjectId(id) };
                const result = await todosCollection.deleteOne(query);
                res.send(result);
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send({ error: "An error occurred." });
            }
        });

        app.patch("/todos/:id", async (req, res) => {
            try {
                const id = req.params.id;
                const { status } = req.body; // Extract status from request body

                let updatedDoc;

                if (status === "ongoing" || status === "completed") {
                    updatedDoc = {
                        $set: {
                            status: status,
                        },
                    };

                    const query = { _id: new ObjectId(id) };
                    const result = await todosCollection.updateOne(query, updatedDoc);

                    if (result.modifiedCount === 1) {
                        res.send({ success: true });
                    } else {
                        res.status(404).send({ error: "Task not found." });
                    }
                } else {
                    res.status(400).send({ error: "Invalid status provided." });
                }
            } catch (error) {
                console.error("Error:", error);
                res.status(500).send({ error: "An error occurred." });
            }
        });

        console.log("Connected to MongoDB!");
    } finally {
        // Uncommenting this line as it may close the connection immediately
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
