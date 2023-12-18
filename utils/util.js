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
function fmoney(s, n){
	/*
	* 参数说明：
	* s：要格式化的数字
	* n：保留几位小数
	* */
	n = n > 0 && n <= 20 ? n : 2;
	s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
	var l = s.split(".")[0].split("").reverse(),
	r = s.split(".")[1],
	t = "";
	for ( let i = 0; i < l.length; i++) {
	
	t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");
	
	}
	return t.split("").reverse().join("") + "." + r;
}

module.exports = {
  wxAsyncApi,
  debounce,
  throttle,
  fmoney
}