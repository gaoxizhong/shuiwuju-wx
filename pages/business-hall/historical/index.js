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
    page: 1,
    total: 0,
    isScroll: true,
    loading: '',
    list: [],
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

  getListData() {
    const params = {
      page: this.data.page,
    }
    getBusinessHallList(params).then(res => {
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
 
  },
  // 点击交班按钮
  goToFecho(){
  
  },
})