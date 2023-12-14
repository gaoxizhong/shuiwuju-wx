// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getUserPayLog,
} from './../../../apis/water'
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
    page: 1,
    total: 0,
    isScroll: true,
    loading: '',
    list: [],
    stime: '', // 开始时间
    etime: '', // 结束时间
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      page: 1,
      total: 0,
      loading: '',
      isScroll: true,
      list: [],
      lang: lang.index,
      langDialog: lang.dialog,
    })
    if (stime && etime) {
      this.getListData()
    }
  },
  handleGetTime(e) {
    console.log(e)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    this.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      loading: ''
    })
    this.getListData()
  },
  getListData() {
    const params = {
      page: this.data.page,
      stime: this.data.startTime,
      etime: this.data.endTime,
    }
    getUserPayLog(params).then(res => {
      const list = this.data.list.concat(res.data.list.data || [])
      const total = res.data.list.total || 0
      this.setData({
        list,
        total,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
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
    const id = e.currentTarget.dataset.id;
    const item = e.currentTarget.dataset.item;
    wxAsyncApi('navigateTo', {
      url: `/pages/business-hall/user-pay-info/index?id=${item.id}&wm_name=${item.wm_name}&wm_no=${item.wm_no}&total_money=${item.total_money}&pay_time=${item.pay_time}&pay_way=${item.pay_way}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  // 点击历史记录按钮
  goToHistorio(){
 
  },
  // 点击交班按钮
  goToFecho(){
  
  },
})