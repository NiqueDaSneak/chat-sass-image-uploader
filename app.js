"use strict"

// NPM PACKAGES
const express = require('express')
const multer = require('multer')
const schedule = require('node-schedule')
const request = require('request')
const cloudinary = require('cloudinary')
const moment = require('moment')

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
var date = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '')
cloudinary.config({
  cloud_name: 'affirmation-today',
  api_key: '758238269824916',
  api_secret: '3mX-vpSLM4IRVRUaHNh3ueWDzuU'
})

// DATABASE SETUP
const mongoose = require('mongoose')
// mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
mongoose.connect('mongodb://domclemmer:domclemmerpasswordirrigate@ds153173-a0.mlab.com:53173,ds153173-a1.mlab.com:53173/irrigate?replicaSet=rs-ds153173', {useMongoClient: true})
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var messageSchema = mongoose.Schema({
  date: String,
  time: String,
  text: String,
  image: String,
  videoURL: String,
  organization: String,
  groupNames: Array,
  id: String,
  createdDate: String
})
var Message = mongoose.model('Message', messageSchema)

var userSchema = mongoose.Schema({
  email: String,
  organization: String,
  onboarded: Boolean,
  username: String,
  userID: String,
  pageID: String,
  pageAccessToken: String,
  userAccessToken: String,
})

var User = mongoose.model('User', userSchema)

// SERVER ROUTE FOR RECIEVING MESSAGE DATA
app.post('/submit-data', upload.single('uploadedImage'), function(req, res, next) {
  var newMsg = new Message()
  var saveImage = new Promise(function(resolve, reject) {
    if (req.file) {
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
        newMsg.image = result.secure_url
        resolve()
      })
    } else {
      resolve()
    }
  })

  function guid() {
    function s4() {
      return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
    s4() + '-' + s4() + s4() + s4();
  }

  var saveStandardData = new Promise(function(resolve, reject) {
    newMsg.date = req.body.date
    newMsg.time = req.body.time
    newMsg.text = req.body.msgText
    newMsg.videoURL = req.body.videoURL
    newMsg.organization = req.body.organization
    newMsg.groupNames = req.body.groupNames
    newMsg.createdDate = moment().format('MM-DD-YYYY')
    newMsg.id = guid()
    resolve()
  })

  saveImage.then(() => {
    saveStandardData.then(() => {
      newMsg.save((err, msg) => {
        if (err) {
          return console.error(err)
        } else {
          console.log('saving...')
          req.app.locals.msg = msg
          next()
        }
      })

    })
  })
}, (req, res, next) => {
  console.log('in next')
  console.log(req.app.locals.msg)

  var mth = Number(req.app.locals.msg.date.split('-')[1]) - 1
  var day = Number(req.app.locals.msg.date.split('-')[2])
  var year = Number(req.app.locals.msg.date.split('-')[0])
  var hour = Number(req.app.locals.msg.time.split(':')[0])
  var min = Number(req.app.locals.msg.time.split(':')[1])
  console.log('id: ' + req.app.locals.msg._id)
  var schedDate = new Date(year, mth, day, hour, min, 0)
      var cron = schedule.scheduleJob(schedDate, () => {
        var url = 'https://chat-sass-messenger-uploader.herokuapp.com/'
        // var url = 'http://localhost:5000/'
        console.log(url)
        var options = {
          method: 'post',
          body: req.app.locals.msg,
          json: true,
          url: url
        }
        console.log('Scheduled Job Just Ran! at: ' + schedDate)

        // this is where you need to post data from to other server
        request(options, function(err, res, body) {
          if (err) {
            console.error('error posting json: ', err)
            throw err
          }
          var headers = res.headers
          var statusCode = res.statusCode
          console.log('headers: ', headers)
          console.log('statusCode: ', statusCode)
          console.log('body: ', body)
        })
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
