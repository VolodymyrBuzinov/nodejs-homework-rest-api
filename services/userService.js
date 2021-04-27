const { UserRepository } = require('../repository/userRepository')
const fs = require('fs/promises')
const jimp = require('jimp')
const path = require('path')
require('dotenv').config()
const { v4: uuidv4 } = require('uuid')
const sgMail = require('@sendgrid/mail');
const Mailgen = require('mailgen');



class UserService {
  constructor() {
       this.repository = new UserRepository  
       this.path = 'http://localhost:3000'
       this.sgMail = sgMail
       this.mailgen = Mailgen
  }  
  
  #CREATE_TEMPLATE (verifyToken, name = 'User') {   
    const mailGenerator = new this.mailgen({
      theme: 'default',
      product: {          
          name: 'Contacts System',
          link: this.path          
      }
  });
  const template = {
    body: {
      name,
      intro: 'Welcome to Contacts System! We\'re very excited to have you on board.',
      action: {
          instructions: 'To get started with Contacts System, please click here:',
          button: {
              color: '#22BC66', 
              text: 'Confirm your account',
              link: `${this.path}/api/users/verify/${verifyToken}`
          }
      },
      outro: 'Need help, or have questions? Just reply to this email, we\'d love to help.'
  }
  }
  const templateBody = mailGenerator.generate(template);
  return templateBody
  }
  async addUser(body) {
    try {
      
      const {email, name} = body
      const verifyToken = uuidv4()
      const data =  await this.repository.addUser({...body, verifyToken})
      await this.sendEmail(verifyToken, email, name)
      return data
      
    } catch (error) {
      throw new Error(503, error.message, 'Service Unavaliable')
    }
    
  }
   async sendEmail(verifyToken, email, name) {
     const emailBody = this.#CREATE_TEMPLATE(verifyToken, name)
    this.sgMail.setApiKey(process.env.SENDGRID_API_KEY)
    const msg = {
      to: email, 
      from: 'vova.buzz@gmail.com', 
      subject: 'Sending with SendGrid is Fun',     
      html: emailBody,
    }
    await this.sgMail
      .send(msg)      
   }
  async getById(contactId) {
    const data = await this.repository.getById(contactId)
    return data
  }
  async getByEmail(email) {
    const data = await this.repository.getByEmail(email)    
    return data
  }
  async updateSubscription(userID, body) {
    const data = await this.repository.updateSubscription(userID, body)
    return data
  }
  async avatarUpload (userId, avatarPath, originalName) {
    const user = await this.getById(userId);
    const PUBLIC_DIR = path.join(process.cwd(), 'public', 'avatars');

    const img = await jimp.read(avatarPath);

    const imgName = `${user.email}${originalName}`;

    await img
      .autocrop()
      .cover(
        250,
        250,
        jimp.HORIZONTAL_ALIGN_CENTER || jimp.VERTICAL_ALIGN_CENTER,
      )
      .writeAsync(avatarPath);

    await fs.rename(avatarPath, path.join(PUBLIC_DIR, imgName));

    const url = `/avatars/${imgName}`;

    await this.repository.avatarUpload(userId, { avatarURL: url });

    return url;
  }
  async verification({verificationToken}) {
   const user = await this.repository.verification({verifyToken: verificationToken})
   return user;
  }
  async sendNewMail({email}) {
    try {
      const data = await this.repository.sendNewMaiL(email)      
      if (!data.verify) {
        this.sendEmail(data.verifyToken, email)
        return data
      }  
    } catch (error) {
      throw new Error(400, error.message, "Verification has already been passed")
    }    
  }
}

module.exports = { UserService }