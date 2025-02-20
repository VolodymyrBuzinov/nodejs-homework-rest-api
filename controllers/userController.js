const { codes } = require('../helpers/constants')
const {UserService} = require('../services/userService')
const {AuthService} = require('../services/authService')

const serviceUser = new UserService()
const serviceAuth = new AuthService()
const reg = async (req, res, next) => {
   const {email} = req.body
   const user = await serviceUser.getByEmail(email)
   if (user) {
     return next({
       status: codes.CONFLICT,
       message: 'Email in use',
       data: 'Conflict'
     })
   }
   try {
   const newUser = await serviceUser.addUser(req.body)
   return res.status(codes.CREATED).json({
      status: 'success',
      code: codes.CREATED,
      data: {
        id: newUser.id,
        email: newUser.email,
        subscribition: newUser.subscribition,
      }
   })
   } catch(err) {
     next(err)
   }
  }
  const login = async (req, res, next) => {
    const {email, password} = req.body
    try {
      const token = await serviceAuth.login(email, password)
      if (token) {
        return res.status(codes.OK).json({
          status: 'success',
          code: codes.OK,
          data: {
            token, 
          }
       })
      }
      next({
        status: codes.UNAUTHORIZED,
        message: 'Email or password is wrong',
        data: 'Unauthorized'
      })
    } catch (error) {
      next(error)
    }
}
const logout = async (req, res, next) => {
  try {
    const userId = req.user.id;
    await serviceAuth.logout(userId);

    return res
      .status(codes.NO_CONTENT)
      .json({ status: 'success', message: 'success', code: codes.NO_CONTENT });
  } catch (error) {
    next(error);
  }
}

const current = async (req, res, next) => {  
  try {
    const userEmail = req.user.email;
     
    const user = await serviceAuth.current(userEmail);

    return res
      .status(codes.OK)
      .json({ status: 'success', code: codes.OK, data: user });
  } catch (error) {
    next(error);
  }
}
const subscription = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const updatedUser = await serviceUser.updateSubscription(
      userId,
      req.body,
    );

    return res
      .status(codes.OK)
      .json({
        status: 'success',
        code: codes.OK,
        data: {
          email: updatedUser.email,
          subscription: updatedUser.subscription,
        },
      });
  } catch (error) {
    next(error);
  }
}
const avatarUpload = async (req, res, next) => { 
      try {
    const userId = req.user.id;
    const path = req.file.path
    const originalName = req.file.originalname
    if (req.file) {
      const url = await serviceUser.avatarUpload(userId, path, originalName);
       
      return res.status(codes.OK).json({
        status: 'success',
        code: codes.OK,
        data: {
          email: req.user.email,
          avatarURL: url,
        },
      });
  }} catch (error) {
    next(error)
  }
}
const verification = async (req, res, next) => {
try {
  const result = serviceUser.verification(req.params)
  if(result) {
    return res.status(codes.OK).json({
      status: 'success',
      code: codes.OK,
      data: {
        message: 'Verification successful'
      },
    });
  }
  return next({
    message: 'User not found'
  })
} catch (error) {
  next(error)
}
}
const sendNewMail = async (req, res, next) => {
try {
  const result = await serviceUser.sendNewMail(req.body)
  
  if(result) {
    return res.status(codes.OK).json({
      status: 'success',
      code: codes.OK,
      data: {
        message: 'Verification email sent'
      },
    });
  }
  return next({
    message: 'Verification has already been passed'
  })
} catch (error) {
  next(error)
}
}


module.exports = {reg, login, logout, current, subscription, avatarUpload, verification, sendNewMail}