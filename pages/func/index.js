// pages/func/index.js
const {
  wxAsyncApi
} = require('./../../utils/util')
const app = getApp()
let lang = app.globalData.lang
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.func,
    funcList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const funcList = Object.keys(this.data.lang.list).map(i => ({
      key: i,
      name: this.data.lang.list[i][0],
      url: this.data.lang.list[i][1]
    }))
    this.setData({
      funcList,
      lang: lang.func,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

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
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
  handlePageTo(e) {
    const dataset = e.currentTarget.dataset
    const item = this.data.funcList[dataset.index]
    wxAsyncApi('navigateTo', {
      url: `${item.url}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: item.name,
      })
    })
  },
})