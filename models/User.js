const mongoose = require('mongoose')
const Schema = mongoose.Schema

const User = new Schema(
    {
        image: 
        {
            type: String,
            index: true
        },
        username: 
        {
            required: true,
            type: String,
            index: true
        },
        email: 
        {
            required: true,
            type: String,
            index: true
        },
        password: 
        {
            required: true,
            type: String,
            index: true
        },
        friends:
        {
            type: [Schema.Types.ObjectId],
            ref: 'User',
            default: [],
            index: true
        },
        active:
        {
            type: Boolean,
            default: true,
            index: true
        }
    })

module.exports = mongoose.model("User", User)