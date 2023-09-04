require('dotenv').config()
require('express-error-handler')
require('./config/socket')
const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const corsOptions = require('./config/corsOptions')
const { logger, logEvents } = require('./middleware/logger')
const errorHandler = require('./middleware/errorHandler')
const connectDB = require('./config/dbConn')
const path = require('path')
const {io, httpServer, app} = require('./config/socket')
const PORT = process.env.PORT || 3001

connectDB()
app.use(logger)
app.use(cors(corsOptions))
app.use(cookieParser())
app.use(express.json())
app.use(express.static(path.join(__dirname, 'public')))

app.use('/', require(path.join(__dirname, 'routes', 'root')))
app.use('/messages', require(path.join(__dirname, 'routes', 'messagesRoutes')))
app.use('/users', require(path.join(__dirname, 'routes', 'usersRoutes')))
app.use('/auth', require(path.join(__dirname, 'routes', 'authRoutes')))

app.all('*', (req, res) => 
{
    if(req.accepts('html'))
    {
        res.sendFile(path.join(__dirname, 'views', '404.html'))
    }
    else if(req.accepts('json'))
    {
        res.json({'message': 'File Not Found'})
    }
    else
    {
        res.send('File Not Found')
    }
})

app.use(errorHandler)

mongoose.connection.once('open', () =>
{
    console.log("MongoDB is Connected")
    httpServer.listen(PORT, () => console.log(`Server Running On Port ${PORT}`))
})


mongoose.connection.on('error', (err) => 
{
    console.log(err)
    logEvents(`${err.no}: ${err.code}\t${err.syscall}\t${err.hostname}`, 'mongoErrLog.log')
})

module.exports = httpServer