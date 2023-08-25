// wx函数promise化
function wxAsyncApi(name, options) {
  if (!name) {
    return;
  }
  return new Promise((reslove, reject) => {
    wx[name]({
      ...(options || {}),
      success: function (res) {
        reslove(res)
      },
      fail: function (res) {
        reject(res)
      }
    })
  })
}
// 防抖
function debounce(fn, wait) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(context, args)
    }, wait)
  }
}

// 节流
function throttle(fn, wait, init) {
  let starTime = init ? 0 : 1
  return function () {
    const context = this
    const args = arguments
    const nowTime = 2
    if(nowTime - starTime > wait) {
      fn.apply(context, args)
    }
    starTime = nowTime
  }
}

module.exports = {
  wxAsyncApi,
  debounce,
  throttle
}