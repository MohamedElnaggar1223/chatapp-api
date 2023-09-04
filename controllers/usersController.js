const User = require('../models/User')
const Message = require('../models/Message')
const bcrypt = require('bcrypt')
const validateEmail = require('../config/validateEmail')

async function getAllUsers(req, res)
{
    const users = await User.find().select("-password").lean().exec()
    if(!users?.length) return res.status(400).json({'message': 'No Users Found!'})
    res.status(200).json(users)
}

async function addNewUser(req, res)
{
    const { image, email, username, password } = req.body
    if(!username || !email || !validateEmail(email) || !password) return res.status(400).json({'message': 'All Fields Must Be Given!'})

    const duplicateName = await User.findOne({ username }).lean().exec()
    if(duplicateName) return res.status(400).json({'message': 'Username Already Exists!'})

    const duplicateEmail = await User.findOne({ email }).lean().exec()
    if(duplicateEmail) return res.status(400).json({'message': 'Email Already Exists!'})

    const hashedPwd = await bcrypt.hash(password, 10)


    const createdUser = 
    image 
    ? {
        image,
        username,
        email,
        "password": hashedPwd
    }
    : {
        image: `${Math.floor(Math.random() * 5)}`,
        username,
        email,
        "password": hashedPwd
    }

    const user = await User.create(createdUser)
    user ? res.status(201).json({'message': `User ${user.username} Created Successfully!`}) : res.status(400).json({'message': 'Something Went Wrong!'})
}

async function updateUser(req, res)
{
    const { image, id, username, password } = req.body
    if(!id || !username) return res.status(400).json({'message': 'All Fields Must Be Given'})
    
    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    const duplicate = await User.findOne({ username }).collation({ locale: 'en', strength: 2 }).lean().exec()
    if(duplicate && duplicate?._id.toString() !== id) return res.status(400).json({'message': 'Username Already Exists'})

    user.username = username
    if(password)
    {
        const hashedPwd = await bcrypt.hash(password, 10)
        user.password = hashedPwd
    }
    if(image)
    {
        user.image = image
    }

    const updatedUser = await user.save()
    res.status(200).json({'message': `User ${updatedUser.username} Has Been Updated Successfully`})
}

async function deleteUser(req, res)
{
    const { id } = req.body
    if(!id) return res.status(400).json({'message': 'ID Must Be Given!'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    const deletedUser = await user.deleteOne()
    res.status(200).json({'message': `User ${deletedUser.username} Has Been Deleted Successfully`})
}

async function getFriends(req, res)
{
    const { id } = req.params
    if(!id) return res.status(400).json({'message': 'Username Must Be Given!'})

    const user = await User.findById(id).lean().exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    const friends = user.friends
    if(!Array.isArray(friends) || !friends?.length) return res.json([])

    const friendsArray = await Promise.all(friends.map(async (friend) => 
    {
        const friendData = await User.findById(friend).select("username image").lean().exec()
        const lastMessage = ((await Message.find({ sender: friendData?._id, receiver: id }).sort({createdAt: 'descending'}).lean().exec()).concat(await Message.find({ receiver: friendData?._id, sender: id }).sort({createdAt: 'descending'}).lean().exec())).sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime())[0]
        return {...friendData, lastMessage: { message: lastMessage?.message, createdAt: lastMessage?.createdAt }}
    }))
    //console.log('Received Friends Array')
    res.status(200).json(friendsArray)
}

async function addFriend(req, res)
{
    const { id, friendId } = req.body
    if(!id || !friendId) return res.status(400).json({'message': 'All Fields Must Be Given'})

    if(id === friendId) return res.status(400).json({'message': 'You Can Not Add Yourself!'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    const friend = await User.findById(friendId).lean().exec()
    if(!friend) return res.status(400).json({'message': 'This User Does Not Exist!'})

    user.friends.push(friendId)

    await user.save()
    res.status(200).json({'message': `${friend.username} Added as a Friend!`})
}

async function deleteFriend(req, res)
{
    const { id, friendId } = req.body
    if(!id || !friendId) return res.status(400).json({'message': 'All Fields Must Be Given'})

    const user = await User.findById(id).exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    const friend = await User.findById(friendId).lean().exec()
    if(!friend) return res.status(400).json({'message': 'This User Does Not Exist!'})

    const friendsArray = user.friends
    const filteredFriendsArray = friendsArray.filter((friend) => friend._id.toString() !== friendId)
    user.friends = filteredFriendsArray
    await user.save()
    res.status(200).json({'message': `${friend.username} Was Removed From Friends!`})
}

async function getMyImage(req, res)
{
    const { id } = req.params
    if(!id) return res.status(400).json({'message': 'ID Must Be Given!'})

    const user = await User.findById(id).lean().exec()
    if(!user) return res.status(400).json({'message': 'User Does Not Exist!'})

    if(user.image) res.json(user.image)
    else res.json("")
}

module.exports = { getAllUsers, getFriends, addNewUser, updateUser, deleteUser, addFriend, deleteFriend, getMyImage }