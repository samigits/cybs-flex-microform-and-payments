const router = require('express').Router();

const generateCaptureContext = require('../controllers/microformController')

router.post('/captureContext', generateCaptureContext.generateCaptureContext)
router.post('/captureContextSdk', generateCaptureContext.captureContextFromSdk)
router.post('/tokenpay', generateCaptureContext.payWithTransientToken)
router.post('/verifyToken', generateCaptureContext.validateToken);
module.exports = router;