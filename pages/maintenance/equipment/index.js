const app = getApp()
let lang = app.globalData.lang
const { wxAsyncApi } = require('../../../utils/util')

Page({
  data: {
    pageTitle: '',
    emptyText: '',
    entryList: [],
  },

  onLoad() {
    this.refreshLang()
    app.watchAuth(this.filterEntryList)
  },

  onShow() {
    this.refreshLang()
    this.filterEntryList()
  },

  refreshLang() {
    lang = app.globalData.lang
    this.setData({
      pageTitle: lang.equipmentMaintenance.pageTitle,
      emptyText: lang.index.noEmpty || lang.message.noMoreEmpty,
    })
    wx.setNavigationBarTitle({
      title: lang.equipmentMaintenance.pageTitle,
    })
  },

  matchItemAuth(itemAuth, userAuth) {
    if (!itemAuth || !userAuth) return false
    return String(itemAuth).split('').some(code => userAuth.includes(code))
  },

  filterEntryList() {
    const auth = app.globalData.auth || ''
    const list = (lang.equipmentMaintenance.list || []).filter(item => this.matchItemAuth(item.auth, auth))
    this.setData({ entryList: list })
  },

  handleEntryTap(e) {
    const index = e.currentTarget.dataset.index
    const item = this.data.entryList[index]
    if (!item || !item.url) return
    wxAsyncApi('navigateTo', {
      url: item.url,
    }).then(() => {
      wx.setNavigationBarTitle({
        title: item.tabberName || item.title,
      })
    })
  },
})
