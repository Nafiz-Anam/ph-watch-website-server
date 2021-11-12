const express = require("express");
const cors = require("cors");
const { MongoClient } = require("mongodb");
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.epq5m.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

async function run() {
    try {
        await client.connect();
        const database = client.db("arloji-watches");
        // all collections
        const watchCollection = database.collection("watches");
        const orderCollection = database.collection("orders");
        const userCollection = database.collection("users");
        const reviewCollection = database.collection("reviews");
        // all requests here
        // review api
        app.get("/review", async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        });
        app.post("/review", async (req, res) => {
            const newReview = req.body;
            const result = await reviewCollection.insertOne(newReview);
            res.json(result);
        });
        // user api
        app.get("/users/:email", async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await userCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === "admin") {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });
        });
        app.post("/users", async (req, res) => {
            const newUser = req.body;
            const result = await userCollection.insertOne(newUser);
            res.json(result);
        });
        app.put("/users", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await userCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            res.json(result);
        });
        app.put("/users/admin", async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: "admin" } };
            const result = await userCollection.updateOne(filter, updateDoc);
            res.json(result);
        });
        // shop api
        app.get("/shop", async (req, res) => {
            const cursor = watchCollection.find({});
            const watches = await cursor.toArray();
            res.send(watches);
        });
        app.get("/shop/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const watch = await watchCollection.findOne(query);
            res.send(watch);
            // console.log(watch);
        });
        app.post("/shop", async (req, res) => {
            const newWatch = req.body;
            const result = await watchCollection.insertOne(newWatch);
            res.json(result);
            // console.log("Hitting the post", result);
        });
        app.put("/shop/:id", async (req, res) => {});
        app.delete("/shop/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await watchCollection.deleteOne(query);
            res.send(result);
            // console.log("Deleting user with id :", id);
            // console.log("Result :", result);
        });
        // order api
        app.get("/orders", async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });
        app.get("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const order = await orderCollection.findOne(query);
            res.send(order);
            // console.log(order);
        });
        app.post("/orders", async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            res.json(result);
            // console.log("Hitting the post", result);
        });
        app.put("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const filter = { _id: ObjectId(id) };
            const newStatus = req.body;
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: newStatus.status,
                },
            };
            const result = await orderCollection.updateOne(
                filter,
                updateDoc,
                options
            );
            // console.log("updating user", id);
            res.send(result);
        });
        app.delete("/orders/:id", async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await orderCollection.deleteOne(query);
            res.send(result);
            // console.log("Deleting user with id :", id);
            // console.log("Result :", result);
        });

        // app.get("/appointments", async (req, res) => {
        //     const email = req.query.email;
        //     const date = new Date(req.query.date).toLocaleDateString();
        //     const query = { email: email, date: date };
        //     const cursor = appointmentsCollection.find(query);
        //     const appointments = await cursor.toArray();
        //     res.json(appointments);
        // });
        // app.post("/appointments", async (req, res) => {
        //     const appointment = req.body;
        //     const result = await appointmentsCollection.insertOne(appointment);
        //     console.log(result);
        //     res.json(result);
        // });
    } finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.get("/", (req, res) => {
    res.send("Hello from Arloji Watches");
});

app.listen(port, () => {
    console.log(`listening at ${port}`);
});
