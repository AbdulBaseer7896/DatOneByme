// routes/dataSession.js

const express = require('express');
const router = express.Router();
const dataSessionController = require('../controllers/dataSessionController');
const auth = require('../middleware/auth');

router.use(auth)

router.get('/', dataSessionController.getDataSession);
router.post('/', dataSessionController.createDataSession);
router.put('/:dataSessionId', dataSessionController.updateDataSession);
router.delete('/:dataSessionId', dataSessionController.deleteDataSession);

module.exports = router;
