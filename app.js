"use strict"

// NPM PACKAGES
var express = require('express')
var multer = require('multer')
var schedule = require('node-schedule')
// var request = require('request')

var storage = multer.diskStorage({
  destination: 'public/uploads/',
  filename: (req, file, cb) => {
    var extArray = file.mimetype.split("/")
    var extension = extArray[extArray.length - 1]
    var randomID = Math.floor((Math.random() * 10000) + 1)
    cb(null, randomID + '.' + extension)
  }
})
var upload = multer({
  storage: storage
})

var app = express()

app.use(express.static('public'))

// INITIALIZERS
var cron = {}

// DATABASE SETUP
const mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var messageSchema = mongoose.Schema({
  type: String,
  date: String,
  time: String,
  assetManifest: Object,
  organization: String,
  groupNames: Array,
  id: Number
})
var Message = mongoose.model('Message', messageSchema)

var userSchema = mongoose.Schema({email: String, organization: String, password: String, webhook: Number})
var User = mongoose.model('User', userSchema)

// SERVER ROUTE FOR RECIEVING MESSAGE DATA
app.post('/submit-data', upload.single('uploadedImage'), function(req, res, next) {

  var id
  var name
  if (req.file) {
    name = req.file.filename
    id = name.split('.')[0]
  } else {
    id = Math.floor((Math.random() * 10000) + 1)
  }

  // saves message based on type
  switch (req.body.type.toLowerCase()) {
    case 'image':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
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
          req.app.locals.id = id
          req.app.locals.org = req.body.organization
          next()
        }
      })
      // res.redirect('back')
      break
    case 'text':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
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
          req.app.locals.id = id
          req.app.locals.org = req.body.organization
          next()
        }
      })
      // res.redirect('back')
      break
    case 'both':
      var newMsg = new Message({
        type: req.body.type,
        date: req.body.date,
        time: req.body.time,
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
          req.app.locals.id = id
          req.app.locals.org = req.body.organization
          next()
        }
      })
      // res.redirect('back')
      break
    default:
  }
}, (req, res, next) => {
  Message.findOne({ 'id': req.app.locals.id }, (err, msg) => {
    if (err) {
      console.log(err)
    } else {
      req.app.locals.message = msg
      console.log(req.app.locals.message)
    }
  })
  User.findOne({ 'organization': req.app.locals.org }, (err, user) => {
    if (err) {
      console.log(err)
    } else {
      // console.log(user)
      req.app.locals.webhook = user.webhook.toString()
      console.log(req.app.locals.webhook)
    }
  })
  next()
  }, (req, res, next) => {
    console.log('msg: ' + req.app.locals.message)
    console.log('webhook: ' + req.app.locals.webhook)
    // console.log('found: ' + msg)
    // var mth = Number(msg.date.split('-')[0])
    // var day = Number(msg.date.split('-')[1])
    // var year = Number(msg.date.split('-')[2])
    // var hour = tellTime(msg.time)
    var mth = 7
    var day = 18
    var year = 2017
    var hour = 22
    var min = 20
    var cronTime = '*' + ' ' + min + ' ' + hour + ' ' + day + ' ' + mth + ' ' + '*'
    console.log(cronTime)
    var url = 'https://chat-sass-messenger-uploader.herokuapp.com/' + req.app.locals.webhook
    var options = {
      method: 'post',
      body: req.app.locals.msg,
      json: true,
      url: url
    }
    cron[req.app.locals.id] = schedule.scheduleJob(cronTime, () => {
      // this is where you need to post data from to other server
        console.log('webhook: ' + webhook)
        // request(options, function(err, res, body) {
        //   if (err) {
        //     console.error('error posting json: ', err)
        //     throw err
        //   }
        //   var headers = res.headers
        //   var statusCode = res.statusCode
        //   console.log('headers: ', headers)
        //   console.log('statusCode: ', statusCode)
        //   console.log('body: ', body)
        // })

      console.log('Job Scheduled!!!! ' + cronTime)
      cron[req.app.locals.id].cancel()
    })
  res.redirect('back')
})

// HELPER FUNCTION
function tellTime(time) {
  var hour
  if (time.length === 4) {
    var timeOfDay = time.slice(2).toLowerCase()
    hour = Number(time.slice(0, 2))
    if (timeOfDay === 'pm') {
      if (hour < 12) {
        hour = hour + 12
      }
    } else {
      if (hour === 12 && timeOfDay === 'am') {
        hour = 0
      }
    }
  } else if (time.length === 3) {
    var timeOfDay = time.slice(1).toLowerCase()
    hour = Number(time.slice(0, 1))
    if (timeOfDay === 'pm') {
      if (hour < 12) {
        hour = hour + 12
      }
    } else {
      if (hour === 12 && timeOfDay === 'am') {
        hour = 0
      }
    }
  } else {}
  return hour
}

var port = process.env.PORT || 4000
app.listen(port, function() {
  console.log('Server running on port ' + port)
})

app.on('error', function() {
  console.log(error)
})
