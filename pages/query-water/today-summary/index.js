// pages/maintenance/today-summary/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  payWaterList,getAdminList
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
    admin_name:'', // 管理员搜索字段
    show: false,
    selectIndex: 0, // 状态索引
    isScroll: false,
    loading: lang.message.scrollLoading,
    title_active: 1,
    adminList: [],
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      adminList: [],
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    if(this.data.title_active == 1){
      this.getList()
    }else{
      this.getadminList();
    }

  },
  // 管理员 input 事件
  handleChangeAdminName(e) {
    const value = e.detail
    this.setData({
      admin_name: value,
    })
  },
  // 管理员搜索事件
  onAdminNameSearch(){
    this.setData({
      adminList: [],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    this.getadminList()
  },
  // 水表用户 input 事件
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      wm_no: value,
    })
  },
  // 水表用户搜索事件
  onSearch() {
    this.setData({
      adminList: [],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading
    })
    this.getList()
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
      adminlList:[],
      list: [],
      page: 1,
      total: 0,
      isScroll: true,
      loading: ''
    })
    if(this.data.title_active == 1){
      this.getList()
    }else{
      this.getadminList();
    }
  },
  //
  getadminList(){
    const params = {
      page: this.data.page,
      stime: this.data.startTime,
      etime: this.data.endTime,
      select: this.data.admin_name,
    }
    getAdminList(params).then(res => {

      const data = res.data.data || []
      const adminList = this.data.adminList.concat(data)
      // const total = res.data.list.total
      this.setData({
        adminList,
        // total
      })
    }).catch(res => {})
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
  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      adminList: [],
      list: [],
      wm_no: '',
      admin_name:'', // 管理员搜索字段
      page: 1,
      total: 0,
      isScroll: true,
      lang: lang.todaySummary,
      langIndex: lang.index,
      langDialog: lang.dialog,
      loading: lang.message.scrollLoading,
      title_active,
    })
  }
})