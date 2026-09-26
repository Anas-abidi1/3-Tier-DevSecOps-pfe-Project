const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, isAdmin } = require('../middleware/auth');

// Any authenticated user (viewer or admin) can view and add users.
// If listing users should be admin-only in your app, add `isAdmin` here too.
router.get('/', verifyToken, userController.getAllUsers);
router.post('/', verifyToken, userController.addUser);

// Only admin can update or delete
router.put('/:id', verifyToken, isAdmin, userController.updateUser);
router.delete('/:id', verifyToken, isAdmin, userController.deleteUser);

module.exports = router;
