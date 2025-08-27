// custom-tab-bar/index.js
const app = getApp()
let lang = app.globalData.lang
Component({
  /**
   * 页面的初始数据
   */
  data: {
    selected: 0,
    list: lang.tabber.list,
  },
  lifetimes: {
    attached() {
      lang = app.globalData.lang
      const _this = this
      app.watchLang(_this.setList.bind(_this))
    },
  },
  methods: {
    setList() {
      this.setData({
        list: lang.tabber.list
      })
    },
    toRouter(e) {
      const index = e.detail
      const item = this.data.list[index]
      wx.setStorageSync('tabberIndex', index)
      this.getTabBar().setData({
        selected: index
      })
      const pagePath = item.pagePath
      const title = item.text
      wx.switchTab({
        url: pagePath,
        success(res) {
          wx.setNavigationBarTitle({
            title: title,
          })
        },
        fail(res) {}
      })
    },
    onCenterClick() {
      wx.navigateTo({
        url: '/pages/index/account-search/index'
      });
    }
  }
})