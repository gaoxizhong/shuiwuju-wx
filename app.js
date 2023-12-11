// app.js
import {
  getLang
} from './lang/index'
import {
  getUserInfo,
  getToken,
  getArea,
  updateLang,
  fbUserType
} from './apis/app'
import {
  wxAsyncApi
} from './utils/util'
App({
  onLaunch() {
    wx.setStorageSync('connectDevice', '')
    wx.setStorageSync('foreverDevice', '')
    wx.setStorageSync('tabberIndex', 0)
    // wx.setStorageSync('langversion', 1)
    const lang = getLang()
    this.globalData.lang = lang
    wx.setNavigationBarTitle({
      title: lang.tabber.list[0].text,
    })
    // 登录
    this.appLogin()
  },
  globalData: {
    userInfo: null,
    lang: null,
    tabberList: [],
    auth: [],
    area: [],
    baseUrl: 'https://swj-admin.qingshanpai.com',
    billStatus: null, // 水表单状态
    wm_id: '',
    repair_type: []
  },
  // 登录
  appLogin() {
    wxAsyncApi('login').then(res => {
      //获取token
      this.getUserToken(res)
      // 获取价格类型
      this.getFbUserType();
    }).catch(res => {})
  },
  // 获取用户token
  getUserToken(data) {
    getToken({
      code: data.code
    }).then(res => {
      wx.setStorageSync('token', res.data.api_token)
      // 设置语言
      this.setLang(1)
    }).catch((res) => {})
  },
  // 获取价格类型
  getFbUserType() {
    fbUserType({}).then(res => {
      let list = JSON.stringify(res.data.data);
      wx.setStorageSync('fbUserType',list)
    }).catch((res) => {})
  },
  // 设置语言
  setLang(langType) {
    let type = 'pt'
    if (langType === 0) {
      type = 'zh-CN'
    }
    wx.setStorageSync('langversion', langType)
    const lang = getLang()
    this.globalData.lang = lang
    console.log(this.globalData.lang)
    wx.setNavigationBarTitle({
      title: lang.tabber.list[0].text,
    })
    const params = {
      lang: type
    }
    return new Promise(reslove => {
      updateLang(params).then(res => {
        this.handleUserInfo()
        this.handleArea()
        reslove()
      })
    })

  },
  // 切换语言
  changeLang(lang) {
    this.setLang(lang).then(res => {
      wx.reLaunch({
        url: '/pages/index/index',
      })
    })
  },
  // 获取用户信息
  handleUserInfo() {
    getUserInfo().then(res => {
      const data = res.data
      // 设置用户权限
      const auth = data.my_roles && data.my_roles.length ? data.my_roles.map(i => i.name) : []
      wx.setStorageSync('employee', data.is_admin)
      this.setAuth(auth)
      // 水表状态列表
      this.globalData.billStatus = data.bill_status
      // 本人系统id
      this.globalData.wm_id = data.user.admin_id
      // 
      this.globalData.repair_type = data.repair_type
      // userinfo
      this.globalData.userInfo = data.admin_auth
    }).catch(e =>{
      console.log(e)
    })
  },
  // 获取国家省市区
  handleArea() {
    getArea().then(res => {
      this.globalData.area = res.data.list || []
    }).catch(res => {})
  },
  // 监听用户权限变化
  watchAuth(fn) {
    const obj = this.globalData
    let auth = this.globalData.auth
    Object.defineProperty(obj, 'auth', {
      // configurable: true,
      // enumerable: true,
      set: (value) => {
        auth = value
        fn(value)
      },
      get() {
        return auth
      }
    })
  },
  // 监听语言变化
  watchLang(fn) {
    const obj = this.globalData
    let lang = this.globalData.lang
    Object.defineProperty(obj, 'lang', {
      // configurable: true,
      // enumerable: true,
      set: (value) => {
        lang = value
        fn(value)
      },
      get() {
        return lang
      }
    })
  },
  // 监听水表状态列表
  watchBillStatus(fn) {
    const obj = this.globalData
    let billStatus = this.globalData.billStatus
    Object.defineProperty(obj, 'billStatus', {
      // configurable: true,
      // enumerable: true,
      set: (value) => {
        billStatus = value
        fn(value)
      },
      get() {
        return billStatus
      }
    })
  },
  // 设置用户权限
  setAuth(auth) {
    // 设置全局tabber列表
    const tabberLang = this.globalData.lang.tabber
    this.globalData.tabberList = tabberLang.list
    this.globalData.auth = auth // 职位
  },
})