const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rf3zcjg.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const productCollection = client.db("retailWatchDB").collection("products");
    const cartCollection = client.db("retailWatchDB").collection("carts");

    // Get all products
    app.get("/products", async (req, res) => {
      const result = await productCollection.find().toArray();
      res.send(result);
    });

    // Get a single product details
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await productCollection.findOne(query);
      res.send(result);
    });

    // post cart collection 
    app.post("/carts", async(req, res)=>{
      const item = req.body;
      const result = await cartCollection.insertOne(item);
      res.send(result)
    })

    // get cart colletion
    app.get("/carts", async(req, res) =>{
      const email = req.query.email;
      if(!email){
        return res.send([])
      }
      const query = {email: email}
      const result = await cartCollection.find(query).toArray();
      res.send(result)
    })

    // Delete a single item from cart
    app.delete("/carts/:id", async(req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)};
      const result = await cartCollection.deleteOne(query);
      res.send(result)
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

// test api
app.get("/", (req, res) => {
  res.send("server is running...");
});

// app listen
app.listen(port, () => {
  console.log("Server is running...");
});
