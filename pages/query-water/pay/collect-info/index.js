// pages/maintenance/search-pay/index.js
const {
  wxAsyncApi,
} = require('./../../../../utils/util')
import {
  countWater,
  payWater,
  getUserListLngLat
} from './../../../../apis/water'
import {
  isAdmin
} from './../../../../apis/admin'
const app = getApp()
let lang = app.globalData.lang
Page({

  /**
   * 页面的初始数据
   */
  data: {
    langVersion: 1,
    lang: lang.pay.collectInfo,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    showAddImg: true,
    wm_no: '',
    last_water: '',
    waterList: [],
    reading: '',
    total_water: '',
    total_money: '',
    months:'', // 月份
    wm_no_error: false,
    reading_error: false,
    image_error: false,
    data_error: false,
    isAdmin: false,
    last_reading: '',
    steps: lang.pay.steps,
    active: 0,
    autosize: {
      maxHeight: 140,
      minHeight: 140
    },


    selectIndex: 0,
    show: false,
    list: [],
    searchStatusList: [],
    type_seach: 'type', // type - - 选类型  seach 输入
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号 5 . 附近
    select_value:'', // 查询内容
    payWayList: [],
    radio: 0,
    selectradio_info:{},
    dialog_show: false,
    radioList:[],
    page: 1,
    latitude: '',
    longitude: '',
    is_T: false,
    now_time:'',
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
  onLoad() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      steps: lang.pay.steps,
    })
  },
  onShow(){
   const langVersion = wx.getStorageSync('langversion');
   lang = app.globalData.lang;
   this.setData({
    langVersion,  // 1: 葡语、0： 中文
    lang: lang.pay.collectInfo,
    btnName: lang.btnName,
    searchStatusList: lang.searchStatusList, 
   })
  },
  // 采集用户
  handleInputWmNo(e) {
    console.log(e.detail)
    const wm_no = e.detail
    let wm_no_error = this.data.wm_no_error
    if (wm_no) {
      wm_no_error = false
    }
    this.setData({
      wm_no,
      wm_no_error
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
  // 判断用户是否存在
  handleReading(e) {
    const type = e.currentTarget.dataset.type
    // const my_isAdmin = this.data.isAdmin
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
    
        if (Number(reading) < Number(this.data.selectradio_info.last_reading)) {
          wx.showToast({
            title: `${this.data.langVersion == 1?'Leitura do contador ≥ Leitura anterior':'用水量需要大于等于上一次用水量'}`,
            duration: 3000,
            icon: 'none'
          })
          return
        }
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
    const wm_no = this.data.selectradio_info.wm_no
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
  // 选择图片
  addWaterImage() {
    wxAsyncApi('chooseMedia', {
      count: 1,
      mediaType: ['image'],
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
    }).then(res => {
      if (res.tempFiles && res.tempFiles[0]) {
        const list = this.data.waterList
        list.push(res.tempFiles[0])
        this.setData({
          waterList: list,
          image_error: false
        })

        if (list.length >= 1) {
          this.setData({
            showAddImg: false
          })
        }
      }
    })
  },
  // 删除图片
  deleteWaterImage(e) {
    const _index = e.currentTarget.dataset.index;
    !this.data.showAddImg && (this.setData({
      showAddImg: true
    }))
    const list = this.data.waterList.filter((i, index) => _index !== index)
    this.setData({
      waterList: list
    })
  },
  // 采集信息 跳转 确认信息页面
  toConfirmInfo() {
    const wm_no = this.data.selectradio_info.wm_no;
    const wm_name = this.data.selectradio_info.wm_name;
    let reading = this.data.reading;
    const total_money = this.data.total_money;
    const total_water = this.data.total_water;
    const waterList = this.data.waterList;
    const last_reading = this.data.selectradio_info.last_reading;
    const last_time = this.data.selectradio_info.last_time;
    const now_time = this.data.now_time;
    const months = this.data.months;
    const imageUrl = waterList[0] ? waterList[0].tempFilePath : '';
    const is_T = this.data.is_T;
    let flag = true;
    if (!wm_no) {
      flag = false
      this.setData({
        wm_no_error: true
      })
    }
    if(!is_T){
      if (!reading) {
        flag = false
        this.setData({
          reading_error: true
        })
      }
      if (Number(reading) < Number(this.data.selectradio_info.last_reading)) {
        wx.showToast({
          title: `${this.data.langVersion == 1?'Leitura do contador ≥ Leitura anterior':'用水量需要大于等于上一次用水量'}`,
          duration: 3000,
          icon: 'none'
        })
        this.setData({
          reading_error: true
        })
        return
      }
    }
    
    
    if (!imageUrl && !is_T) {
      flag = false
      this.setData({
        image_error: true
      })
    }
    if (!now_time && is_T) {
      flag = false
      this.setData({
        data_error: true
      })
    }
    if (!flag) {
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
      return
    }

    // 计算包月 当前用水量 -----  ↓
    if(is_T){
      // 获取价格类型
      let fbUserType = JSON.parse(wx.getStorageSync('fbUserType'));
      // 获取当前选中用户的 类型 下的固定用水量 water_num
      let id = this.data.selectradio_info.user_type_id;
      let water_num = 0;
      fbUserType.forEach(ele => {
        if(ele.id == id){
          water_num = ele.water_num
          }
      });
      let months = this.data.months;
      reading = Number(last_reading) + Number(months * Number(water_num))
    }
    // 计算包月 当前用水量 -----  ↑

    wxAsyncApi('navigateTo', {
      url: `/pages/query-water/pay/confirm-info/index?wm_no=${wm_no}&wm_name=${wm_name}&total_money=${total_money}&total_water=${total_water}&reading=${reading}&imageUrl=${imageUrl}&last_reading=${last_reading}&last_time=${last_time}&now_time=${now_time}&months=${months}&is_T=${is_T}&pageUrl=collectInfo`,
      // url: `/pages/query-water/pay/print-info/index?wm_no=${wm_no}&total_money=${total_money}&total_water=${total_water}&reading=${reading}&imageUrl=${imageUrl}&last_reading=${last_reading}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  onShowPopup() {
    const select = this.selectComponent('#select')
    select && select.setColumnIndex(0, this.data.selectIndex)
    this.setData({
      show: true
    })
  },
  onClosePopup() {
    this.setData({
      show: false
    })
  },
  handleSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    console.log(e.detail)
    this.setData({
      selectIndex: index,
      select_type: value.id,
      type_seach: 'seach',
      page: 1,
      select_value: '',
      radioList: []
    });
    this.onClosePopup()
  },
  // 

  // 搜索 Change 事件
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      select_value: value,
    })
  },
  //搜索 失焦赋值 
  handlesearchReading(e) {
    const select_value = e.detail.value;
    this.setData({
      select_value,
      type_seach: 'type'
    })
  },
  // 搜索事件
  handleSearchInfo() {
    let that = this;
    that.setData({
      page: 1,
      radioList: [],
      selectradio_info: {},
      reading: '',
      total_water: '',
      now_time: '',
      months: '',
      total_money: '',
      waterList: [],
      radio: 0,
    })
    that.getlist();
  },
  getlist(){
    let that = this;
    let p = {
      select: this.data.select_value,
      type: this.data.select_type,
      page: this.data.page,
    }
    if( p.type == 5){
      p.lng = that.data.longitude;
      p.lat = that.data.latitude;
    }
    wx.showLoading({
      title: lang.message.loading,
    })
    isAdmin(p).then(res => {
      wx.hideLoading();
      if(res.code == 200){
        const radioList = this.data.radioList.concat(res.data.data || [])
        if(radioList.length > 0){
          this.setData({
            dialog_show: true
          })
        }else{
          wx.showToast({
            title: this.data.lang.noData,
            icon:'none'
          })
        }
        this.setData({
          radioList,
        })
      }else{
        wx.showToast({
          title: res.desc,
          icon:'none'
        })
      }
     
      // this.waterCount()
    }).catch(e =>{
      wx.hideLoading();
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon:'none'
      })
    })
  },
  onChange(event) {
    console.log(event)
    this.setData({
      radio: event.detail,
    });
  },
  onClick(event) {
    console.log(event)
    const { name } = event.currentTarget.dataset;
    let user_type_id =  event.currentTarget.dataset.item.user_type_id;
    if (user_type_id == 8 || user_type_id == 9 || user_type_id == 10){
      this.setData({
        is_T: true,
        selectradio_info: event.currentTarget.dataset.item,
      })
      let time = new Date().getTime();
      this.getNowTime(time);
    }else{
      this.setData({
        is_T: false,
        selectradio_info: event.currentTarget.dataset.item,
      })
    }
    this.setData({
      radio: name,

    });
  },
  onClose_dialog(){
    if(!this.data.radio){
      this.setData({ 
        dialog_show: false,
        selectradio_info: {},
       });
      return
    }else{
      this.setData({ 
        dialog_show: false,
        wm_no_error:false
       });
    }

    
  },
  bindscrolltolower(){
    console.log('底部')
    let page = this.data.page;
    page += 1
    this.setData({
      page,
    })
    this.getlist()
  },
  clickLook(){
    let that = this;
    wxAsyncApi('getFuzzyLocation').then(res =>{
      console.log(res)
      that.setData({
        radio: 0,
        radioList: [],
        select_value:'',
        page: 1,
        select_type: 5,
        latitude: res.latitude,
        longitude: res.longitude,
      })
      // 搜索事件
      that.getlist();
    }).catch(fail =>{
      console.log('getFuzzyLocation: fail')
      console.log(fail)
    })
  },
  onOpenTimeSelect() {
    this.setData({
      showSelectTime: true,
      currentDate: new Date().getTime()
    })
  },
  onCloseTimeSelect() {
    this.setData({
      showSelectTime: false,
    })
  },
  handleGetTime(e) {
    const date = new Date(e.detail)
    this.getNowTime(date);
  },
  getNowTime(time) {
    const date = new Date(time)
    const year = Number( date.getFullYear() )
    const month = Number( date.getMonth() + 1 )
    const day = Number( date.getDate() )
    const value = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
    this.setData({
      data_error: false,
      now_time: value
    })
    this.onCloseTimeSelect();
    this.waterCount();
  },

  goToFecho(){
    wxAsyncApi('navigateTo', {
      url: '/pages/query-water/fecho/index',
    }).then(res => {
      // wx.setNavigationBarTitle({
      //   title: lang.message.fecho,
      // })
    })
  },
})