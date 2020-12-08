const router = require('express').Router()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {upload} = require('../middleware/multer')
const auth = require('../middleware/auth')
const User = require('../models/userModel')

router.post('/register', upload.single('image'),  async(req, res, next) => {
  try{
    const {username, email, password, passwordCheck, address} = req.body
    const image = req.file.filename

    if(!username || !email || !password|| !image) 
      res.status(400).json({
        status: 0,
        message: "Not all fields have been entered."
    })

    if(password < 6) res.status(400).json({
      status: 0,
      message: "Password needs to be at least 6 characters long."
    })

    if(password != passwordCheck) res.status(400).json({
      status: 0,
      message: "Enter the same password for checking!"
    })

    const existingEmail = await User.findOne({email})
    if(existingEmail) res.status(400).json({
      status: 0,
      message: "Email already exist."
    })

    const salt = await bcrypt.genSalt()
    const passwordHash = await bcrypt.hash(password, salt)

    const newUser = new User({
      username, email, password : passwordHash, address, image
    })
    
    const result = await newUser.save()
    
    if(!result) res.status(400).json({
      status: 0,
      message: "Fail to added."
    })
    res.json({
      status: 1,
      message: "Data added."
    })

  }catch(err){
    res.status(500).json(err)
  }
})

router.post('/login', async(req, res) => {
  try{
    const { email, password } = req.body

    if(!email || !password) return res.status(400).json({
      status: 0,
      message: "Not all fields have been entered."
    })

    const user = await User.findOne({email})
    if(!user) return res.status(400).json({
      status: 0,
      message: "There's no data has been registered with this email."
    })

    const isMatch = await bcrypt.compare(password, user.password)
    if(!isMatch) return res.status(400).json({
      status: 0,
      message: "Your email or password is incorrect."
    })

    const token = jwt.sign(user.id, process.env.JWT_SECRET)
    return res.json({
      status: 1,
      token,
      message: 'Success to logged in.',
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    })
    
  }catch(err){
    res.status(500).json({error : err.message})
  }
})

router.delete('/delete', auth, async(req, res) => {
  try{
    const deleted = await User.findByIdAndRemove(req.user)
    if(!deleted) res.status(400).json({
      status: 0,
      message: "Failed to delete."
    })
    res.json({
      status: 1,
      message: "Data Deleted"
    })
  }catch(err){
    res.status(500).json({error : err.message})
  }
})

module.exports = router