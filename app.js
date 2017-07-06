var express = require('express')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var app = express()

// DATABASE SETUP
const mongoose = require('mongoose')
mongoose.connect('mongodb://dom:Losangeleslakers47@ds123182.mlab.com:23182/chat-sass-frontend')
var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
var messageSchema = mongoose.Schema({type: String, date: String, assetManifest: Object, organization: String, groupNames: Array, id: Number})
var Message = mongoose.model('Message', messageSchema)

app.post('/submit-data', upload.single('uploadedImage'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file)
  console.log(req.body)
})

var port = process.env.PORT || 4000
app.listen(port, function(){
  console.log('Server running on port ' + port)

})

app.on('error', function(){
  console.log(error)
})
