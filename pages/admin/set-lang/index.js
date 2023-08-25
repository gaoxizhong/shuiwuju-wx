// pages/admin/set-lang/index.js
const app = getApp();
let lang = app.globalData.lang
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.admin.setLang,
    langDialog: lang.dialog,
    btnName: lang.btnName,

    langValue: '',
    langType: '',

    options: [{
      text: 'Portuguesa',
      value: 1
    }, {
      text: '中文',
      value: 0
    }],

    show: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    this.setData({
      lang: lang.admin.setLang,
      langDialog: lang.dialog,
      btnName: lang.btnName,
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
    const langversion = wx.getStorageSync('langversion')
    const langItem = this.data.options.find(i => i.value === langversion)
    this.setData({
      langValue: langItem.text,
      langType: langItem.value
    })
  },

  onOpenPopup(e) {
    this.setData({
      show: true
    })
  },
  onClosePopup() {
    this.setData({
      show: false
    })
  },
  handleSelectItem(e){
    const langType = e.detail.value.value
    const langValue = e.detail.value.text
    this.setData({
      langType,
      langValue
    })
    this.onClosePopup()
  },
  handleClick() {
    const langType = this.data.langType
    wx.setStorageSync('tabberIndex', 0)
    app.changeLang(langType)
  },
})