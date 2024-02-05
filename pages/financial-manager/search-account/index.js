// pages/financial-manager/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  searchBillList,
} from './../../../apis/financial-manager'
import {
  wxAsyncApi
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.financial,
    langIndex: lang.index,
    langDialog: lang.dialog,

    pay_way: '1',
    stas: {},
    list: [],
    payWayList: [],
    statusList: [],

    page: 1,
    total: 0,

    wm_no: '',
    status: '',

    show: false,
    selectIndex: 0, // 状态索引
    isScroll: true,
    loading: lang.message.scrollLoading
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    this.setData({
      page: 1,
      loading: lang.message.scrollLoading,
      isScroll: true,
      list: [],
      lang: lang.financial,
      langIndex: lang.index,
      langDialog: lang.dialog,
    })
    this.getListData()
  },
  onChange(e) {
    const pay_way = e.detail.name
    console.log(pay_way)
    this.setData({
      pay_way,
      wm_no: '',
      status: '',
      selectIndex: 0
    })
    this.handleSearchInfo()
  },
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      wm_no: value,
    })
  },
  handleSearchInfo() {
    this.setData({
      page: 1,
      list: [],
      isScroll: true,
      loading: lang.message.scrollLoading
    })
    this.getListData()
  },

  getListData() {
    const params = {
      wm_no: this.data.wm_no,
      status: this.data.status,
      pay_way: this.data.pay_way,
      page: this.data.page
    }
    searchBillList(params).then(res => {
      const list = this.data.list.concat(res.data.list.data || [])
      const total = res.data.list.total || 0
      const stas = res.data.stas
      // const total = res.data.list.total || 0
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      const payWayList = Object.keys(res.data.pay_way).map(i => ({
        text: res.data.pay_way[i],
        key: i
      }))
      this.setData({
        list,
        stas,
        total,
        statusList,
        payWayList,
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
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    wxAsyncApi('navigateTo', {
      url: `/pages/user-water-info/index?data=${data}&source=financial-manager`,
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
    console.log(e)
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

})