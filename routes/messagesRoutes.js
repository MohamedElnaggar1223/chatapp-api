const express = require('express')
const { getMessages, getFriendsMessages, sendNewMessage } = require('../controllers/messagesController')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')

router.use(verifyJWT)

router.route('/:id/:friendId')
    .get(getFriendsMessages)

router.route('/')
    .get(getMessages)
    .post(sendNewMessage)

module.exports = router