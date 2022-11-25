const { sign, verify, JsonWebTokenError } = require('jsonwebtoken')


function generateToken(user) {
    const accessToken = sign(user, process.env.ACCESS_KEY)
    return accessToken
}

async function verifyToken(req, resp, next) {
    const authHeader = req.headers["authorization"];
    console.log(authHeader)
    const token = authHeader && authHeader.split(" ")[1];

    if (token) {
        console.log(token)
        const decode = await verify(token, process.env.ACCESS_KEY)
        if (decode) {
            console.log(decode)
            req.body = decode
        }
    }
    else {
        resp.json({ message: "un authoirised access" })
    }
}

// verifyToken()


module.exports = { verifyToken }
