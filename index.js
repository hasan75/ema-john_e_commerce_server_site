const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');
var admin = require("firebase-admin");

//for git ignore

const app = express();
const port = process.env.PORT || 5000;

//firebase admin initialization
var serviceAccount = require('./ema-john-ecommerce-auth-firebase-adminsdk-me0kz-49c15fb6c7.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4dxux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
//console.log(uri)

async function verifyToken(req,res,next){
    if(req.headers?.authorization?.startsWith('Bearer ')){
        const idToken = req.headers.authorization.split('Bearer ')[1];
        //console.log('Inside Separate Function', idToken);
        try{
            const decodedUser = await admin.auth().verifyIdToken(idToken)
            req.decodedUserEmail = decodedUser.email;
        }
        catch{

        }
    }
    next();
}

async function run (){
    try{
        await client.connect();
        const database = client.db('onlineShop_Ema_JOhn');
        const productCollection = database.collection('products');
        const orderCollection = database.collection('orders');

        //GET Product API
        app.get('/products', async(req,res)=>{
            console.log(req.query)
            const cursor = productCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count()

            if(page){
                products = await cursor.skip(page*size).limit(size).toArray();

            }
            else{
                products = await cursor.toArray();
            }
            
            
            res.send({
                count,
                products
            });
        });

        //USe POST to get data by keys (for cart total in pages)
        app.post('/products/byKeys',async(req,res)=>{
            const keys = req.body;
            const query = {key: {$in: keys}}
            const products = await productCollection.find(query).toArray()
            res.json(products)
            //res.send('Hitting POST')
        });

        // Add Orders API
        app.get('/orders', verifyToken, async(req, res)=>{
            //console.log(req.headers.authorization)
            const email = req.query.email;
            if(req.decodedUserEmail === email){

            }

            const query = {email : email};
            
            const cursor = orderCollection.find(query);
            const orders = await cursor.toArray();
            res.json(orders);
        })
        app.post('/orders', async(req,res) => {
            const order = req.body;
            order.createdAt = new Date();
            const result = await orderCollection.insertOne(order)
            //console.log('Order', order);
            res.json(result)
        })
        
    }


    finally{
        //await client.close()
    }
}

run().catch(console.dir)

app.get('/', (req,res)=>{
    res.send('running Ema-John CURD')
});

app.listen(port, ()=>{
    console.log( 'Running on PORT', port);
})