var EventEmitter = require('events').EventEmitter;
var EventStack = require('../');

// create an EE, we could also have used ee = EventStack()
var ee = new EventEmitter;

// patch the EE
EventStack(ee);

// add a middleware
ee.use('foo', function (event, next) {
  if (event.args[0] === 'bar') {
    event.emit('bar', 'foobar!');
  }
  else {
    next();
  }
});

ee.on('foo', function (s) {
  console.log('listener foo:', s);
});

ee.on('bar', function (s) {
  console.log('listener bar:', s);
});

ee.emit('foo', 'not bar :(');
ee.emit('foo', 'bar');
