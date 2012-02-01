var EventEmitter = require('events').EventEmitter
var EventStack = require('../')
var test = require('tap').test

var es

test("creating an EventStack", function (t) {
  t.plan(1)
  es = new EventStack
  t.true(es instanceof EventStack, "is instanceof EventStack")
})

test("adding middleware", function (t) {
  t.plan(1)
  es.use('foo', function (args, next) {
    if (args[1] === 'bar') this.emit('bar', 'baz')
    else next()
  })
  es.use('foo', function (args, next) {
    if (args[1] === 'bar2') this.emit('bar2', 'foobar2')
    else next()
  })
  es.use('bar', function (args, next) {
    if (args[1] === 'zoo') this.emit('zoo', 'kittens')
    else next()
  })
  es.use('zoo', function (args, next) {
    if (args[1] === 'kittens') args[1] = 'cats'
    next()
  })
  t.true(Array.isArray(es._eventStack['foo']), "added middleware")
})

test("testing emit 'foo'", function (t) {
  t.plan(3)
  es.on('foo', function (s) {
    t.equals(s, 'foobar')
  })  
  es.on('bar', function (s) {
    t.equals(s, 'baz')
  })
  es.on('bar2', function (s) {
    t.equals(s, 'foobar2')
  })
  es.emit('foo', 'bar')
  es.emit('foo', 'foobar')
  es.emit('foo', 'bar2')
})

test("testing emit 'bar'", function (t) {
  t.plan(2)
  es.on('bar', function (s) {
    t.equals(s, 'baz')
  })
  es.on('zoo', function (s) {
    t.equals(s, 'cats')
  })
  es.emit('foo', 'bar')
  es.emit('bar', 'zoo')
})

test("testing multi-patch", function (t) {
  t.plan(1)
  es.use(function () {
    this.use('multi1', function (args, next) {
      if (args[1] === 'foo') this.emit('multi2', 'bar')
      next()
    })
    this.use('multi2', function (args, next) {
      if (args[1] === 'bar') args[1] = 'foobar'
      next()
    })
  })
  es.on('multi2', function (s) {
    t.equals(s, 'foobar')
  })
  es.emit('multi1', 'foo')
})

test("testing global middleware", function (t) {
  t.plan(2)
  es.use(function (args, next) {
    args.push('coocoo')
    next()
  })
  es.on('foo2', function (s, x) {
    t.equals(x, 'coocoo')
  })
  es.on('bar2', function (s, x) {
    t.equals(x, 'coocoo')
  })
  es.emit('foo2', 123)
  es.emit('bar2', 123)
})

test("testing patch existing EventEmitter", function (t) {
  t.plan(3)
  var ee = new EventEmitter
  ee.something = 'something'
  EventStack(ee)
  t.equals(typeof ee.use, 'function')
  t.equals(ee.something, 'something')
  ee.use('foo', function (args, next) {
    if (args[1] === 'bar') this.emit('bar', 'foo')
    else next()
  })
  ee.on('bar', function (s) {
    t.equals(s, 'foo')
  })
  ee.emit('foo', 'bar')
})
