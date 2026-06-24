// index.js
const pages = getCurrentPages()
const app = getApp()
let lang = app.globalData.lang

Page({
  data: {
    lang: lang.admin.bluetoolthDevice,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    isConnect: false,
    origin: 'tabber',
    terminalNo: '', //  手持一体机SN编号
  },
  onChooseAvatar(e) {
    const {
      avatarUrl
    } = e.detail
    this.setData({
      avatarUrl,
    })
  },
  onLoad: function (options) {
    let that = this;
    lang = app.globalData.lang;
    that.setData({
      origin: options.origin || 'tabber',
      lang: lang.admin.bluetoolthDevice,
      langDialog: lang.dialog,
      btnName: lang.btnName,
    })
   
  },
  onShow(){
    let terminalNo = wx.getStorageSync('terminalNo') || '';
    console.log(terminalNo)
    console.log(app.globalData.terminalNo)
    this.setData({
      terminalNo,
    })
  },
  handleChange(e){
    console.log(e)
    this.setData({
      terminalNo: e.detail
    })
  },
  unChooseDevice(){
    if(!this.data.terminalNo){
      this.setData({
        error: true
      })
      return
    }else{
      wx.showToast({
        title: 'Sucesso',
      })
      wx.setStorageSync('terminalNo', this.data.terminalNo);// 0818202605016479
      app.globalData.terminalNo = this.data.terminalNo;
      console.log(app.globalData.terminalNo)
      setTimeout( ()=>{
        this.goBack();
      },1500)
    }
  },
  // 返回上一个页面
  goBack() {
    const page = pages[pages.length - 1]
    wx.navigateBack({
      delta: page
    })
  },

})