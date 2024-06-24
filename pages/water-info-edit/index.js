// pages/water-info-edit/index.js
const app = getApp()
let lang = app.globalData.lang
const {editWater} = require('./../../apis/business-hall')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    label: lang.waterInfoEdit,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    form: {},
    wm_no: '',
    wm_name: '',
    last_water: '',
    last_time: '',
    user_type: '',
    user_type_id: null,
    showSelectTime: false,
    currentDate: new Date().getTime(),
    formatter(type, value) {
      if (type === 'year') {
        return `${value}${lang.timeName.year}`;
      }
      if (type === 'month') {
        return `${value}${lang.timeName.month}`;
      }
      if (type === 'day') {
        return `${value}${lang.timeName.day}`;
      }
      return value;
    },
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang;
    const form = JSON.parse(options.data);
    // 获取价格类型
    let fbUserType = JSON.parse(wx.getStorageSync('fbUserType'));
    let list = fbUserType.map(i => ({
      text: i.type_name,
      value: i.id
    }))
    let user_type_id = form.user_type_id;
    let type = '';
    list.forEach( ele =>{
      if(ele.value == user_type_id){
        type = ele.text
      }
    })
    this.setData({
      label: lang.waterInfoEdit,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      form,
      wm_name: form.wm_name,
      wm_no: form.wm_no,
      last_water: Number(form.last_reading).toFixed(0),
      last_time: form.last_time,
      optionsPriceType: list,
      user_type: type,
      user_type_id,
    })
    console.log(form)

  },
  onOpenTimeSelect() {
    const value = this.data.last_time;
    this.setData({
      showSelectTime: true,
      currentDate: value ? new Date(value).getTime() : new Date().getTime()
    })
  },
  onCloseTimeSelect() {
    this.setData({
      showSelectTime: false,
    })
  },
  handleGetTime(e) {
    console.log(e)
    const date = new Date(e.detail)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const value = `${year}-${month > 10 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
    this.setData({
      showSelectTime: false,
      last_time: value
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

  },
  handleDate(value) {
    const date = new Date(value * 1000)
    const YY = date.getFullYear()
    const MM = date.getMonth() + 1
    const DD = date.getDate()
    const hh = date.getHours()
    const mm = date.getMilliseconds()
    const ss = date.getSeconds()
    return `${YY}-${MM < 10 ? '0' + MM : MM}-${DD < 10 ? '0' + DD : DD} ${hh < 10 ? '0' + hh : hh}:${mm < 10 ? '0' + mm : mm}:${ss < 10 ? '0' + ss : ss}`
  },
  // 价格类型
  onPriceType(e){
    console.log(e)
    this.setData({
      showPriceType: true,
    })
  },
  handlePriceType(e){
    console.log(e)
    this.setData({
      user_type: e.detail.value.text,
      user_type_id: e.detail.value.value
    })
    this.onClosePriceType();
  },
  onClosePriceType() {
    this.setData({
      showPriceType: false
    })
  },
  submitBtn(){
    let that = this;
    let form = that.data.form;
    let p = {
      wm_id: form.wm_id,
      wm_no:  that.data.wm_no,
      wm_name:  that.data.wm_name,
      last_time: that.data.last_time,
      last_reading: that.data.last_water,
      user_type_id: that.data.user_type_id,
    }
    editWater(p).then(res =>{
      if(res.code == 200){
        wx.showToast({
          title: lang.message.success,
        })
        setTimeout( () =>{
          wx.navigateBack({
            delta: 1
          })
        },1500)
      }else{
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      }
    }).catch(e =>{
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
    })
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
})