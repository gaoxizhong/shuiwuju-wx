function SendControlCommand(printData, options) {
  // 接口地址：如果访问不了，IP可以改成设备本地IP尝试；
  var apiUrl = "http://127.0.0.1:8080/print/jsonToPrint?data=" + encodeURIComponent(JSON.stringify(printData));
  return new Promise((reslove, reject) => {
    wx.request({
      url: apiUrl,
			method: "GET",
      success: (res) => {
        console.log(res)

        if (res.data.code !== 0) {
          reject(res.data)
        } else {
          reslove(res.data)
        }
      },
      fail: (err) => {
        reject(err)// 控制台打印完整错误，方便排查
      }
    })
  })
}


module.exports = {
  SendControlCommand
  
}