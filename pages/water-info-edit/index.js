// pages/water-info-edit/index.js
const app = getApp()
let lang = app.globalData.lang
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.waterInfoEdit,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    form: {},
    last_water: '',
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
      lang: lang.waterInfoEdit,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      form,
      last_water: form.last_reading,
      optionsPriceType: list,
      user_type: type,
      user_type_id,
    })
    console.log(form)

  },
  onOpenTimeSelect(e) {
    const index = e.currentTarget.dataset.index
    const value = this.data.wixiForm[index].value || ''
    this.setData({
      showSelectTime: true,
      formIndex: e.currentTarget.dataset.index,
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
    // item.value = `${year}-${month > 10 ? month : '0' + month}-${day > 9 ? day : '0' + day}`
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
      formIndex: e.currentTarget.dataset.index,
    })
  },
  onClosePriceType() {
    this.setData({
      showPriceType: false
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