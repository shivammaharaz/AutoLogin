
require('dotenv').config()
const express = require("express")
const cors = require('cors')
const app = express()
const { frontEnd } = require('./Dbconnect')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const PORT = process.env.PORT || 5000

// const { generateToken } = require('./jwt')
const { json } = require('express')
// const { verifyToken } = require('../../backend-json/Jwt')



app.use(express.json())
app.use(cors(
{
  origin: 'https://autologin.netlify.app',
  optionsSuccessStatus: 200 
}
))

app.get('/', (req, resp) => {
    resp.json({ message: "hello from server" })
})

app.post('/register', async (req, resp) => {
    // console.log(req.body)
    password = await bcrypt.hash(req.body.password, 10)
    // console.log(password)
    const data = {
        name: req.body.name,
        email: req.body.email,
        password: password
    }
    console.log(data)

    frontEnd.findOne({ "email": req.body.email }, (err, user) => {
        // console.log(user)
        if (user) {
            resp.json({ message: "user already registered with this email id" })
        }
        else {
            const result = new frontEnd(data)
            result.save((err) => {
                if (!err) {
                    resp.json({ message: "Registration Successful" })
                }
            })
        }
    })

})
app.post('/authLogin',
    async (req, resp, next) => {
        // const authHeader = req.headers["authorization"];
        // console.log(authHeader)
        // const token = authHeader && authHeader.split(" ")[1];
        const token = req.body.token
        console.log(token)
        // console.log(token)
        if (token) {
            const decode = jwt.verify(token, 'shivammaharaj')
            // console.log(decode)
            req.body = decode
            next()
            //    const data = {)
        }

    },
    async (req, res) => {
        // console.log(req.body)
        console.log('you callse method')
        const { id, email, password } = req.body
        const data = await frontEnd.findOne({ _id: id })
        res.json({ user: data })


    })

app.post('/login', (req, resp) => {

    const { email, password } = req.body
    frontEnd.findOne({ email: email }, (err, user) => {
        if (user) {
            console.log(user)
            bcrypt.compare(password, user.password).then(match => {
                console.log(match);

                if (match) {
                    const { _id, email, password } = user
                    let datafortoken = jwt.sign({ id: _id, email: email, password: password }, 'shivammaharaj')
                    resp.json({ message: "Login successful", user: { _id: user._id, name: user.name, email: user.email }, accessToken: datafortoken })
                }
                else {
                    resp.json({ message: "incorrect password" })
                }
            })
        }
        else {
            resp.json({ message: "user not registered" })
        }
    })
})
app.put('/reset', (req, resp) => {
    // console.log(req.body);
    const data = {
        email: req.body.email,
        password: req.body.password,
        newPassword: req.body.newPassword,
        confirmNewPassWord: req.body.confirmNewPassword
    }
    console.log(data)
    frontEnd.findOne({ "email": data.email }, (err, user) => {
        if (!err) {
            if (user) {
                // console.log(user)
                bcrypt.compare(data.password, user.password).then(match => {
                    if (match) {
                        if (data.newPassword === data.confirmNewPassWord) {
                            bcrypt.hash(data.newPassword, 10).then(hash => {
                                frontEnd.updateOne({ "email": user.email }, { $set: { "password": hash } }, (err, docs) => {
                                    if (!err) {

                                        frontEnd.findOne({ email: data.email },)
                                        // console.log(docs)
                                        resp.json({ message: "password changed successfully", user: docs })
                                    }
                                    else {
                                        resp.json({ message: "cannot reset password internal error" })
                                    }
                                })
                            })

                        }
                        else {
                            resp.json({ message: "password didnot match with confirm password" })
                        }
                    }
                    else {
                        resp.json({ message: "incorrect password" })
                    }
                })

            }
        }

    })
})
// verifyToken()


app.delete('/deleteAccount', (req, resp) => {

    const user = {
        accessToken: req.body.accessToken
    }
    const data = verifyToken(user.accessToken)
    console.log(data)

    if (data.email && data.password) {
        frontEnd.findOne({ "email": data.email }, (err, docs) => {
            // console.log(docs)
            bcrypt.compare(data.password, docs.password).then(match => {
                if (!match) {
                    resp.json({ message: "Access Denied, incorrect password!" })
                }
                else {
                    frontEnd.deleteOne({ email: data.email }, (err) => {
                        if (!err) {
                            resp.json({ message: "Account Deleted" })
                        }
                        else {
                            resp.json({ message: "internal error!" })
                        }
                    })
                }
            })
        })
    }
})


app.listen(PORT, (err) => {
    if (!err) {
        console.log("Live now")
    }
})
