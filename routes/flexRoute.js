const router = require('express').Router();

const generateCaptureContext = require('../controllers/microformController')

router.post('/captureContext', generateCaptureContext.generateCaptureContext)
router.post('/captureContextSdk', generateCaptureContext.captureContextFromSdk)
router.post('/tokenpay', generateCaptureContext.payWithTransientToken)
module.exports = router;