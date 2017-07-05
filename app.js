"use strict"

var Express = require('express')
var multer = require('multer')
var bodyParser = require('body-parser')
var app = Express()
app.use(bodyParser.json())
var Storage = multer.diskStorage({
    destination: function (req, file, callback) {
        callback(null, "./Images")
    },
    filename: function (req, file, callback) {
        callback(null, file.fieldname + "_" + Date.now() + "_" + file.originalname)
    }
})

var upload = multer({ storage: Storage }).single('uploadedImage')

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html")
})

app.post("/submit-image", function (req, res) {
    upload(req, res, function (err) {
        if (err) {
            console.log("Something went wrong!")
            console.log(err);
        } else {
          console.log("File uploaded sucessfully!.")
        }
    })
})

var port = process.env.PORT || 3000
app.listen(port, function(){
  console.log('Server running on port ' + port)

})

app.on('error', function(){
  console.log(error)
})
