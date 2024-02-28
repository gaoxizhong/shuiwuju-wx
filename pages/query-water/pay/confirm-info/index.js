// pages/query-water/pay/confirm-info/index.js
const app = getApp()
let lang = app.globalData.lang
const pages = getCurrentPages()
const {
  wxAsyncApi,judgmentData,handleTimeValue
} = require('./../../../../utils/util')
const {
  readingPic
} = require('./../../../../apis/water')
import {
  getBusinessHallList,
} from './../../../../apis/business-hall'
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
    pageUrl:"collectInfo",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    const date = handleTimeValue()
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
      months,
      pageUrl
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
        is_T: is_T == 'true'?true:false,
        last_time, // 上次抄表时间
        now_time, // 本次抄表时间
        months
      },
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      steps: lang.pay.steps,
      pageUrl
    })
    if(this.data.pageUrl == 'accountsearch'){
      this.getListData();
    }
  },
  getListData() {
    const params = {
      wm_no: this.data.form.wm_no,
      status: '',
      page: 1,
      select: this.data.form.wm_no,
      type: 1
    }
    getBusinessHallList(params).then(res => {
      const dataList = res.data.list.data;
      if(dataList.length > 0){
        const form = this.data.form;
        form.last_reading =  dataList[0].last_reading;
        form.reading =  dataList[0].reading;
        form.total_water = Number( Number(form.reading) - Number(form.last_reading) ).toFixed(2)
        this.setData({
          form
        })
      }
      
    })
  },
  // 返回修改信息
  goBack() {
    const page = pages[pages.length - 1]
    wx.navigateBack({
      delta: page
    })
  },

  next() {
    let that = this;
    const wm_no = that.data.form.wm_no;
    const wm_name = that.data.form.wm_name;
    const reading = that.data.form.reading;
    const total_money = that.data.form.total_money;
    const last_reading = that.data.form.last_reading;
    const check_time = that.data.form.check_time;
    const check_time_text = that.data.form.check_time_text;
    const filePath = that.data.form.imageUrl;
    const is_T = that.data.form.is_T;
    const now_time = that.data.form.now_time;
    const months = that.data.form.months;
    const baseUrl = app.globalData.baseUrl;
    const token = wx.getStorageSync('token')

    const dayTime = handleTimeValue().dayTime;
    const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    const rq = weekdays[new Date().getDay()];
    let s = '';
    let e = '';
    if(rq == '星期六'){
      s = `${dayTime} 07:00:00`;
      e = `${dayTime} 14:00:00`;
    }else if(rq == '星期日'){
      s = `${dayTime} 00:00:00`;
      e = `${dayTime} 00:00:01`;
    }else{
      s = `${dayTime} 06:00:00`;
      e = `${dayTime} 15:00:00`;
    }
    const is_judgmentData = judgmentData(s,e);
    if(!is_judgmentData){
      wx.showToast({
        title: lang.message.businessHours,
        duration: 2000,
        icon: 'none'
      })
      return
    }
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
        const total_water = res.data.data.water;
        const payStatusList = JSON.stringify(res.data.pay_way.map(i => ({
          text: i.title,
          key: i.key
        })))
        console.log(payStatusList)
        const up_id = res.data.data.up_id
        setTimeout( ()=>{
          wxAsyncApi('reLaunch', {
            url: `/pages/query-water/pay/print-info/index?wm_no=${wm_no}&wm_name=${wm_name}&total_money=${total_money}&order_no=${order_no}&total_water=${total_water}&reading=${reading}&imageUrl=${filePath}&last_reading=${last_reading}&up_id=${up_id}&payStatusList=${payStatusList}&check_time_text=${check_time_text}&now_time=${now_time}&months=${months}&is_T=${is_T}`,
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