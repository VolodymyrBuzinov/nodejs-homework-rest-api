const { UserRepository } = require('../repository/userRepository')
const jwt = require('jsonwebtoken')
const { isError } = require('joi')
require('dotenv').config()
const SECRET_KEY = process.env.JWT_KEY
class AuthService {
  constructor() {
    this.repository = new UserRepository()
    
    
  }

  async login(email, password) {
    const user = await this.repository.getByEmail(email)  
     
    if (!user || !user.validPassword(password) || !user.verify ) {
     return null
    }
    const id = user.id
    const payload = {id}
    const token = jwt.sign(payload, SECRET_KEY, {expiresIn: '1h'})
    await this.repository.updateToken(id, token)
    return {
      token,
      user: { email: user.email, subscription: user.subscription },
    };
  }

  async logout(contactId) {
    const data = await this.repository.updateToken(contactId, null)
    return data
  }
   
  async current(email) {
    const data = await this.repository.getByEmail(email)
    return { email: data.email, subscription: data.subscription, verify: data.verify, verifyToken: data.verifyToken };
  }
}

module.exports = { AuthService }