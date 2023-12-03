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
    wm_no_error: false,
    reading_error: false,
    image_error: false,
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
    statusList: [
      {id: 1,text: 'Dados do contador'},
      {id: 2,text: 'Nome de usuário'},
      {id: 3,text: 'Endereço detalhado'},
      {id: 4,text: 'Nº de Porta'}
    ],
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号 5 . 附近
    select_value:'', // 查询内容
    payWayList: [],
    radio: 0,
    selectradio_info:{},
    dialog_show: false,
    radioList:[],
    type_seach: 'type', // type - - 选类型  seach 输入
    page: 1,
    latitude: '',
    longitude: '',
  },
  onLoad() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.pay.collectInfo,
      btnName: lang.btnName,
      steps: lang.pay.steps,
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
    console.log(e)
    const type = e.currentTarget.dataset.type
    // const my_isAdmin = this.data.isAdmin
    // 判断用户是否存在
    if (!type) {
      const wm_no = e.detail.value
      let wm_no_error = this.data.wm_no_error
      this.setData({
        wm_no,
      })
      if (wm_no) {
        wm_no_error = false
        this.setData({
          wm_no_error
        })
        isAdmin({
          wm_no: wm_no
        }).then(res => {
          const {
            water_meter_exits,
            last_reading
          } = res.data
          this.setData({
            isAdmin: water_meter_exits,
            last_reading
          })
          if (!water_meter_exits) {
            this.setData({
              total_money: '',
              total_water: ''
            })
            wx.showToast({
              title: '未查询到用户，请输入正确的用户名',
              duration: 3000,
              icon: 'none'
            })
          }
          this.waterCount()
        })
      } else {
        this.setData({
          isAdmin: false,
          last_reading: 0,
          total_money: '',
          total_water: ''
        })
      }

    }else{

      const reading = e.detail.value
      console.log(reading)
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
            title: '用水量需要大于等于上一次用水量',
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

    }


  },
  // 计算金额和用水量
  waterCount() {
    const reading = this.data.reading
    const wm_no = this.data.selectradio_info.wm_no
    if (reading && wm_no) {
      const params = {
        wm_no,
        reading
      }
      countWater(params).then(res => {
        const {
          water = 1, price
        } = res.data
        this.setData({
          total_water: water,
          total_money: price
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
    const wm_no = this.data.selectradio_info.wm_no
    const reading = this.data.reading
    const total_money = this.data.total_money
    const total_water = this.data.total_water
    const waterList = this.data.waterList
    const last_reading = this.data.selectradio_info.last_reading
    const imageUrl = waterList[0] ? waterList[0].tempFilePath : ''
    let flag = true
    if (!wm_no) {
      flag = false
      this.setData({
        wm_no_error: true
      })
    }
    if (!reading) {
      flag = false
      this.setData({
        reading_error: true
      })
    }
    if (!imageUrl) {
      flag = false
      this.setData({
        image_error: true
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
    wxAsyncApi('navigateTo', {
      url: `/pages/query-water/pay/confirm-info/index?wm_no=${wm_no}&total_money=${total_money}&total_water=${total_water}&reading=${reading}&imageUrl=${imageUrl}&last_reading=${last_reading}`,
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
    let p = {
      select: this.data.select_value,
      type: this.data.select_type,
      page: this.data.page
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
    const { name } = event.currentTarget.dataset;
    this.setData({
      radio: name,
      selectradio_info: event.currentTarget.dataset.item
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
    this.handleSearchInfo();
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
      that.handleSearchInfo();
    }).catch(fail =>{
      console.log('getFuzzyLocation: fail')
      console.log(fail)
    })
  }

})