var EventEmitter = require('events').EventEmitter
var EventStack = require('../')
var test = require('tap').test

var ee

test("creating an EventEmitter", function (t) {
  t.plan(1)
  ee = new EventEmitter
  t.true(ee instanceof EventEmitter, "is instanceof EventEmitter")
})

test("creating an EventStack EventEmitter", function (t) {
  t.plan(1)
  var ees = EventStack()
  t.true(ees instanceof EventEmitter, "is instanceof EventEmitter")
})

test("patching with EventStack", function (t) {
  t.plan(1)
  EventStack(ee)
  t.equals(typeof ee.use, 'function')
})

test("adding middleware", function (t) {
  t.plan(1)
  ee.use('foo', function (e, next) {
    if (e.args[0] === 'bar') e.emit('bar', 'baz')
    else next()
  })
  ee.use('bar', function (e, next) {
    if (e.args[0] === 'zoo') e.emit('zoo', 'kittens')
    else next()
  })
  ee.use('zoo', function (e, next) {
    if (e.args[0] === 'kittens') e.args[0] = 'cats'
    next()
  })
  t.true(Array.isArray(ee._eventStack['foo']), "added middleware")
})

test("testing emit 'foo'", function (t) {
  t.plan(2)
  ee.on('bar', function (s) {
    t.equals(s, 'baz')
  })
  ee.on('foo', function (s) {
    t.equals(s, 'foobar')
  })
  ee.emit('foo', 'bar')
  ee.emit('foo', 'foobar')
})

test("testing emit 'bar'", function (t) {
  t.plan(2)
  ee.on('bar', function (s) {
    t.equals(s, 'baz')
  })
  ee.on('zoo', function (s) {
    t.equals(s, 'cats')
  })
  ee.emit('foo', 'bar')
  ee.emit('bar', 'zoo')
})
