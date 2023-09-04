const express = require('express')
const { getAllUsers, addNewUser, updateUser, deleteUser, getFriends, addFriend, deleteFriend, getMyImage } = require('../controllers/usersController')
const router = express.Router()
const verifyJWT = require('../middleware/verifyJWT')

router.route('/')
    .get(verifyJWT, getAllUsers)
    .post(addNewUser)
    .patch(verifyJWT, updateUser)
    .delete(verifyJWT, deleteUser)

router.route('/friends')
    .post(verifyJWT, addFriend)
    .delete(verifyJWT, deleteFriend)

router.route('/friends/:id')
    .get(verifyJWT, getFriends)

router.route('/:id/myimage')
    .get(getMyImage)
module.exports = router