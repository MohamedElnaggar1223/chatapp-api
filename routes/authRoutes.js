const express = require('express')
const { login, refresh, logout } = require('../controllers/authController')
const router = express.Router()

router.route('/')
    .post(login)

router.route('/refresh')
    .get(refresh)

router.route('/logout')
    .post(logout)

module.exports = router