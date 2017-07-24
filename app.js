"use strict"

// NPM PACKAGES
var express = require('express')
var multer = require('multer')
var schedule = require('node-schedule')
var request = require('request')
var cloudinary = require('cloudinary')

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
  var imgURL
  if (req.file) {
    name = req.file.filename
    id = name.split('.')[0]
  } else {
    id = Math.floor((Math.random() * 10000) + 1)
  }
  // saves message based on type
  switch (req.body.type.toLowerCase()) {
    case 'image':
        cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
            imgURL = result.secure_url
            req.app.locals.imgUrl = result.secure_url
        }).then(() => {
          var newMsg = new Message({
            type: req.body.type,
            date: req.body.date,
            time: req.body.time,
            assetManifest: {
              image: imgURL,
            },
            organization: req.body.organization,
            id: id,
            groupNames: req.body.groupNames
          }).save((err, msg) => {
            if (err) {
              return console.error(err)
            } else {
              req.app.locals.id = id
              req.app.locals.org = req.body.organization
              next()
            }
          })
        })
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
        id: id,
        groupNames: req.body.groupNames
      }).save((err, msg) => {
        if (err) {
          return console.error(err)
        } else {
          req.app.locals.id = id
          req.app.locals.org = req.body.organization
          next()
        }
      })
      // res.redirect('back')
      break
    case 'both':
      cloudinary.v2.uploader.upload(req.file.path, (error, result) => {
          imgURL = result.secure_url
          req.app.locals.imgUrl = result.secure_url
      }).then(() => {
        var newMsg = new Message({
          type: req.body.type,
          date: req.body.date,
          time: req.body.time,
          assetManifest: {
            image: imgURL,
            text: req.body.msgText
          },
          organization: req.body.organization,
          id: id,
          groupNames: req.body.groupNames
        }).save((err, msg) => {
          if (err) {
            return console.error(err)
          } else {
            req.app.locals.id = id
            req.app.locals.org = req.body.organization
            next()
          }
        })
      })
      break
    default:
  }
}, (req, res, next) => {
  var message
  var webhook

  Message.findOne({ 'id': req.app.locals.id }, (err, msg) => {
    if (err) {
      console.log(err)
    } else {
      message = msg
    }
  })

  User.findOne({ 'organization': req.app.locals.org }, (err, user) => {
    if (err) {
      console.log(err)
    } else {
      webhook = user.webhook.toString()
    }
  })

    // var mth = Number(msg.date.split('-')[0])
    // var day = Number(msg.date.split('-')[1])
    // var year = Number(msg.date.split('-')[2])
    // var hour = tellTime(msg.time)
    var mth = 6
    var day = 24
    var year = 2017
    var hour = 15
    var min = 44
    // var cronTime = '*' + ' ' + min + ' ' + hour + ' ' + day + ' ' + mth + ' ' + '*'
    var schedDate = new Date(year, mth, day, hour, min, 0 )

    var cron = schedule.scheduleJob(schedDate, () => {
      var url = 'https://chat-sass-messenger-uploader.herokuapp.com/' + webhook
      // var url = 'http://localhost:5000/' + webhook
      console.log(url)
      var options = {
        method: 'post',
        body: message,
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
