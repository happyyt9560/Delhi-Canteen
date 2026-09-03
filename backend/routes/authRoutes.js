const router=require('express').Router(),c=require('../controllers/authController');router.post('/login',c.login);router.post('/customer/register',c.register);module.exports=router;
