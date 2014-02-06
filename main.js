
var argv = require('optimist').argv
var cocaine = require('cocaine')

if(cocaine.spawnedBy()){
  var http = cocaine.http
} else {
  var http = require('http')
}

var app = require('express')()
var format = require('util').format

app.get('/', function(req, res){
  console.log('processing / handler')
  var body = format('worker %s\n', process.pid)
  res.setHeader('content-type', 'text/plain')
  res.setHeader('content-length', body.length)
  res.end(body)
})

app.get('/hello', function(req, res){
  console.log('processing /hello handler')
  res.send(format('Hi, I\'m no.%s!\n', process.pid))
})

var server = http.createServer(app)
var port = process.env.PORT || 5000

if(cocaine.spawnedBy()){
  var W = new cocaine.Worker(argv)
  var handle = W.getListenHandle('http')
  server.listen(handle, function(){
    console.log('listening on cocaine handle')
  })
} else {
  server.listen(port, function(){
    console.log('listening on port', port)
  })
}

