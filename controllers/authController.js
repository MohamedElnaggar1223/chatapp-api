const User = require('../models/User')
const validateEmail = require('../config/validateEmail')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

async function login(req, res)
{
    console.log('logging in')
    const { username, email, password } = req.body
    if(!(username || email) || !password) return res.status(400).json({'message': 'All Fields Must Be Given!'})

    const user = username ? await User.findOne({ username }).exec() : validateEmail(email) ? await User.findOne({ email }).exec() : null
    if(!user) return res.status(401).json({'message': 'Data is Incorrect!'})

    const correctPwd = await bcrypt.compare(password, user.password)
    if(!correctPwd) return res.status(401).json({'message': 'Wrong Password!'})

    user.active = true
    await user.save()

    

    const accessToken = jwt.sign(
        {
            "UserInfo": 
            {
                "id": user._id,
                "image": user.image?.length === 1 ? user.image : "",
                "username": user.username,
                "email": user.email,
                "active": user.active,
                "friends": user.friends
            }
        }, 
        //@ts-ignore
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: '15m' }
    )
    
    const refreshToken = jwt.sign(
        {
            "username": user.username
        }, 
        //@ts-ignore
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: '7d' }
    )

    res.cookie('jwt', refreshToken, 
    { 
        httpOnly: true, 
        secure: true, 
        sameSite: 'None', 
        maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({ accessToken })
}

async function refresh(req, res)
{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401).json({'message': 'Unauthorized By Server'})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken, 
        //@ts-ignore
        process.env.REFRESH_TOKEN_SECRET, 
        async (err, decoded) => 
        {
            if(err) return res.status(403).json({'message': 'Forbidden'})

            //@ts-ignore
            const user = await User.findOne({ username: decoded.username }).exec()
            if(!user) return res.status(401).json({'message': 'Unauthorized By Server!'})

            user.active = true
            await user.save()

            const accessToken = jwt.sign(
                {
                    "UserInfo": 
                    {
                        "id": user._id,
                        "image": user.image?.length === 1 ? user.image : "",
                        "username": user.username,
                        "email": user.email,
                        "active": user.active,
                        "friends": user.friends
                    }
                }, 
                //@ts-ignore
                process.env.ACCESS_TOKEN_SECRET,
                { expiresIn: '15m' }
            )

            res.json({ accessToken })
        }
    )
}

async function logout(req, res)
{
    const cookies = req.cookies
    if(!cookies?.jwt) return res.status(401).json({'message': 'Unauthorized By Server'})

    const refreshToken = cookies.jwt

    jwt.verify(
        refreshToken, 
        //@ts-ignore
        process.env.REFRESH_TOKEN_SECRET, 
        async (err, decoded) => 
        {
            if(err) return res.status(403).json({'message': 'Forbidden'})

            //@ts-ignore
            const user = await User.findOne({ username: decoded.username }).exec()
            if(!user) return res.status(401).json({'message': 'Unauthorized By Server!'})

            user.active = false
            await user.save()
        }
    )

    res.clearCookie('jwt')
    res.json({'message': 'Logged Out Successfully!'})
}

module.exports = { login, refresh, logout }