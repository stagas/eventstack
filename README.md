# EventStack

Middleware for EventEmitters

## Installation

`npm install eventstack`

## Description

Sometimes I wished I could take an event and apply some logic to it before
it reaches the listener. So I made this thingy.

It is still a regular EventEmitter, with an extra `.use()` method where you
use to add middleware to your events.

The API looks like this:

```javascript
ee.use('some event', function (args, next) {
  // do stuff here
  // ...
  
  // move on
  next();
});
```

The function is called in the EventEmitter context with 2 arguments,
`args` and `next`.

`args` is an `Array` with the event arguments, including the event name, you
can use to inspect or transform.

You call `next()` to move to the next middleware, or emit the event when
it reaches the end of the stack. It is not necessary to call `next()` all the
time, depending on your logic, you could use `this.emit(...)` to emit
a different event or even do nothing.

## Usage

Standalone:

```javascript
var ee = new EventStack();
```

Inherit (just like a regular EventEmitter):

```javascript
function Cat () {
  EventStack.call(this);
}

util.inherits(Cat, EventStack);

Cat.prototype.meow = function () {
  this.emit('meow');
}
```

Patch existing EventEmitter:

```javascript
var ee = new EventEmitter();
EventStack(ee); // patched!
ee.use(...);
```

## Example

```javascript
var EventStack = require('eventstack');

var ee = new EventStack;

// add a middleware that waits for `bar` messages on `foo`
// and re-emits `foobar!` to `bar`!
ee.use('foo', function (args, next) {
  if (args[1] === 'bar') {
    this.emit('bar', 'foobar!');
  } else {
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

```

## Licence

MIT/X11