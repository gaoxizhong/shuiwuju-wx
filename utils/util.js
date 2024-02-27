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
  //获取当前时间
function handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date();
    const year = _date.getFullYear();
    const month = _date.getMonth() + 1;
    const day = _date.getDate();
    const hh = _date.getHours();
    const mm = _date.getMinutes();
    const ss = _date.getSeconds();
    // 使用Intl.DateTimeFormat对象 转换为星期
    const options = { weekday: 'long' };
    const rq = new Intl.DateTimeFormat('zh-CN', options).format(date);

    const dayTime = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    const timestamp = new Date(year, month - 1, day, hh, mm, ss).getTime() / 1000
    return {
      year,
      month,
      day,
      time,
      dayTime,
      rq,
      timestamp
    }
  }
// 判断当前时间是否在时间段内
function judgmentData(s,e){
  const now = new Date(); // 当前时间
  const start = new Date(s); // 定义的开始时间
  const end = new Date(e); // 定义的结束时间
  if (now >= start && now <= end) {
    console.log('当前时间在时间段内');
    return true
  } else {
    console.log('当前时间不在时间段内');
    return false
  }
}
module.exports = {
  wxAsyncApi,
  debounce,
  throttle,
  fmoney,
  judgmentData,
  handleTimeValue
}