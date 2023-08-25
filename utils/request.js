const app = getApp()

export const httpRequest = (options) => {
  const token = wx.getStorageSync('token')
  const reqData = {
    ...options,
    timeout: options.timeout || 20000,
    header: {
      'Authorization': token ? 'Bearer ' + token : '',
      ...(options.header || {})
    }
  }
  if (reqData.url.includes('/api/wx/login')) {
    delete reqData.header.Authorization
  }
  return new Promise((reslove, reject) => {
    wx.request({
      ...reqData,
      success: (res) => {
        if (res.data.code !== 200) {
          reject(res.data)
        } else {
          reslove(res.data)
        }
      },
      fail: (err) => {
        reject(err)
      }
    })
  })
}