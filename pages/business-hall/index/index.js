// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getBusinessHallList,
} from './../../../apis/business-hall'
import {
  delUserPayment,
} from './../../../apis/water'

import {
  wxAsyncApi
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userWaterInfo: lang.userWaterInfo,
    lang: lang.index,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    wm_no: '',
    is_seach: false,
    status: '',

    selectIndex: 0,
    show: false,

    page: 1,
    total: 0,

    isScroll: true,
    loading: '',

    list: [],
    statusList: [],
    payWayList: [],
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号
    select_value:'', // 查询内容
    Type_statusList: [
      {id: 1,text: 'Dados do contador'},
      {id: 2,text: 'Nome de usuário'},
      {id: 3,text: 'Endereço detalhado'},
      {id: 4,text: 'Nº de Porta'}
    ],
    selectTypeIndex: 0,
    Type_show: false,
    type_seach: 'type', // type - - 选类型  seach 输入
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    this.setData({
      page: 1,
      loading: '',
      isScroll: true,
      list: [],
      lang: lang.index,
      langDialog: lang.dialog,
    })
    this.getListData()
  },
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      select_value: value,
    })
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const select_value = e.detail.value;
    this.setData({
      select_value,
      type_seach: 'type'
    })
  },
  handleSearchInfo() {
    this.setData({
      page: 1,
      list: [],
      isScroll: true,
      loading: ''
    })
    this.getListData()
  },

  getListData() {
    const params = {
      wm_no: this.data.wm_no,
      status: this.data.status,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    console.log(params)
    getBusinessHallList(params).then(res => {
      const list = this.data.list.concat(res.data.list.data || [])
      const total = res.data.list.total || 0
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      const payWayList = res.data.pay_way.map(i => ({
        text: i.title,
        key: i.key
      }))
      this.setData({
        list,
        total,
        statusList,
        payWayList,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
      if(this.data.wm_no){
        this.setData({
          is_seach: true
        })
      }else{
        this.setData({
          is_seach: false
        })
      }
    })
  },
  addListData() {
    let page = this.data.page
    const total = this.data.total
    if (total >= page * 15) {
      page += 1
      this.setData({
        page,
        loading: `${lang.message.loading}...`,
        isScroll: false,
      })
      this.getListData()
    } else {
      this.setData({
        loading: lang.message.noMoreEmpty,
      })
    }
  },
  handleDetails(e) {
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    const payWayList = JSON.stringify(this.data.payWayList)
    wxAsyncApi('navigateTo', {
      url: `/pages/user-water-info/index?data=${data}&payWayList=${payWayList}&source=business-hall`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  // 点击历史记录按钮
  goToHistorio(){
    wxAsyncApi('navigateTo', {
      url: '/pages/business-hall/historical/index',
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.historio,
      })
    })
  },
  // 点击交班按钮
  goToFecho(){
    wxAsyncApi('navigateTo', {
      url: '/pages/business-hall/fecho/index',
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.fecho,
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
    this.setData({
      selectIndex: index,
      status: value.key,
      page: 1,
      list: [],
      isScroll: true,
      loading: ''
    });
    this.onClosePopup()
    this.getListData()
  },
  // 点击缴费按钮
  clickPayBtn(){
    wxAsyncApi('navigateTo', {
      url: `/pages/user-total-info/index?wm_no=${this.data.wm_no}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  onShowTypePopup() {
    console.log('#Type_select')
    const select = this.selectComponent('#Type_select')
    select && select.setColumnIndex(0, this.data.selectTypeIndex)
    this.setData({
      Type_show: true
    })
  },
  onCloseTypePopup() {
    this.setData({
      Type_show: false
    })
  },
  handleTypeSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    console.log(e.detail)
    this.setData({
      selectTypeIndex: index,
      select_type: value.id,
      type_seach: 'seach'
    });
    this.onCloseTypePopup()
  },
  clickDelete(e){
    let that = this;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    that.setData({
      del_selt_info: item,
      del_selt_index: index,
      del_pop: true,
    })
  },
  clickDeleteBtn(){
    let that = this;
    let del_selt_info = that.data.del_selt_info;
    let index = that.data.del_selt_index;
    let list = that.data.list;
    const params = {
      up_id: del_selt_info.up_id,
    }
    delUserPayment(params).then(res => {
      if(res.code == 0){
        wx.showToast({
          title: lang.message.success,
          icon: 'none'
        })
        list.splice(index,1);
        that.setData({
          list
        })
      }else{
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      }
    }).catch( e =>{
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
    })
  },
  clickdelPop(){
    this.setData({
      del_pop: false,

    })
  }
})