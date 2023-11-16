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
    console.log(data)
 
    if (data) {
      let wm_no = data.wm_no;
      let str = wm_no.substring(0,3);
      console.log(str)
      if(data.user_type_id == 8){
        if(str !== '777'){
          wx.showToast({
            title: 'Serie do Contador: 777 início',
            icon: 'none'
          })
          return
        }
      }
      if(data.user_type_id == 9){
        if(str !== '888'){
          wx.showToast({
            title: 'Serie do Contador: 888 início',
            icon: 'none'
          })
          return
        }
      }
      if(data.user_type_id == 10){
        if(str !== '999'){
          wx.showToast({
            title: 'Serie do Contador: 999 início',
            icon: 'none'
          })
          return
        }
      }
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