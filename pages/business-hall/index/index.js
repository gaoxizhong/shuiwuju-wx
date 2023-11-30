// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getBusinessHallList,
} from './../../../apis/business-hall'
import {
  wxAsyncApi
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
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
    statusList: [ 
      {id: 1,text: '水表'}
    ],
    payWayList: [],
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
      wm_no: value,
    })
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
    const wm_no = e.detail.value;
    this.setData({
      wm_no,
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
      page: this.data.page
    }
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
  }
})