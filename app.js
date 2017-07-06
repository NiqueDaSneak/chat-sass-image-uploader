var express = require('express')
var multer  = require('multer')
var upload = multer({ dest: 'uploads/' })

var app = express();

app.post('/submit-image', upload.single('uploadedImage'), function (req, res, next) {
  // req.file is the `avatar` file
  // req.body will hold the text fields, if there were any
  console.log(req.file);
  console.log(req.body);
})

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

var port = process.env.PORT || 4000
app.listen(port, function(){
  console.log('Server running on port ' + port)

})

app.on('error', function(){
  console.log(error)
})
