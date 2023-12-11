// pages/query-water/pay/confirm-info/index.js
const app = getApp()
let lang = app.globalData.lang
const pages = getCurrentPages()
const {
  wxAsyncApi,
} = require('./../../../../utils/util')
const {
  readingPic
} = require('./../../../../apis/water')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    btnName: lang.btnName,
    form: {},
    active: 1,
    steps: lang.pay.steps,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const date = this.handleTimeValue()
    const {
      imageUrl,
      reading,
      total_money,
      total_water,
      wm_no,
      wm_name,
      last_reading,
      is_T,
      last_time, // 上次抄表时间
      now_time, // 本次抄表时间
    } = options
    this.setData({
      form: {
        imageUrl,
        reading,
        total_money,
        total_water,
        wm_no,
        wm_name,
        last_reading,
        check_time_text: date.time,
        check_time: date.timestamp,
        is_T,
        last_time, // 上次抄表时间
        now_time, // 本次抄表时间
      },
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
  },
  //获取当前时间
  handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date()
    const year = _date.getFullYear()
    const month = _date.getMonth() + 1
    const day = _date.getDate()
    const hh = _date.getHours()
    const mm = _date.getMinutes()
    const ss = _date.getSeconds()
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    const timestamp = new Date(year, month - 1, day, hh, mm, ss).getTime() / 1000
    console.log(time)
    console.log(timestamp)

    return {
      time,
      timestamp
    }
  },
  // 返回修改信息
  goBack() {
    const page = pages[pages.length - 1]
    wx.navigateBack({
      delta: page
    })
  },
  // 确认信息
  // next() {
  //   const wm_no = this.data.form.wm_no
  //   const reading = this.data.form.reading
  //   const total_money = this.data.form.total_money
  //   const total_water = this.data.form.total_water
  //   const last_reading = this.data.form.last_reading
  //   const check_time = this.data.form.check_time
  //   const check_time_text = this.data.form.check_time_text
  //   const filePath = this.data.form.imageUrl
  //   const baseUrl = app.globalData.baseUrl
  //   const token = wx.getStorageSync('token')

  //   wx.uploadFile({
  //     filePath,
  //     name: 'reading_pic',
  //     url: `${baseUrl}/api/wx/fb/fb_wm_reading`,
  //     header: {
  //       'Authorization': token ? 'Bearer ' + token : '',
  //     },
  //     formData: {
  //       wm_no,
  //       reading,
  //       check_time
  //     },
  //     success(res) {

  //       console.log(res)
  //       if(res.statusCode === 200){
  //         const data = JSON.parse(res.data)
          
  //         if(data.code == 200){
  //           wx.showToast({
  //             title: lang.message.success,
  //             duration: 2000,
  //             icon: 'none'
  //           })
  //           const payStatusList = JSON.stringify(data.data.pay_way.map(i => ({
  //             text: i.title,
  //             key: i.key
  //           })))
  //           console.log(payStatusList)
  //           const up_id = data.data.data.up_id
  //           wxAsyncApi('reLaunch', {
  //             url: `/pages/query-water/pay/print-info/index?wm_no=${wm_no}&total_money=${total_money}&total_water=${total_water}&reading=${reading}&imageUrl=${filePath}&last_reading=${last_reading}&up_id=${up_id}&payStatusList=${payStatusList}&check_time_text=${check_time_text}`,
  //           }).then(res => {
  //             wx.setNavigationBarTitle({
  //               title: lang.message.info,
  //             })
  //           })

  //         }else{
  //           wx.showToast({
  //             title: data.desc,
  //             duration: 2000,
  //             icon: 'none'
  //           })
  //         }
          
        
  //       }
        
  //     },
  //     fail(res) {
  //       console.log(res)
  //     }
  //   })

  // },
  next() {
    let that = this;
    const wm_no = that.data.form.wm_no;
    const wm_name = that.data.form.wm_name;
    const reading = that.data.form.reading;
    const total_money = that.data.form.total_money;
    const total_water = that.data.form.total_water;
    const last_reading = that.data.form.last_reading;
    const check_time = that.data.form.check_time;
    const check_time_text = that.data.form.check_time_text;
    const filePath = that.data.form.imageUrl;
    const is_T = that.data.form.is_T;
    const now_time = that.data.form.now_time;
    const baseUrl = app.globalData.baseUrl;
    const token = wx.getStorageSync('token')
    let params = {
      wm_no,
      reading: Number(reading),
      check_time
    }
    readingPic(params).then(res => {
      console.log(res)
      if(res.code == 200){
        wx.showToast({
          title: lang.message.success,
          duration: 2000,
          icon: 'none'
        })
        const order_no = res.data.data.order_no
        const payStatusList = JSON.stringify(res.data.pay_way.map(i => ({
          text: i.title,
          key: i.key
        })))
        console.log(payStatusList)
        const up_id = res.data.data.up_id
        setTimeout( ()=>{
          wxAsyncApi('reLaunch', {
            url: `/pages/query-water/pay/print-info/index?wm_no=${wm_no}&wm_name=${wm_name}&total_money=${total_money}&order_no=${order_no}&total_water=${total_water}&reading=${reading}&imageUrl=${filePath}&last_reading=${last_reading}&up_id=${up_id}&payStatusList=${payStatusList}&check_time_text=${check_time_text}&now_time=${now_time}&is_T=${is_T}`,
          }).then(res => {
            wx.setNavigationBarTitle({
              title: lang.message.info,
            })
          })
        },1500)

      }else{
        wx.showToast({
          title: res.desc,
          duration: 2000,
          icon: 'none'
        })
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none'
      })
    })

  }
  
})