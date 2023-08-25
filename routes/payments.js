const router = require('express').Router()

const cybsAuthorization = require('../controllers/cybsAuthorization')

router.post('/authorize', cybsAuthorization.paymentAuthorization)

module.exports = router