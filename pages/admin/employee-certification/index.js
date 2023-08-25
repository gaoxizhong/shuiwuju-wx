// pages/admin/employee-certification/index.js
const app = getApp()
let lang = app.globalData.lang
const pages = getCurrentPages()
import {
  employeeCertification
} from './../../../apis/admin'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.admin.employee,
    btnName: lang.btnName,
    form: [],
    employee: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const userInfo = app.globalData.userInfo || {}
    const form = this.data.lang.form.map(i => ({
      ...i,
      value: userInfo[i.key] || ''
    }))
    this.setData({
      form,
      lang: lang.admin.employee,
      btnName: lang.btnName,
    })
    const employee = Boolean(wx.getStorageSync('employee'))
    this.setData({
      employee
    })
  },
  handleClick() {
    const wixiForm = this.selectComponent('#employee-form')
    const data = wixiForm.getFormData()
    if (data) {
      employeeCertification(data).then(res => {
        wx.setStorageSync('tabberIndex', 0)
        wx.setStorageSync('employee', true)
        this.setData({
          employee: true
        })
        wx.showToast({
          title: lang.message.success,
          icon: 'none',
          duration: 2000
        });
        const auth = res.data.my_roles.map(i => i.name)
        app.setAuth(auth)
        this.goBack()
      }).catch((res) => {
        wx.showToast({
          title: res.desc || lang.message.fail,
          icon: 'none',
          duration: 2000
        });
      })
    }
  },
  goBack() {
    const page = pages[pages.length - 1]
    wx.navigateBack({
      delta: page
    })
  },
})