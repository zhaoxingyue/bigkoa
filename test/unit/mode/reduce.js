import test from 'ava'

const sinon = require('sinon')
const Bigview = require("../../../src")
const Biglet = require("biglet")
const ModeInstanceMappings = require('../../../src/mode')
/**
 * 连续模式reduce：依次连续写入(当前)
 * 
 * 检查点：
 * 
 *  - 1) 写入模块，检查cache为空
 *  - 2）检查p1和p2的顺序，p1先显示
 */

test('MODE reduce', t => {
  let ctx = {
    res:{},
    req:{},
    render: function (tpl, data) {
      return data
    }
  }
  let bigview = new Bigview(ctx, 'tpl', {})


  let result = []

  var p1 = new Biglet()
  p1.owner = bigview
  p1.fetch = function () {
    return sleep(3000).then(function () {
      // console.log('p1')
      result.push('p1')
    })
  }

  p1.parse = function () {

    t.is(bigview.cache.length, 0)

    return Promise.reject(new Error('p1 reject'))
  }

  var p2 = new Biglet()
  p2.owner = bigview
  p2.fetch = function () {
    return sleep(1000).then(function () {
      // console.log('p2')
      result.push('p2')
    })
  }

  p2.parse = function () {
    t.is(bigview.cache.length, 0)

    return Promise.reject(new Error('p2 reject'))
  }

  let pagelets = [p1, p2]

  let startTime = new Date()

  return bigview.getModeInstanceWith('reduce').execute(pagelets).then(function () {
    let endTime = new Date()

    let cost = endTime.getTime() - startTime.getTime()

    t.true(cost > 4000)

    // 按照push顺序算的
    t.is(result[0], 'p1')
    t.is(result[1], 'p2')
  })
})

function sleep(time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}