const User = require('../models/User')
const { io } = require('../config/socket')
const Message = require('../models/Message')

async function getMessages(req, res)
{
    const messages = await Message.find().select("-updatedAt -__v").lean().exec()

    if(!messages || !messages?.length) return res.status(400).json({'message': 'No Messages Found!'})

    // const messagesWithNames = await Promise.all(messages.map(async (message) =>
    // {
    //     const sender = await User.findById(message.sender)
    //     const receiver = await User.findById(message.receiver)
    //     console.log('users read from mongodb')
    //     return {...message, senderUsername: sender?.username, receiverUsername: receiver?.username}
    // }))

    //console.log('messages received')
    res.status(200).json(messages)
}

async function getFriendsMessages(req, res)
{
    const { id, friendId } = req.params
    const messages = (await Message.find({ sender: id, receiver: friendId }).select("-updatedAt -__v").lean().exec()).concat(await Message.find({ sender: friendId, receiver: id }).select("-updatedAt -__v").lean().exec())
    if(!messages || !messages?.length) return res.status(400).json({'message': 'No Messages Found!'})

    const messagesWithNames = await Promise.all(messages.map(async (message) =>
    {
        const sender = await User.findById(message.sender)
        const receiver = await User.findById(message.receiver)
        return {...message, senderUsername: sender?.username, receiverUsername: receiver?.username}
    }))

    res.status(200).json(messagesWithNames)
}

async function sendNewMessage(req, res)
{
    const { sender, receiver, message } = req.body
    if(!sender || !receiver || !message) return res.status(400).json({'message': 'All Fields Must Be Given!'})

    if(sender === receiver) return res.status(400).json({'message': 'Can Not Send Message To Yourself!'})

    const senderUser = await User.findById(sender).lean().exec()
    if(!senderUser) return res.status(400).json({'message': 'User Not Found!'})

    const receiverUser = await User.findById(receiver).lean().exec()
    if(!receiverUser) return res.status(400).json({'message': 'User Not Found!'})

    const messageCreated = await Message.create({ sender, receiver, message, senderUsername: senderUser.username, receiverUsername: receiverUser.username })
    io.emit('newMessageSent', ({ sender, receiver }))
    // await Message.deleteMany({ message })
    res.status(200).json({'message': `${senderUser.username} Sent a Message to ${receiverUser.username}`})
}

module.exports = { getMessages, getFriendsMessages, sendNewMessage }