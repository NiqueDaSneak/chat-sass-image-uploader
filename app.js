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

// SERVER ROUTE FOR RECIEVING MESSAGE DATA
app.post('/submit-data', upload.single('uploadedImage'), function(req, res, next) {
  // promises
  var id
  var step1 = new Promise(function(resolve, reject) {
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
          resolve()
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
          resolve()
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
          resolve()
        }
      })
      // res.redirect('back')
      break
      default:
    }
  })

  var step2 = new Promise(function(resolve, reject) {
    console.log(id)
    Message.findOne({ id: id }, (err, msg) => {
      if (err) {
        console.log(err)
        resolve()
      } else {
        console.log('found: ' + msg)
        resolve()
      }
    })
  })
  step1.then(() => {
    step2.then(() => {
      res.redirect('back')
    })
  })

})

// , (req, res, next) => {
//   console.log('from second request handler')
//   console.log('body: ' + req.body)
//   Message.findOne({ id: req.body.id }, (err, msg) => {
//     if (err) {
//       console.log(err)
//     } else {
//       console.log('found: ' + msg)
//     }
//   })
//   res.redirect('back')
//   // var mth = Number(msg.date.split('-')[0])
//           // var day = Number(msg.date.split('-')[1])
//           // var year = Number(msg.date.split('-')[2])
//           // var hour = tellTime(msg.time)
//   var mth = 7
//   var day = 14
//   var year = 2017
//   var hour = 2
//   var min = 49
//   var cronTime = '*' + ' ' + min + ' ' + hour + ' ' + day + ' ' + mth + ' ' + '*'
//   // console.log(cronTime)
//   // cron[msg.id] = schedule.scheduleJob(cronTime, () => {
//     // this is where you need to post data from to other server
//     // User.findOne({
//     //   organization: msg.organization
//     // }, (err, user) => {
//     //   var url = 'https://chat-sass-messenger-uploader.herokuapp.com/' + user.webhook
//     //   var options = {
//     //     method: 'post',
//     //     body: msg,
//     //     json: true,
//     //     url: url
//     //   }
//     //   request(options, function(err, res, body) {
//     //     if (err) {
//     //       console.error('error posting json: ', err)
//     //       throw err
//     //     }
//     //     var headers = res.headers
//     //     var statusCode = res.statusCode
//     //     console.log('headers: ', headers)
//     //     console.log('statusCode: ', statusCode)
//     //     console.log('body: ', body)
//     //   })
//     // })
//   //   console.log('Job Scheduled!!!! ' + cronTime)
//   //   cron[msg.id].cancel()
//   // })
// })

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
