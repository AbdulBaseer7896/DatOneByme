// routes/user.js

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.use(auth)

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.put('/:userId', userController.updateUser);
router.post('/permissions', userController.createUserPermission);
router.put('/permissions/:userId', userController.updateUserPermission);
router.get('/session/:userId', userController.getUserSession);
router.delete('/session/:sessionId', userController.deleteUserSession);
router.delete('/:userId', userController.deleteUser);

module.exports = router;
