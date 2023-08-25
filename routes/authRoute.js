const router = require('express').Router();

const payerAuthentication = require('../controllers/payerAuthentication');

router.post('/setup', payerAuthentication.setupAuthentication)
router.post('/enrollment', payerAuthentication.checkEnrollement)
router.get('/validate', payerAuthentication.validateAuthentication)

module.exports = router;