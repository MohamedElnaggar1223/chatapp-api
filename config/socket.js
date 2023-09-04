const { Server } = require('socket.io')
const PORT = process.env.PORT || 3002

const io = new Server(
    {
        pingTimeout: 60000,
        cors: 
        {
            origin: 'http://localhost:3000'
        }
    })

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('typing', ({userId, friendId}) => io.emit(`${userId}typingto${friendId}`))
    });

//@ts-ignore
io.listen(PORT)

// io.on('typing', (userId) => console.log('hmmmmmmm'))

module.exports = io