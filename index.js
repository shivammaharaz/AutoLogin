require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const { frontEnd } = require("./Dbconnect");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5000;

// const { generateToken } = require('./jwt')
const { json } = require("express");
// const { verifyToken } = require('../../backend-json/Jwt')

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  cors({
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
  })
);

app.get("/", (req, resp) => {
  resp.json({ message: "hello from server" });
});

app.post("/register", async (req, resp) => {
  console.log(req.body);
  password = await bcrypt.hash(req.body.password, 10);
  // console.log(password)
  const data = {
    name: req.body.name,
    email: req.body.email,
    password: password,
  };
  console.log(data);

  frontEnd.findOne({ email: req.body.email }, (err, user) => {
    // console.log(user)
    if (user) {
      resp.json({ message: "user already registered with this email id" });
    } else {
      const result = new frontEnd(data);
      result.save((err) => {
        if (!err) {
          resp.json({ message: "Registration Successful" });
        }
      });
    }
  });
});
app.post(
  "/authLogin",
  async (req, resp, next) => {
    try {
      const token = req.body.token;
      console.log(token);
      if (token) {
        let decode = jwt.verify(
          token,
          "shivammahaiubilauznvu;ebaiulcnuwpeuailraj"
        );

        req.body = decode ? decode : {};
        next();
        //    const data = {)
      }
    } catch (e) {
      resp.json({ message: e.message });
    }
  },
  async (req, res) => {
    try {
      console.log("you called method");
      const { id, email, password } = req.body;
      const data = await frontEnd.findOne({ _id: id });
      res.json({ user: data, message: "Login successful" });
    } catch (e) {
      resp.status(400).json({ message: e.message });
    }
  }
);

app.post("/login", (req, resp) => {
  try {
    const { email, password } = req.body;
    frontEnd.findOne({ email: email }, (err, user) => {
      if (user) {
        console.log(user);
        bcrypt.compare(password, user.password).then((match) => {
          console.log(match);

          if (match) {
            const { _id, email, password } = user;
            let datafortoken = jwt.sign(
              { id: _id, email: email, password: password },
              "shivammahaiubilauznvu;ebaiulcnuwpeuailraj",
              {
                expiresIn: "24h", // expires in 24 hour minutes
              }
            );

            resp.json({
              message: "Login successful",
              user: { _id: user._id, name: user.name, email: user.email },
              accessToken: datafortoken,
            });
          } else {
            resp.json({ message: "incorrect password" });
          }
        });
      } else {
        resp.json({ message: "user not registered" });
      }
    });
  } catch (e) {
    resp.status(400).json({ message: e.message });
  }
});
app.put("/reset", (req, resp) => {
  // console.log(req.body);
  try {
    const data = {
      email: req.body.email,
      password: req.body.password,
      newPassword: req.body.newPassword,
      confirmNewPassWord: req.body.confirmNewPassword,
    };
    console.log(data);
    frontEnd.findOne({ email: data.email }, (err, user) => {
      if (!err) {
        if (user) {
          // console.log(user)
          bcrypt.compare(data.password, user.password).then((match) => {
            if (match) {
              if (data.newPassword === data.confirmNewPassWord) {
                bcrypt.hash(data.newPassword, 10).then((hash) => {
                  frontEnd.updateOne(
                    { email: user.email },
                    { $set: { password: hash } },
                    (err, docs) => {
                      if (!err) {
                        frontEnd.findOne({ email: data.email });
                        // console.log(docs)
                        resp.json({
                          message: "password changed successfully",
                          user: docs,
                        });
                      } else {
                        resp.json({
                          message: "cannot reset password internal error",
                        });
                      }
                    }
                  );
                });
              } else {
                resp.json({
                  message: "password didnot match with confirm password",
                });
              }
            } else {
              resp.json({ message: "incorrect password" });
            }
          });
        }
      }
    });
  } catch (e) {
    resp.status(400).json({ message: e.message });
  }
});
// verifyToken()

app.delete("/deleteAccount", (req, resp) => {
  console.log("delete");
  try {
    const { email, password, confirmPassword } = req.body;
    if (email && password && password === confirmPassword) {
      frontEnd.findOne({ email: email }, (err, docs) => {
        if (!err && docs) {
          bcrypt.compare(password, docs.password).then((match) => {
            if (!match) {
              resp.json({ message: "Incorrect Password" });
            } else {
              frontEnd.deleteOne({ email: email }, (err) => {
                if (!err) {
                  resp.json({ message: "Account Deleted" });
                } else {
                  resp.json({ message: "internal error!" });
                }
              });
            }
          });
        } else {
          resp.status(400).json({ message: "user not Found" });
        }
      });
    } else {
      resp.status(400).json({ message: "please fill required field" });
    }
  } catch (e) {
    console.log(e);
    resp.status(400).json({ message: e.message });
  }
});

app.listen(PORT, (err) => {
  if (!err) {
    console.log("Live now");
  }
});
