// pages/maintenance/add-account/index.js
const lang = getApp().globalData.lang
const pages = getCurrentPages()
console.log(lang)
import {
  addAccount
} from './../../../apis/water'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.addAccount,
    form: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const form = lang.addAccount.form.map(i => ({
      ...i,
      value: ''
    }))
    this.setData({
      form
    })
  },
  getFormInfo() {
    wx.showToast({
      title: lang.message.loading,
      duration: 999999,
      icon: 'none'
    })
    const wixiForm = this.selectComponent('#add-form')
    if (!wixiForm) {
      wx.hideToast()
      return
    }
    const data = wixiForm.getFormData()
    if (data) {
      addAccount(data).then(res => {
        wx.hideToast()
        const page = pages[pages.length - 2]
        wx.navigateBack({
          delta: page
        })
        wx.showToast({
          title: lang.message.success,
          icon: 'none',
          duration: 2000
        })
      }).catch(res => {
        wx.hideToast()
      })
    } else {
      wx.hideToast()
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
    }
  }
})