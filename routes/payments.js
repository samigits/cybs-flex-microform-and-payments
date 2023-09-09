const router = require('express').Router()

const cybsAuthorization = require('../controllers/cybsAuthorization')

router.post('/authorize', cybsAuthorization.paymentAuthorization)
router.post('/payWithTransientToken', cybsAuthorization.authWithTransientToken)

module.exports = router