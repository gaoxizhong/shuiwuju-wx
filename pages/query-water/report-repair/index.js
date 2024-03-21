// pages/query-water/report-repair/index.js
const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
} = require('./../../../utils/util')
import {
  isAdmin
} from './../../../apis/admin'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.reportRepair,
    langMessage: lang.message,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    size: {
      maxHeight: 100,
      minHeight: 100
    },
    showAddImg: true,
    waterList: [],
    form: [],
    type_error: false,
    type: '',
    typeLabel: '',
    report_note_error: false,
    report_note: '',
    show: false,
    columns: [],
    image_error: false,
    autosize: {
      maxHeight: 140,
      minHeight: 140
    },
    // 搜索用户功能 ↓
    selectIndex: 0,
    type_show: false,
    list: [],
    statusList: [
      {id: 1,text: 'Dados do contador'}, // 水表号
      {id: 2,text: 'Nome de usuário'},  // 用户名
      {id: 3,text: 'Endereço detalhado'}, // 用户地址
      {id: 4,text: 'Nº de Porta'}  // 门牌号
    ],
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号 5 . 附近
    select_value:'', // 查询内容
    payWayList: [],
    radio: 0,
    selectradio_info:{},
    dialog_show: false,
    page: 1,
    radioList:[],
    select_value:'', // 查询内容
    type_seach: 'seach', // type - - 选类型  seach 输入
    // 搜索用户功能 ↑

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const form = lang.reportRepair.form.map(i => ({
      ...i,
      value: ''
    }))
    const repair_type = app.globalData.repair_type
    const columns = Object.keys(repair_type).map(i => ({
      key: i,
      text: repair_type[i]
    }))
    this.setData({
      form,
      columns,
      lang: lang.reportRepair,
      langMessage: lang.message,
      langDialog: lang.dialog,
      btnName: lang.btnName,
    })
  },
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
      // type_seach: 'type'
    })
  },
  // 搜索事件
  handleSearchInfo() {
    let that = this;
    that.setData({
      page: 1,
      radioList: []
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
        })

        if (list.length >= 1) {
          this.setData({
            image_error: false,
            showAddImg: false
          })
        }
      }
    })
  },
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
  handleInputReportNote(e) {
    const report_note = e.detail
    this.setData({
      report_note_error: false,
      report_note
    })
  },
  onOpen() {
    this.setData({
      show: true
    })
  },
  onCloseSelect() {
    this.setData({
      show: false
    })
  },
  onConfirmSelect(e) {
    const type = e.detail.value.key
    const typeLabel = e.detail.value.text

    // const form = this.data.form
    // form.forEach(i => {
    //   if (i.key === 'wm_no') {
    //     i.required = (type === '1')
    //   } else {
    //     i.required = (type !== '1')
    //   }
    // })
    this.setData({
      type,
      type_error: false,
      typeLabel,
      form
    })
    this.onCloseSelect()
  },
  handleReportRepair() {
    const wixiForm = this.selectComponent('#report-repair-form')
    const type = this.data.type
    const report_note = this.data.report_note
    const waterList = this.data.waterList
    if (!wixiForm) {
      return
    }
    const data = wixiForm.getFormData()
    if (!type) {
      this.setData({
        type_error: true
      })

    }
    if (!waterList.length) {
      this.setData({
        image_error: true
      })
    }
    if (!report_note) {
      this.setData({
        report_note_error: true
      })
    }
    if (data && type && waterList && report_note) {
      const baseUrl = getApp().globalData.baseUrl
      const token = wx.getStorageSync('token')
      const params = {
        report_note,
        type,
      }
      if (type === '1') {
        params.wm_no = data.wm_no
      } else {
        params.area1 = data.area1
        params.area2 = data.area2
        params.area3 = data.area3
        params.address = data.wm_address
      }
      wx.uploadFile({
        filePath: waterList.length ? waterList[0].tempFilePath : '',
        name: 'report_pic',
        url: `${baseUrl}/api/wx/fb/fb_report_repair`,
        header: {
          'Authorization': token ? 'Bearer ' + token : '',
        },
        formData: {
          ...params
        },
        success(res) {
          const data = JSON.parse(res.data)
          if (data.code !== 200) {
            wx.showToast({
              title: data.desc,
              duration: 2000,
              icon: 'none'
            })
          } else {
            wx.showToast({
              title: lang.message.success,
              duration: 2000,
              icon: 'none'
            })
            wx.navigateBack({
              delta: -1
            })
          }
        },
        fail(res) {}
      })
    } else {
      wx.showToast({
        title: lang.message.formWarning,
        duration: 2000,
        icon: 'none'
      })
    }

  },
  onShowPopup() {
    const select = this.selectComponent('#select')
    select && select.setColumnIndex(0, this.data.selectIndex)
    this.setData({
      type_show: true
    })
  },
  onClosePopup() {
    this.setData({
      type_show: false
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
      // type_seach: 'seach',
      page: 1,
      select_value: '',
      radioList: []
    });
    this.onClosePopup()
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
  onChange(event) {
    console.log(event)
    this.setData({
      radio: event.detail,
    });
  },
  onClick(event) {
    const { name } = event.currentTarget.dataset;
    const form = this.data.form;
    form[0].value = event.currentTarget.dataset.item.wm_no;
    this.setData({
      form,
      radio: name,
      wm_no: event.currentTarget.dataset.item.wm_no,
      selectradio_info: event.currentTarget.dataset.item,
    })
   
    console.log(form)
  },
})