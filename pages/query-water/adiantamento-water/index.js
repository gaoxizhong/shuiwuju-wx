// pages/query-water/pay/confirm-info/index.js
const app = getApp()
let lang = app.globalData.lang
const pages = getCurrentPages()
const {
  wxAsyncApi,judgmentData,handleTimeValue
} = require('./../../../utils/util')
const {
  countWater,readingPic,getUserBluetoolthInfoData
} = require('./../../../apis/water')
import {
  getBusinessHallList,
} from './../../../apis/business-hall'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.pay.collectInfo,
    btnName: lang.btnName,
    form: {},
    userBluetoolthInfoData: {},
    reading: '',
    total_water: '',
    total_money: '',
    months:'', // 月份
    wm_no_error: false,
    reading_error: false,
    image_error: false,
    data_error: false,
    isAdmin: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log(options)
    lang = app.globalData.lang
    let form = JSON.parse(options.item);
    const date = handleTimeValue()
    this.setData({
      form,
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
    this.getListData();
    this.getUserBluetoolthInfoData();
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
      // if(dataList.length > 0){
      //   const form = this.data.form;
      //   form.last_reading =  dataList[0].last_reading;
      //   form.reading =  dataList[0].reading;
      //   form.total_water = Number( Number(form.reading) - Number(form.last_reading) ).toFixed(2)
      //   this.setData({
      //     form
      //   })
      // }
      
    })
  },

  next() {
    let that = this;
    const date = handleTimeValue();
    let form = that.data.form;
    const wm_no = form.wm_no;
    const wm_name = form.wm_name;
    const last_reading = form.last_reading;
    const check_time = date.timestamp;
    const check_time_text = date.time;
    const reading = that.data.reading;
    const total_money = that.data.total_money;
    const total_water = that.data.total_water;
    const is_T = form.is_T;
    const now_time = form.now_time;
    const months = form.months;

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
    // if(!is_judgmentData){
    //   wx.showToast({
    //     title: lang.message.businessHours,
    //     duration: 2000,
    //     icon: 'none'
    //   })
    //   return
    // }
    
    let params = {
      wm_no,
      reading: Number(reading),
      check_time,
      type: 2, // 1、正常  2、预缴
    }
    if(!params.reading || params.reading== ''){
      that.setData({
        reading_error: true
      })
      return
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
            url: `/pages/query-water/pay/print-info/index?wm_no=${wm_no}&wm_name=${wm_name}&total_money=${total_money}&order_no=${order_no}&total_water=${total_water}&reading=${reading}&last_reading=${last_reading}&up_id=${up_id}&payStatusList=${payStatusList}&check_time_text=${check_time_text}&now_time=${now_time}&months=${months}&is_T=${is_T}&is_yujiao=automatica`,
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

  },
  // 获取用户打印信息
  getUserBluetoolthInfoData(f){
    let that = this;
    const params = {
      wm_no: that.data.form.wm_no,
    }
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data;
      that.setData({
        userBluetoolthInfoData
      })
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 采集水表读数
  handleInputReading(e) {
    const reading = e.detail
    let reading_error = this.data.reading_error
    if (reading) {
      reading_error = false
    }
    this.setData({
      reading,
      reading_error
    })
  },
  // 输入读数
  handleReading(e) {
    const type = e.currentTarget.dataset.type
      const reading = e.detail.value
      let reading_error = this.data.reading_error
      if (reading) {
        reading_error = false
      }
      this.setData({
        reading,
        reading_error
      })
      // 是否用户存在和输入了水费
      if (type === 'reading' && reading) {
        this.waterCount();
      } else {
        this.setData({
          total_money: '',
          total_water: ''
        })
      }
  },
  // 计算金额和用水量
  waterCount() {
    const reading = Number(this.data.reading)
    const wm_no = this.data.form.wm_no
    const now_time = this.data.now_time
    if ( wm_no ) {
      const params = {
        wm_no,
        reading,
        now_time
      }
      countWater(params).then(res => {
        const {
          water = 1,
          price,
          months
        } = res.data
        this.setData({
          total_water: water,
          total_money: price,
          months
        })
      }).catch((res) => {
        wx.showToast({
          title: res.desc,
          icon: 'none',
          duration: 2000
        })

      })
    }
  },
})