var EventStack = require('../')

var ee = new EventStack

ee.on('foo', function (s) {
  console.log('listener foo got:', s)
})

ee.use('foo', function (e, next) {
  console.log('looks like someone emitted a foo')
  console.log('let\'s make them wait a second')
  setTimeout(function () {
    next()
  }, 1000)
})

ee.emit('foo', 'bar')
