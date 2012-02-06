/*
 * EventStack
 * 
 * by stagas
 * MIT licenced
 */

//
// Dependencies
//
var util = require('util')
var EventEmitter = require('events').EventEmitter

//
// Reference to slice
//
var slice = [].slice

//
// EventStack constructor
// Doubles as a patcher for existing EventEmitters
//
var EventStack = exports = module.exports = function EventStack (ee) {
  // determine context
  var self = ee || this

  // act as constructor
  if (!ee) {
    EventEmitter.call(self)
    self._emit = EventEmitter.prototype.emit.bind(self)
  }

  // act as patcher
  else {
    self._emit = self.emit.bind(self)
    self.use = EventStack.prototype.use.bind(self)
    self.emit = EventStack.prototype.emit.bind(self)
  }

  // middleware stacks
  self._eventStack = {}
  self._eventStackGlobal = []
}

//
// Inherit from EventEmitter
//
util.inherits(EventStack, EventEmitter)

//
// Adds middleware to an event or to all events
//
;[ 'after', 'use', 'before' ].forEach(function (method) {
  var action = method === 'use' || method === 'after' ? 'push' : 'unshift'
  EventStack.prototype[method] = function (event, fn) {
    // no action if `event` is null/undefined
    if (null == event) {}

    // did not use an `event` name...
    else if ('function' === typeof event) {
      fn = event

      // so it's either a multi-patcher...
      if (!fn.length) {
        // call it in this context to do its things
        fn.call(this)
      }
      
      // ...or a global event middleware
      else {
        // add it to the global stack
        this._eventStackGlobal[action](fn.bind(this))
      }
    }
    
    // it's a specific event middleware
    else {
      // create event stack
      if (!this._eventStack[event]) this._eventStack[event] = []
   
      // add function to stack
      this._eventStack[event][action](fn.bind(this))
    }

    return this
  }
})

//
// Custom emit function to make use of middleware stacks
// Same API as EE.emit
//
EventStack.prototype.emit = function () {
  var args = slice.call(arguments)
  var event = args[0]
  var emit = this._emit

  // no middleware, fast-forward to regular emit
  if (!this._eventStack[event] && !this._eventStackGlobal.length) {
    return emit.apply(this, args)
  }

  // concatenate global and event specific middleware stacks
  var stack = this._eventStackGlobal.concat(this._eventStack[event] || [])

  // run middleware `fn (args, next)`
  Stack(stack, this)(args, function () {
    // finally emit event (end of stack)
    this._emit.apply(this, args)
  })

  return this
}

//
// Modified version of creationix/stack
//
function Stack (middleware, context) {
  var handle = function (args, next) { next.call(context) }
  middleware.reverse().forEach(function (layer) {
    var child = handle
    handle = function (args, next) {
      layer(args, function () {
        child(args, next)
      })
    }
  })
  return handle
}
