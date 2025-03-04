require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const app = express();

const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vyipd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
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
    // await client.db("gymDB").command({ ping: 1 });
    // console.log(
    //   "Pinged your deployment. You successfully connected to MongoDB!"
    // );
    const usersCollection = client.db("gymDB").collection("users");

    app.get("/", (req, res) => {
      res.send("My-Gym Server Home");
    });    

    app.get("/gym", async (req, res) => {
      const { searchParams } = req.query;

      const query = searchParams
        ? { title: { $regex: searchParams, $options: "i" } }
        : {};

      const result = await usersCollection.find(query).toArray();
      res.send(result);
    });

    app.get("/gym/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    app.patch("/gym/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          title: user.title,
          day: user.day,
          date: user.date,
          time: user.time,
        },
      };
      const result = await usersCollection.updateOne(
        filter,
        updateDoc,
        options
      );
      res.send(result);
    });

    app.patch("/gymtask/:id", async (req, res) => {
      const id = req.params.id;
      const user = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = {
        $set: {
          completeTask: user.check,
        },
      };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.send(result);
    });

    app.post("/gym", async (req, res) => {
      const gymData = req.body;
      const result = await usersCollection.insertOne(gymData);
      res.send(result);
    });

    app.delete("/gym/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });
  } catch (error) {
    console.log("Error Occure on", error);
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run();

app.listen(port, () => {
  console.log("Server Listening Port", port);
});
