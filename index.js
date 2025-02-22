require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(express.json());
app.use(cors({
    origin: [
        'http://localhost:5173',
        'https://interactive-task-manager-65940.web.app',
        'https://interactive-task-manager-65940.firebaseapp.com'
    ],
}));


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.USER_DB}:${process.env.USER_PASSWORD}@cluster0.sdsvu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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
    // await client.connect();

    const usersCollection = client.db('interactive-task-manager').collection('users');
    const tasksCollection = client.db('interactive-task-manager').collection('tasks');

    app.post('/users', async(req,res) =>{
        const users = req.body;
        const query = {email: users.email};
        const isExist = await usersCollection.findOne(query);
        if(isExist){
            return res.send('user already exist');
        }
        const result = await usersCollection.insertOne(users);
        res.send(result);
    })

    app.post('/tasks', async(req, res)=>{
        const task = req.body;
        const result = await tasksCollection.insertOne(task);
        res.send(result);
    })

    app.get('/task/:email', async(req, res) =>{
        const email = req.params.email;
        const query = {userEmail: email}
        const result = await tasksCollection.find(query).toArray();
        res.send(result);
    })

    app.get('/task/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await tasksCollection.findOne(query);
        console.log(result);
        res.send(result);
    })

    app.delete('/task/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id:new ObjectId(id) };
        const result = await tasksCollection.deleteOne(query);
        res.send(result);
    })

    app.patch('/task/:id', async(req, res) =>{
        const taskInfo = req.body;
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const updatedDoc = {
            $set: {
                title: taskInfo.title,
                description: taskInfo.description
            }
        };
        const result = await tasksCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })

    app.patch('/taskStatus/:id', async(req, res) =>{
        const { status } = req.body;
        const id = req.params.id;
        const filter = {_id:new ObjectId(id)};
        const updatedDoc = {
            $set: {status}
        };
        const result = await tasksCollection.updateOne(filter, updatedDoc);
        res.send(result);
    })

    // Send a ping to confirm a successful connection
    // await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('WELCOME TO TASK MANAGER');
})

app.listen(port, ()=>{
    console.log('SERVER IS WORKING ON PORT ', port);
})

