// index.js
// 获取应用实例
const app = getApp()
let lang = app.globalData.lang
import {
  isAdmin
} from '../../../apis/admin'
const {
  wxAsyncApi,fmoney
} = require('../../../utils/util')
Page({
  data: {
    lang: lang.index, // 语言
    langDialog: lang.dialog,
    btnName: lang.btnName,
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
    is_L: false,
    is_R: false,
    is_GC: false,
    payStatusList:[
      {"text":"Numerário","key":1},
      {"text":"Cartão Multicaixa","key":2},
      {"text":"Pagamento bancário","key":3}
    ],
    printInfo: '',
    optionsPriceType: [],
    selectInfo: {},
    selectStatusPop: false
  },
  // 初始化 监听水表状态
  onLoad() {
    lang = app.globalData.lang
    const _this = this
    const userInfo = JSON.stringify(app.globalData.userInfo)
    console.log(userInfo)
    const auth = app.globalData.auth; 
    console.log(auth)
    if(auth.indexOf('GC') != -1){
      this.setData({
        is_GC: true,
      })
    } 
    if(auth.indexOf('L') != -1){
      this.setData({
        is_L: true, // 抄表员
      })
    } 
    if(auth.indexOf('R') != -1){
      this.setData({
        is_R: true // 收银员
      })
    }
    // app.watchBillStatus(_this.getStatusList)
    // this.getStatusList(app.globalData.billStatus)
    this.setData({
      lang: lang.index, // 语言
      langDialog: lang.dialog,
      userInfo
    })
     // 获取价格类型
     let fbUserType = JSON.parse(wx.getStorageSync('fbUserType'));
     let list = fbUserType.map(i => ({
       text: i.type_name,
       value: i.id
     }))
     this.setData({
       optionsPriceType: list
     })
  },
  onShow() {
    this.handleSearchInfo();
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
  // handleChangeInput(e) {
  //   const value = e.detail
  //   this.setData({
  //     wm_no: value,
  //   })
  // },
  // 搜索 Change 事件
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      select_value: value,
    })
  },
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
      type: this.data.select_type?this.data.select_type:1,
      page: this.data.page,
    }
    isAdmin(params).then(res => {
      const {
        total,
        data,
        per_page,
      } = res.data
      data.forEach(ele =>{
        ele.user_bal = fmoney(Number(ele.user_bal),2)
      })
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
  // 点击修改
  goToEdit(e){
    let item = e.currentTarget.dataset.item;
    const data = JSON.stringify(item);
    wxAsyncApi('navigateTo', {
      url: `/pages/water-info-edit/index?data=${data}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  handleDetails(e) {
    const index = e.currentTarget.dataset.index
    const data = JSON.stringify(this.data.list[index])
    wxAsyncApi('navigateTo', {
      url: `/pages/userInfoDetails/index?data=${data}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  goToDayin(e){
    console.log(e)
    let item = e.currentTarget.dataset.item;
    const payStatusList = JSON.stringify(this.data.payStatusList);
    // wxAsyncApi('navigateTo', {
    //   url: `/pages/query-water/pay/confirm-info/index?wm_no=${item.wm_no}&wm_name=${item.wm_name}&total_money=${item.user_bal}&total_water=${item.last_reading}&reading=${item.last_reading}&imageUrl=''&last_reading=${0}&pageUrl=accountsearch`,
      wxAsyncApi('reLaunch', {
        url: `/pages/query-water/pay/print-info/index?wm_no=${item.wm_no}&wm_name=${item.wm_name}&total_money=${item.user_bal}&order_no=''&total_water=${item.last_reading}&reading=${item.last_reading}&imageUrl=''&last_reading=${item.last_reading}&up_id=''&check_time_text=${item.updated_at}&payStatusList=${payStatusList}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  goTojiaofei(e){
    let item = e.currentTarget.dataset.item;
    wxAsyncApi('navigateTo', {
      url: `/pages/user-total-info/index?wm_no=${item.wm_no}&wm_name=${item.wm_name}&source=business-hall`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },

  // 点击修改状态按钮
  clickXgStatus(e){
    console.log(e)
    this.setData({
      selectInfo: e.currentTarget.dataset.item
    })
  }



 
})