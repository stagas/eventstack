var EventEmitter = require('events').EventEmitter

var slice = [].slice

var EventStack = module.exports = function (ee) {
  if (!(ee instanceof EventEmitter)) ee = new EventEmitter

  ee._eventStack = {}

  ee.use = function (event, fn) {
    if (!this._eventStack[event]) this._eventStack[event] = []
    this._eventStack[event].push(fn.bind(this))
  }

  var emit = ee.emit.bind(ee)

  ee.emit = function () {
    var args = slice.call(arguments)
    var event = args.shift()
    if (!this._eventStack[event]) {
      return emit.apply(this, arguments)
    }
    var self = this
    Stack(this._eventStack[event])
      (
        { event: event
        , args: args
        , arguments: args
        , emit: this.emit.bind(this)
        }, function () {
          args.unshift(event)
          emit.apply(this, args)
        }
      )
  }

  return ee
}

// modified version of creationix/stack
function Stack(middleware) {
  var handle = function(e, next) { next() }
  middleware.reverse().forEach(function(layer) {
    var child = handle
    handle = function (e, next) {
      layer(e, function () {
        child(e, next)
      })
    }
  })
  return handle
}
