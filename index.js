const express = require('express');
const cors = require('cors');
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json())


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.tdqyujf.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

async function run() {



    try {
        // Connect the client to the server	(optional starting in v4.7)



        const toysCollection = client.db('toyDB').collection('toys');

        const indexKeys = { name: 1 };
        const indexOptions = { name: "name" };
        const result = await toysCollection.createIndex(indexKeys, indexOptions);

        app.get('/toys', async (req, res) => {
            const cursor = toysCollection.find().limit(20);
            const result = await cursor.toArray();
            res.send(result);
        })

        app.get('/toysEmailSort', async (req, res) => {
            const sortValue = req.query?.sort;
            // console.log(sortValue);

            // console.log(req.query.email)
            let query = {};
            if (req.query?.email) {
                query = { email: req.query.email }
            }
            else {
                res.status(404).send({ error: true, message: 'Email not found' })
            }

            const val = sortValue == 'descending' ? -1 : 1;

            const result = await toysCollection.find(query).sort({ price: val }).toArray();
            res.send(result);
        })

        app.get('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.findOne(query);
            res.send(result);
        })

        app.get("/getToysByText/:text", async (req, res) => {
            const text = req.params.text;
            const result = await toysCollection
                .find({
                    $or: [
                        { name: { $regex: text, $options: "i" } }
                    ],
                })
                .toArray();
            res.send(result);
        });

        app.post('/toys', async (req, res) => {
            const newToy = req.body;
            // console.log(newToy);
            const result = await toysCollection.insertOne(newToy);
            res.send(result);
        })

        app.patch('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updatedToys = req.body;
            const toys = {
                $set: {
                    name: updatedToys.name,
                    sName: updatedToys.sName,
                    email: updatedToys.email,
                    subCategory: updatedToys.subCategory,
                    price: updatedToys.price,
                    rating: updatedToys.rating,
                    quantity: updatedToys.quantity,
                    details: updatedToys.details,
                    photo: updatedToys.photo
                }
            }

            const result = await toysCollection.updateOne(filter, toys, options);
            res.send(result);
        })


        app.delete('/toys/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await toysCollection.deleteOne(query);
            res.send(result);
        })




        // Send a ping to confirm a successful connection
        await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send("Fahad's Toys ");
});

app.listen(port, () => {
    console.log(`Fahad's Toys is running on port: ${port}`)
})