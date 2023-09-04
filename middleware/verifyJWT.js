const jwt = require('jsonwebtoken')

async function verifyJWT(req, res, next)
{
    const headers = req.headers.authorization || req.headers.Authorization
    if(!headers?.startsWith('Bearer ')) return res.status(401).json({'message': 'Unauthorized By Server!'})

    const token = headers.split(' ')[1]

    jwt.verify(
        token, 
        //@ts-ignore
        process.env.ACCESS_TOKEN_SECRET, 
        (err, decoded) => 
        {
            if(err) return res.status(403).json({'message': 'Forbidden By Server!'})

            //@ts-ignore
            const { id, username, email, active, friends } = decoded.UserInfo

            req.userId = id
            req.username = username
            req.email = email
            req.active = active
            req.friends = friends

            next()
        }
    )
}

module.exports = verifyJWT