const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Routes

router.get('/', userController.view);
//router.post('/', userController.find);
router.post('/result', userController.finds);
router.post('/user', userController.finduser);
router.get('/result', userController.views);
router.get('/user', userController.userviews);
router.get('/login', userController.loginform);
router.get('/logout', userController.logoutUser);
router.get('/signup', userController.signupform);
router.post('/signup', userController.signupUser);
router.post('/login', userController.loginUser);
router.get('/adduser', userController.form);
router.post('/adduser', userController.create);
router.get('/addresult', userController.forms);
router.post('/addresult', userController.creates);
router.get('/edituser/:id', userController.edit);
router.post('/editusernew/:id', userController.updateuser);
router.get('/edit/:id', userController.edituser);
router.post('/edituser/:id', userController.update);
router.get('/viewuser/:id', userController.viewall);
router.get('/viewresult/:id', userController.viewalls);
router.get('/:id',userController.delete);
router.get('/delete/:id',userController.deleteuser);
  
module.exports = router;