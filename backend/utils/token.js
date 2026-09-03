const jwt=require('jsonwebtoken');module.exports=user=>jwt.sign({id:user.id,role:user.role},process.env.JWT_SECRET||'development_secret_change_me',{expiresIn:process.env.JWT_EXPIRES_IN||'7d'});
