const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Message = new Schema(
    {
        receiver: 
        {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        sender: 
        {
            required: true,
            type: Schema.Types.ObjectId,
            ref: "User",
            index: true
        },
        message:
        {
            type: String,
            required: true,
            index: true
        },
        senderUsername: String,
        receiverUsername: String
    },
    {
        timestamps: true
    }
)

module.exports = mongoose.model('Message', Message)