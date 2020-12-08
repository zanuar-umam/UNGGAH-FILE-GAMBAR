const router = require('express').Router()
const Item = require('../models/itemModel')
const auth = require('../middleware/auth')
const {upload} = require('../middleware/multer') 

router.get('/', auth, async(req, res, next) => {
  try{
    const result = await Item.find()
    if(!result) res.json({status: 0, message: 'Data Not Found'})
    res.json({
      status: 1,
      result
    })
  }catch(err){
    res.status(500).json(err)
  }
})

router.get('/:id', auth, async(req, res, next) => {
  try{
    const {id} = req.params
    const result = await Item.findById(id)
    if(!result) res.json({
      status: 0,
      message: 'Data not found!'
    })
    res.json({
      status: 1,
      result
    })
  }catch(err){
    res.status(500).json(err)
  }
})

router.post('/add', auth, upload.single('iamge'), async(req, res, next) => {
  try{
    const {item, price, stock, description} = req.body
    const convertedPrice = Number(price)
    const convertedStock = Number(stock)
    const image = req.file.filename

    const newItem = new Item({
      item, price: convertedPrice, stock: convertedStock, description, image
    })

    const result = await newItem.save()
    if(!result) res.json({
      status: 0,
      message: 'Data failed to added'
    })
    res.json({
      status: 1,
      message: 'Data Added!'
    })
    
  }catch(err) {
    res.status(500).json(err)
  }
})

router.post('/update/:id', auth, upload.single('image'), async(req, res, next) => {
  try{
    const {id} = req.params
    const {item, price, stock, description} = req.body
    const image = req.file.filename
    const convertedPrice = Number(price)
    const convertedStock = Number(stock)
    const result = await Item.findByIdAndUpdate(id, 
      { 
        item, 
        price: convertedPrice,
        stock: convertedStock, 
        description,
        image
      })
    if(!result) res.json({
      status: 0,
      message: 'Data failed to updated!'
    })
    res.json({
      status: 1,
      message: 'Data Updated!'
    })
  }catch(err){
    res.status(500).json(err)
  }
})

router.delete('/:id', auth, async(req, res) => {
  try{
    const {id} = req.params
    const result = await Item.findByIdAndRemove(id)
    if(!result) res.json({
      status: 0,
      message: 'Data failed to deleted!'
    })
    res.json({
      status: 1,
      message: 'Data Deleted!'
    })
  }catch(err){
    res.status(500).json(err)
  }
})

module.exports = router