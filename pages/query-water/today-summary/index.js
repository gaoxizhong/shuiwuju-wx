// pages/maintenance/today-summary/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  payWaterList
} from './../../../apis/water'
const {
  wxAsyncApi,fmoney
} = require('./../../../utils/util')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.todaySummary,
    langIndex: lang.index,
    langDialog: lang.dialog,

    list: [],
    payWayList: [],
    statusList: [],

    page: 1,
    total: 0,

    today_bill_count: 0,
    today_bill_amount: 0,
    today_cash_count: 0,
    today_cash_amount: 0,
    today_card_count: 0,
    today_card_amount: 0,

    startTime: '',
    endTime: '',
    startDate: '',
    endDate: '',

    wm_no: '',
    status: '',

    show: false,
    selectIndex: 0, // 状态索引
    isScroll: false,
    loading: lang.message.scrollLoading
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    if (stime && etime) {
      this.getList()
    }

  },
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      wm_no: value,
    })
  },
  onSearch() {
    this.getList()
  },
  handleGetTime(e) {
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
    this.getList()
  },
  getList() {
    const params = {
      page: this.data.page,
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_no: this.data.wm_no,
      status: this.data.status
    }
    payWaterList(params).then(res => {
      const data = res.data.list.data || []
      const list = this.data.list.concat(data)
      const total = res.data.list.total
      const {
        today_bill_count,
        today_bill_amount,
        today_cash_count,
        today_cash_amount,
        today_card_count,
        today_card_amount,
      } = res.data.stas
      const payWayList = res.data.pay_way.map(i => ({
        text: i.title,
        key: i.key
      }))
      const statusList = Object.keys(res.data.status).map(i => ({
        text: res.data.status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      this.setData({
        list,
        total,
        today_bill_count,
        // today_bill_amount: fmoney(today_bill_amount),
        today_bill_amount,
        today_cash_count,
        today_cash_amount,
        today_card_count,
        today_card_amount,
        payWayList,
        statusList,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    }).catch(res => {})
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
      this.getList()
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
      url: `/pages/user-water-info/index?data=${data}&payWayList=${payWayList}&source=search-person`,
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

      isScroll: true,
      loading: ''
    });
    this.onClosePopup()
    this.getList()
  },
})