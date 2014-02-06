
var argv = require('optimist').argv
var cocaine = require('cocaine')

var locator = argv.locator || 'apefront.tst.ape.yandex.net:10053'

var client = new cocaine.Client(locator)

client.on('error', function(err){
  console.log('client error', err)
})

if(cocaine.spawnedBy()){
  var http = cocaine.http
} else {
  var http = require('http')
}

var app = require('express')()
var format = require('util').format

client.getServices(['logging', 'geobase', 'langdetect'], function(err, log, geobase, langdetect){
  if(err){
    throw new Error(format('error connecting to one of services: %j', err))
  }

  app.get('/', function(req, res){
    log.debug('processing / handler')
    var body = format('worker %s\n', process.pid)
    res.setHeader('content-type', 'text/plain')
    res.setHeader('content-length', body.length)
    res.end(body)
  })

  app.get('/hello', function(req, res){
    log.debug('processing /hello handler')
    res.send(format('Hi, I\'m no.%s!\n', process.pid))
  })

  app.get('/geo', function(req, res){
    log.debug('processing /geo handler')
    var ip = req.headers['x-real-ip'] || '1.2.3.4'
    geobase.region_id(ip, function(err, region){
      if(err){
        log.debug('error looking up region', err.message)
        res.send('error looking up region: ' + err.message)
      } else {
        log.debug('got region:', region)
        res.send('got region: '+region)
      }
    })
  })

  var server = http.createServer(app)
  var port = process.env.PORT || 5000

  if(cocaine.spawnedBy()){
    var W = new cocaine.Worker(argv)
    var handle = W.getListenHandle('http')
    server.listen(handle, function(){
      log.debug('listening on cocaine handle')
    })
    W.events.on('error', function(err){
      log.debug('cocaine worker error', err.message)
    })
  } else {
    server.listen(port, function(){
      log.debug('listening on port', port)
    })
  }

})

