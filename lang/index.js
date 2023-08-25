const app = getApp()
import zh_lang from './zh'
import en_lang from './en'
export const getLang = () => {
  const langVersion = wx.getStorageSync('langversion')
  if (langVersion === 0) {
    return JSON.parse(JSON.stringify(zh_lang))
  } else {
    return JSON.parse(JSON.stringify(en_lang))
  }
}

export const changeLang = () => {
  const langVersion = wx.getStorageSync('langversion')
  if (langVersion === 0) {
    wx.setStorage({
      key: 'langeversion',
      data: 1
    })
  } else {
    wx.setStorage({
      key: 'langeversion',
      data: 0
    })
  }
}