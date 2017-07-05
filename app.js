"use strict"

var express = require('express')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

const app = express()

app.post('/submit-image', upload.single('uploadedImage'), function(req, res) {
  console.log(req.file)
  console.log(req.files)
  console.log(req.body)
  res.sendStatus(200)
})

var port = process.env.PORT || 3000;
app.listen(port, function(){
  console.log('Server running on port ' + port)

})

app.on('error', function(){
  console.log(error)
})

module.exports = app
