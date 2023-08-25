// pages/admin/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi
} = require('./../../utils/util')
const imgList = {
  H: '/img/user/rs.png',
  CT: '/img/user/ar.png',
  L: '/img/user/fb.png',
  CF: '/img/user/jc.png',
  C: '/img/user/m.png',
  R: '/img/user/tr.png',
}
Page({

  /**
   * 页面的初始数据
   */
  data: {
    // isLogin: Boolean(wx.getStorageSync('login')),
    admin: lang.admin,
    langSystem: lang.system,
    imgUrl: '',
    userInfo: {},
  },
  onLoad(options) {
    lang = app.globalData.lang
    this.setData({
      admin: lang.admin,
      langSystem: lang.system,
    })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    const list = lang.tabber.list
    const selected = wx.getStorageSync('tabberIndex')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected,
        list,
      })
    }
    const auth = app.globalData.auth
    const length = auth.length
    const key = length ? auth[length - 1] : 'H'
    const imgUrl = imgList[key || 'H']
    const userInfo = app.globalData.userInfo || {}
    this.setData({
      imgUrl,
      userInfo
    })
  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  // 员工认证
  handleEmployeeCertification() {
    wxAsyncApi('navigateTo', {
      url: `/pages/admin/employee-certification/index`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: this.data.admin.employee.name,
      })
    })
  },
  // 蓝牙设备处理
  handleBluetooth() {
    wxAsyncApi('navigateTo', {
      url: `/pages/admin/bluetooth/index`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: this.data.admin.deviceItem,
      })
    })
  },
  // 处理语言
  handleLang() {
    wxAsyncApi('navigateTo', {
      url: `/pages/admin/set-lang/index`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: this.data.admin.lang,
      })
    })
  },
})