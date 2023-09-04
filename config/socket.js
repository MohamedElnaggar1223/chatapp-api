const { Server } = require('socket.io')
const express = require('express')
const app = express()
const { createServer } = require('http')

const httpServer = createServer(app)

const io = new Server( httpServer,
    {
        pingTimeout: 60000,
        cors: 
        {
            origin: 'https://chatapp-najajer.onrender.com'
        }
    })

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('typing', ({userId, friendId}) => io.emit(`${userId}typingto${friendId}`))
    });

//@ts-ignore

// io.on('typing', (userId) => console.log('hmmmmmmm'))

module.exports = {io, httpServer, app}