// index.js
// 获取应用实例
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')

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
    payStatusList:[
      {"text":"Numerário","key":1},
      {"text":"Cartão Multicaixa","key":2},
      {"text":"Pagamento bancário","key":3}
    ],
    printInfo: ''
  },
  // 初始化 监听水表状态
  onLoad() {
    lang = app.globalData.lang
    const _this = this
    const userInfo = JSON.stringify(app.globalData.userInfo)
    console.log(userInfo)
    const auth = app.globalData.auth; 
    if(auth.indexOf('L') != -1){
      this.setData({
        is_L: true
      })
    } 
    if(auth.indexOf('R') != -1){
      this.setData({
        is_R: true
      })
    }
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

  // 打印信息
  imprimirInfo(e){
    let that = this;
    console.log(e)
    let item = e.currentTarget.dataset.item;
    return
    // 获取信息
    that.setData({
      printInfo:`
${item.wm_no}
Totalizador/Normal: ${item.is_share == 1?'Totalizador':'Normal'}
Unidades: ${item.household_num}
Localidade: ${item.area1} ${item.area2} ${item.area3} ${item.wm_address}
Nº de Porta: ${item.house_number}
Giro/Zona: ${item.area_code}

`
    })
    that.blueToothPrint();
  },
    // 蓝牙设备打印
    blueToothPrint() {
      const connectStorage = wx.getStorageSync('connectDevice')
      const connectDeviceInfo = connectStorage ? JSON.parse(connectStorage) : ''
      console.log(connectDeviceInfo)
      const lang = getApp().globalData.lang
      if (!connectDeviceInfo) {
        wx.showModal({
          title: lang.blueToolth.noConnect,
          content: lang.blueToolth.noConnectWarning,
          cancelText: lang.blueToolth.cancelText,
          confirmText: lang.blueToolth.confirmText,
          complete: (res) => {
            if (res.confirm) {
              wxAsyncApi('navigateTo', {
                url: `/pages/admin/bluetooth/index?origin=page`,
              }).then(res => {
                wx.setNavigationBarTitle({
                  title: lang.blueToolth.title,
                })
              })
            }
            if (res.cancel) {
              wx.showToast({
                title: lang.blueToolth.cancel,
                icon: "none",
              })
            }
          }
        })
      } else {
        console.log('已连接。。。')
        wx.showToast({
          title: lang.blueToolth.connectDevice,
          icon: "none",
          duration: 30000,
        })
       this.handlePrint(connectDeviceInfo)
      }
    },
    // 开始打印
    handlePrint(p) {
      // GBK.encode({string}) 解码GBK为一个字节数组
      let info = [
        ...blueToolth.printCommand.clear,
        ...this.arrEncoderCopy(this.data.printInfo),
        ...blueToolth.printCommand.enter
      ]
      console.log('开始打印，api传信息...')
      blueToolth.writeBLECharacteristicValue({
        ...p,
        value: new Uint8Array(info).buffer,
        lasterSuccess() {
          console.log('打印成功...')
          wx.showToast({
            title: lang.blueToolth.printSuccess,
            icon: "none",
            duration: 3000,
          })
          that.setData({
            pay_success: false,
          })
        },
        onFail(res){
          console.log('打印失败...')
          console.log(res)
        }
      });
    },
})