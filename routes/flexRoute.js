const router = require('express').Router();

const generateCaptureContext = require('../controllers/microformController')

router.post('/captureContext', generateCaptureContext.generateCaptureContext)

module.exports = router;