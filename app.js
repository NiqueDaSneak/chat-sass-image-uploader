"use strict"

// NPM PACKAGES
var express = require('express')
var multer = require('multer')

var storage = multer.diskStorage({
  destination: 'uploads/',
  filename: (req, file, cb) => {
    var extArray = file.mimetype.split("/")
    var extension = extArray[extArray.length - 1]
    var randomID = Math.floor((Math.random() * 10000) + 1)
    cb(null, randomID + '.' + extension)
  }
})
var upload = multer({ storage: storage })

var app = express()

// DATABASE SETUP
const mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var messageSchema = mongoose.Schema({
  type: String,
  date: String,
  assetManifest: Object,
  organization: String,
  groupNames: Array,
  id: Number
})
var Message = mongoose.model('Message', messageSchema)

// SERVER ROUTE FOR RECIEVING MESSAGE DATA
app.post('/submit-data', upload.single('uploadedImage'), function(req, res, next) {
  var name
  var id
  if (req.file) {
    name = req.file.filename
    id = name.split('.')[0]
  }

  // saves message based on type
  switch (req.body.type.toLowerCase()) {
    case 'image':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        assetManifest: {
          image: req.file.filename
        },
        organization: req.body.organization,
        id: id
      }).save((err, msg) => {
        if (err) {
          return console.error(err)
        } else {
          console.log('message saved:' + msg)
        }
      })
      res.redirect('back')
      break
    case 'text':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        assetManifest: {
          text: req.body.msgText
        },
        organization: req.body.organization,
        id: id
      }).save((err, msg) => {
        if (err) {
          return console.error(err)
        } else {
          console.log('message saved:' + msg)
        }
      })
      res.redirect('back')
      break
    case 'both':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        assetManifest: {
          text: req.body.msgText,
          image: req.file.filename
        },
        organization: req.body.organization,
        id: id
      }).save((err, msg) => {
        if (err) {
          return console.error(err)
        } else {
          console.log('message saved:' + msg)
        }
      })
      res.redirect('back')
      break
    default:
  }
})

var port = process.env.PORT || 4000
app.listen(port, function() {
  console.log('Server running on port ' + port)
})

app.on('error', function() {
  console.log(error)
})
