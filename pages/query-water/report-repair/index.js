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
    parent_type_error: false,
    parent_type:'', // 投诉或者申请 key
    typeLabel_1: '', // 投诉或者申请 text
    show_1:false,
    type_error: false,
    type: '',
    typeLabel: '',
    report_note_error: false,
    report_note: '',
    show: false,
    columns_1: [
      {key: 1,text: 'Pidido'},  //投诉
      {key: 2,text: 'Reclamacao'},   //申请
    ],
    image_error: false,
    autosize: {
      maxHeight: 140,
      minHeight: 140
    },
    // 搜索用户功能 ↓
    selectIndex: 0,
    type_show: false,
    list: [],
    searchStatusList: [],
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
    area1: '',
    area2: '',
    area3: '',
    areavalue: '', // 地区
    showSelect: false,  // 地区弹窗
    columns_add: [],
    columnsIndex: [0, 0, 0],
    confirmIndex: [0, 0, 0],
    confirmValue: [0, 0, 0],
    address: '', //详细地址
    wm_no: '',
    required_wm_no:false,
    is_return: true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    lang = app.globalData.lang
    const repair_type = app.globalData.repair_type
    const columns = Object.keys(repair_type).map(i => ({
      key: i,
      text: repair_type[i]
    }))
    this.setData({
      columns,
      lang: lang.reportRepair,
      langMessage: lang.message,
      langDialog: lang.dialog,
      btnName: lang.btnName,
    })
  },
  onShow(){
    lang = app.globalData.lang
    this.setData({
      lang: lang.reportRepair,
      langMessage: lang.message,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      searchStatusList: lang.searchStatusList, 
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
  onType1Open() {
    this.setData({
      show_1: true
    })
  },
  onCloseType1Select() {
    this.setData({
      show_1: false
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
  // 弹窗选择维修类型
  onConfirmType1Select(e) {
    const parent_type = e.detail.value.key
    const typeLabel_1 = e.detail.value.text
    this.setData({
      parent_type,
      parent_type_error: false,
      typeLabel_1,
    })
    this.onCloseType1Select();
  },
  // 弹窗选择维修类型
  onConfirmSelect(e) {
    console.log(e)
    const type = e.detail.value.key
    const typeLabel = e.detail.value.text
    if (type === '1') {
      this.setData({
        required_wm_no: true
      })
    } else {
      this.setData({
        required_wm_no: false
      })
    }
    this.setData({
      type,
      type_error: false,
      typeLabel,
    })
    this.onCloseSelect()
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
    return {
      year,
      month,
      day,
      time,
      timestamp
    }
  },

  // 点击提交按钮
  handleReportRepair() {
    let that = this;
    const type = this.data.type
    const parent_type = this.data.parent_type
    const report_note = this.data.report_note
    const waterList = this.data.waterList
    console.log(waterList)
    // const data = wixiForm.getFormData()
    if (!parent_type) {
      this.setData({
        parent_type_error: true
      })

    }
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
    if (type && waterList && report_note) {
      const baseUrl = getApp().globalData.baseUrl;
      const token = wx.getStorageSync('token');
      let report_date = that.handleTimeValue().time;
      const params = {
        report_date,
        report_note,
        parent_type,
        type,
      }
      if (type === '1') {
        params.wm_no = this.data.wm_no
      } else {
        params.area1 = this.data.area1,
        params.area2 = this.data.area2,
        params.area3 = this.data.area3,
        params.address = this.data.wm_address
      }
      console.log(params)
      if( !is_return ){
        return
      }
      this.setData({
        is_return: false
      })
      wx.showLoading({
        title: '',
      })
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
          wx.hideLoading();
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
          this.setData({
            is_return: true
          })
        },
        fail(e) {
          console.log(e)
          wx.hideLoading();
          this.setData({
            is_return: true
          })
        }
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
    console.log(event)
    const item = event.currentTarget.dataset.item;
    const { name } = event.currentTarget.dataset;
    const area = app.globalData.area;
    const values1 = area.map(i => i.name); // 省
    const values2 = area[0].areas.map(i => i.name);  // 市
    const values3 = area[0].areas[0].areas.map(i => i.name); // 区
    let a_1 = '';
    let a_2 = '';
    let a_3 = '';
    let item_1 = [];
    let item_2 = [];
    area.forEach(ele =>{
      if(ele.name == item.area1){
        a_1 = ele.id;
        item_1 = ele.areas;
      }
    })
    item_1.forEach(ele =>{
      if(ele.name == item.area2){
        a_2 = ele.id;
        item_2 = ele.areas;
      }
    })
    item_2.forEach(ele =>{
      if(ele.name == item.area3){
        a_3 = ele.id;
      }
    })
    console.log(a_1);
    console.log(a_2);
    console.log(a_3);
    const columns_add = [{
      values: values1,
    }, {
      values: values2,
    }, {
      values: values3,
    }]
    this.setData({
      areavalue: item.area1 + ' ' + item.area2 + ' ' + item.area3,
      area1: a_1,
      area2: a_2,
      area3: a_3,
      columns_add,
      wm_address: item.wm_address,
      radio: name,
      wm_no: event.currentTarget.dataset.item.wm_no,
      selectradio_info: item,
    })
  },
  // 地区
  onOpenSelect(e) {
    const area = app.globalData.area
    const picker = this.selectComponent('#wixi-area')
    const confirmIndex = this.data.confirmIndex
    if (picker) {
      confirmIndex.forEach((i, index) => {
        if (index === 0) {
          picker.setColumnValues(1, area[i].areas.map(i => i.name));
        } else if (index === 1) {
          picker.setColumnValues(2, area[confirmIndex[index - 1]].areas[i].areas.map(i => i.name));
        } else {
          setTimeout(() => {
            picker.setColumnIndex(index, i)
          }, 200)
        }
        picker.setColumnIndex(index, i)
      })
    }
    this.setData({
      showSelect: true,
      formIndex: e.currentTarget.dataset.index,
      columnsIndex: [...confirmIndex]
    })
  },
  onChangeSelect(e) {
    const area = app.globalData.area
    const {
      picker,
      index,
      value
    } = e.detail;
    if (index === 0) {
      const indexValue = value[index]
      const _columnsIndex = area.findIndex(i => i.name = indexValue)
      const columnsIndex = [_columnsIndex, 0, 0]
      this.setData({
        columnsIndex
      })
      // const _index = area[0].areas.findIndex(i => i.name === value[index])
      picker.setColumnValues(1, area[_columnsIndex].areas.map(i => i.name));
      picker.setColumnValues(2, area[_columnsIndex].areas[0].areas.map(i => i.name));
    } else if (index === 1) {
      const columnsIndex = this.data.columnsIndex
      const _index = area[columnsIndex[0]].areas.findIndex(i => i.name === value[index])
      columnsIndex[1] = _index
      columnsIndex[2] = 0
      this.setData({
        columnsIndex
      })
      picker.setColumnValues(2, area[columnsIndex[0]].areas[_index].areas.map(i => i.name));
    }

  },
  onConfirmAddSelect(e) {
    const {
      index,
      value
    } = e.detail
    console.log(e)
    const area = app.globalData.area;
    const confirmValue = this.data.confirmValue;
    const areavalue = value.join(',');
    console.log(area)
    index.forEach((i, _index) => {
      if (_index === 0) {
        confirmValue[_index] = area[i].id
      } else if (_index === 1) {
        confirmValue[_index] = area[index[0]].areas[i].id
      } else {
        confirmValue[_index] = area[index[0]].areas[index[1]].areas[i].id
      }
    })
    this.setData({
      confirmIndex: index,
      confirmValue,
      area1: confirmValue[0],
      area2: confirmValue[1],
      area3: confirmValue[2],
      areavalue,
    })
    this.onCloseAddSelect();
  },
  onCloseAddSelect() {
    this.setData({
      showSelect: false
    })
  },
})