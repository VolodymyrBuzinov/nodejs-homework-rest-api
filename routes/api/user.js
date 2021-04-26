const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')
const guard = require('../../helpers/guard')
const upload = require('../../helpers/multer')

router.get('/current', guard, userController.current)
router.get('/verify/:verificationToken', userController.verification)
router.post('/signup', userController.reg)
router.post('/login', userController.login)
router.post('/logout', guard, userController.logout)
router.patch('/', guard, userController.subscription)
router.patch(
    '/avatars',
    guard,
    upload.single('avatar'),
    userController.avatarUpload,
  );

module.exports = router