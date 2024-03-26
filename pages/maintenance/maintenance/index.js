// pages/maintenance/maintenance/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getMaintenanceList
} from './../../../apis/maintenance'
import {
  wxAsyncApi 
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.maintenance,
    langIndex: lang.index,
    langDialog: lang.dialog,
    wm_no: '',
    status: '',

    page: 1,
    per_page: 0,
    total: 0,

    list: [],
    statusList: [],

    show: false,
    selectIndex: 0,

    loading: lang.message.scrollLoading,
    isScroll: false,
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
      lang: lang.maintenance,
      langIndex: lang.index,
      langDialog: lang.dialog,
    })
    this.getListData()
  },
  getListData() {
    const areas = app.globalData.area
    const params = {
      wm_no: this.data.wm_no,
      status: this.data.status,
      page: this.data.page
    }
    getMaintenanceList(params).then(res => {
      const l = (res.data.list.data || []).map(i => {
        let a1, a2, a3
        a1 = areas.find(j => j.id === i.area1)
        if (a1) {
          a2 = a1.areas.find(j => j.id === i.area2)
          if (a2) {
            a3 = a2.areas.find(j => j.id === i.area3)
          }
        }
        const area = `${a1 ? a1.name : ''} ${a2 ? a2.name: ''} ${a3 ? a3.name : ''}`
        i.area = area
        return i
      })
      const list = this.data.list.concat(l)
      const total = res.data.list.total || 0
      const per_page = res.data.list.per_page
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      this.setData({
        list,
        per_page,
        total,
        statusList,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
    })
  },
  addListData() {
    let page = this.data.page
    const total = this.data.total
    const per_page = this.data.per_page
    if (total >= page * per_page) {
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
      loading: ''
    })
    this.getListData()
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
  handleDetails(e) {
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    wxAsyncApi('navigateTo', {
      url: `/pages/maintenance/maintenance-info/index?data=${data}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
})