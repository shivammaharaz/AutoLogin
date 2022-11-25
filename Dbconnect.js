const mongoose = require('mongoose')
const { Schema, model } = require('mongoose')

url = 'mongodb+srv://Shivam:2001@cluster0.bxo7vjp.mongodb.net/MERN'

mongoose.connect(url, (err) => {
    if (!err) {
        console.log(" Db connencted");
    }
})

const userschema = Schema({
    name: { type: String, require },
    email: { type: String, require, unique: true },
    password: { type: String, require }
})

const frontEnd = model("data", userschema)

module.exports = { frontEnd }