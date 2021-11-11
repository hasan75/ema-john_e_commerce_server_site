const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config();
const cors = require('cors');

//for git ignore

const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors())
app.use(express.json())

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.4dxux.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
console.log(uri)

async function run (){
    try{
        await client.connect();
        console.log('Database connected Successfully')
        
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