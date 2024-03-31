const express = require('express')
const app = express()
const mongoose = require('mongoose')

require('dotenv').config()

app.use(express.json())


require('./bot/bot.js')





async function dev(){
    try{
        await mongoose.connect(process.env.MONGO_URL)
        .then(()=> console.log('MongoDB connected'))
        .catch((error)=>console.log(error))

        app.listen(process.env.PORT, ()=>{
            console.log('Server ishlamoqda');
        })
    }catch(error){
        console.log(error);
    }
}

dev()





