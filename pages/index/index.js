// pages/index/index.js
const app = getApp();
let lang = app.globalData.lang
console.log(lang)
import {
  wxAsyncApi
} from './../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.index,
    langDialog: lang.dialog,
    funcLang: lang.func,
    showFuncList: [], // 展示功能列表
    showQuickActionList: [], // 快捷操作列表
    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    this.setData({
      lang: lang.index,
      langDialog: lang.dialog,
      funcLang: lang.func,
    })
    const _this = this
    app.watchAuth(_this.getFuncList)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.index,
      langDialog: lang.dialog,
      funcLang: lang.func,
    })
    const list = lang.tabber.list
    const selected = wx.getStorageSync('tabberIndex')
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected,
        list,
      })
      if(app.globalData.wm_id ){
        app.handleUserInfo();
      }
    }
    this.getQuickActionList()
  },
 /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },
  matchItemAuth(itemAuth, userAuth) {
    if (!itemAuth || !userAuth) return false
    return String(itemAuth).split('').some(code => userAuth.includes(code))
  },
  // 用户权限变化
  getFuncList() {
    console.log('用户权限变化')
    const auth = app.globalData.auth
    const allList = this.data.funcLang.list
    console.log(auth)
    console.log(allList)
    const showFuncList = allList.filter(i => this.matchItemAuth(i.auth, auth))
    this.setData({
      showFuncList
    })
    this.getQuickActionList()
  },

  getQuickActionList() {
    const auth = app.globalData.auth || []
    const quickActionList = (lang.index.quickActionList || []).filter(i => auth.includes(i.auth))
    this.setData({
      showQuickActionList: quickActionList,
    })
  },

  handleToQuickActionPage(e) {
    const { index } = e.currentTarget.dataset
    const item = this.data.showQuickActionList[index]
    this.toPage(item.url, item.tabberName || item.title)
  },

  handleToSearch() {
    const lang = this.data.lang
    this.toPage('/pages/index/account-search/index', lang.iconSearch)
  },

  handleToFuncPage(e) {
    const {
      index
    } = e.currentTarget.dataset
    const item = this.data.showFuncList[index]
    this.toPage(item.url, item.tabberName || item.title)
  },

  toPage(url, title) {
    wxAsyncApi('navigateTo', {
      url,
    }).then(res => {
      wx.setNavigationBarTitle({
        title,
      })
    })
  },
  onCloseSelect() {
    this.setData({
      show: false
    })
  },
  onConfirmSelect(e) {
    const lang = e.detail.value.value
    wx.setStorageSync('langversion', lang)
    app.setLang()
    this.onCloseSelect()
  }
})