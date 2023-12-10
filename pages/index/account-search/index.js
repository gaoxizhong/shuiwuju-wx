// index.js
// 获取应用实例
const app = getApp()
let lang = app.globalData.lang
import {
  searchWaterList
} from '../../../apis/home'
import {
  isAdmin
} from '../../../apis/admin'
const {
  wxAsyncApi
} = require('../../../utils/util')
Page({
  data: {
    lang: lang.index, // 语言
    langDialog: lang.dialog,
    wm_no: '', // 水表号、手机号
    status: '', // 状态

    selectIndex: 0, // 状态索引
    show: false, // 选择状态弹窗

    page: 1,
    total: 0,
    per_page: 0,

    list: [], // 展示账单列表
    isScroll: true,
    loading: '',
    userInfo: {},

    type_seach: 'type', // type - - 选类型  seach 输入
    select_value:'', // 查询内容
    statusList: [
      {id: 1,text: 'Dados do contador'},
      {id: 2,text: 'Nome de usuário'},
      {id: 3,text: 'Endereço detalhado'},
      {id: 4,text: 'Nº de Porta'}
    ],
  },
  // 初始化 监听水表状态
  onLoad() {
    lang = app.globalData.lang
    const _this = this
    const userInfo = app.globalData.userInfo || {}
    // app.watchBillStatus(_this.getStatusList)
    // this.getStatusList(app.globalData.billStatus)
    this.setData({
      lang: lang.index, // 语言
      langDialog: lang.dialog,
      userInfo
    })
  },
  onShow() {
    
  },
  getStatusList(values) {
    const statusList = Object.keys(values).map(i => ({
      key: i,
      text: values[i]
    }))
    statusList.unshift(lang.allOptions)
    this.setData({
      statusList
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
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      wm_no: value,
    })
  },
  // 搜索 Change 事件
  // handleChangeInput(e) {
  //   const value = e.detail
  //   this.setData({
  //     select_value: value,
  //   })
  // },
  //搜索 失焦赋值 
  handlesearchReading(e) {
    const select_value = e.detail.value;
    this.setData({
      select_value,
      type_seach: 'type'
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
  handleSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    this.setData({
      selectIndex: index,
      select_type: value.id,
      page: 1,
      list: [],
      isScroll: true,
      loading: '',
      select_value: '',
      type_seach: 'seach',
    });
    this.onClosePopup()
  },
  getListData() {

    const params = {
      // wm_no: this.data.wm_no,
      // status: this.data.status,
      // page: this.data.page
      select: this.data.select_value,
      type: this.data.select_type,
      page: this.data.page,
    }
    isAdmin(params).then(res => {
      const {
        total,
        data,
        per_page,
      } = res.data
      const list = this.data.list.concat(data || [])
      this.setData({
        total,
        per_page,
        list,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
      if (!list.length) {
        wx.showToast({
          title: lang.message.noMoreEmpty,
          icon: 'none',
          duration: 2000
        })
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  addListData() {
    let page = this.data.page
    let per_page = this.data.per_page
    const total = this.data.total
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
  handleDetails(e) {
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    return
    wxAsyncApi('navigateTo', {
      url: `/pages/user-water-info/index?data=${data}&source=user`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  }
})