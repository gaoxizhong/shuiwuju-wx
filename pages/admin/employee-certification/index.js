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
    employee: false,
    checked: false,
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
    let that = this;
    const wixiForm = that.selectComponent('#employee-form')
    const data = wixiForm.getFormData()
    if (data) {
      if(!that.data.checked){
        wx.showToast({
          title: 'Por favor concordar',
          icon: 'none'
        })
        return
      }
      employeeCertification(data).then(res => {
        wx.setStorageSync('tabberIndex', 0)
        wx.setStorageSync('employee', true)
        that.setData({
          employee: true
        })
        wx.showToast({
          title: lang.message.success,
          icon: 'none',
          duration: 2000
        });
        const auth = res.data.my_roles.map(i => i.name)
        app.setAuth(auth)
        app.handleUserInfo();
        setTimeout( () =>{
          that.goBack()
        },500)
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
  openPrivacyContract() {
    wx.openPrivacyContract({
      success: res => {
        console.log('openPrivacyContract success')
      },
      fail: res => {
        console.error('openPrivacyContract fail', res)
      }
    })
  },
  bindChange(e){
    console.log(e)
    this.setData({
      checkbox : e.detail.value
    })
    if(e.detail.value.length == 0){
      this.setData({
        checked :false
      })
    }
    if(e.detail.value[0] == '1'){
      this.setData({
        checked :true,
      })
    }
  }
})