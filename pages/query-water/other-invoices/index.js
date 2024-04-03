// pages/business-hall/hecho/index.js
const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('../../../utils/bluetoolth')

const {
  wxAsyncApi,fmoney
} = require('../../../utils/util')
import {
  isAdmin,
  getTrPriceList, //获取收费及目标
  createPayDemandNote, // 创建收费账单
} from '../../../apis/admin'
//只需要引用encoding.js,注意路径
var encoding = require("../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userWaterInfo: lang.userWaterInfo,
    lang: lang.index,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    operator_name: '',
    name_error: false,
    printInfo:'', //  打印数据
    infoData: null,
    total_price: 0,
    cash_sum: 0,
    pos_sum: 0,
    transfer_accounts_sum: 0,
    actual_amount: '',
    Type_statusList: [
      {id: 1,text: 'Dados do contador'}, // 水表号
      {id: 2,text: 'Nome de usuário'},  // 用户名
      {id: 3,text: 'Endereço detalhado'}, // 用户地址
      {id: 4,text: 'Nº de Porta'}  // 门牌号
    ],
    type_seach: 'type', // type - - 选类型  seach 输入
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号 5 . 附近
    select_value:'', // 查询内容
    radioList: [],
    selectTypeIndex: 0,
    page: 1,
    selectradio_info:{},
    dialog_show: false,
    typeLabel_1: '', // 打印发票的种类 text
    parent_type_error: false,
    seltTypeInfo:{}, // 选择的打印种类
    show_1:false,
    columns_1: [], // 打印发票的种类列表
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getTrPriceList();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    
  },
  // 转二进制 并数组复制
  arrEncoderCopy(str){
    let data = str;
    // const encoder = new TextEncoder('cp860');  // 微信小程序不支持 new TextEncoder
    // let arr = [...encoder.encode(data)]
    // console.log(arr)
    //utf8
    let inputBuffer = new encoding.TextEncoder().encode(str);
    let arr = [ ...inputBuffer ]
    return arr
  },
  //获取当前时间
  handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date()
    const year = _date.getFullYear()
    const month = _date.getMonth() + 1
    const day = _date.getDate()
    const hh = _date.getHours()
    const mm = _date.getMinutes()
    const ss = _date.getSeconds()
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    const timestamp = new Date(year, month - 1, day, hh, mm, ss).getTime() / 1000
    return {
      year,
      month,
      day,
      time,
      timestamp
    }
  },
  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  },
   //获取收费及目标
  getTrPriceList(){
    getTrPriceList({}).then(res => {
      if(res.code == 200){
        let data = res.data.data;
        let columns_1 = [];
        data.forEach( ele =>{
          columns_1.push({
            id: ele.id,
            amount: ele.price,
            text: ele.name
          });
        })
        this.setData({
          columns_1
        })
      }
    })
  },
  onShowTypePopup() {
    console.log('#Type_select')
    const select = this.selectComponent('#Type_select')
    select && select.setColumnIndex(0, this.data.selectTypeIndex)
    this.setData({
      Type_show: true
    })
  },
  onCloseTypePopup() {
    this.setData({
      Type_show: false
    })
  },

  // 点击搜索类型--弹窗确认按钮
  handleTypeSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    console.log(e.detail)
    this.setData({
      selectTypeIndex: index,
      select_type: value.id,
      type_seach: 'seach',
      page: 1,
      select_value: '',
      radioList: []
    });
    this.onCloseTypePopup()
  },
  // 点击搜索类型--弹窗关闭按钮
  onCloseTypePopup() {
    this.setData({
      Type_show: false
    })
  },
  handleChangeInput(e) {
    const value = e.detail
    this.setData({
      select_value: value,
    })
  },
  // 失焦赋值
  handleReading(e) {
    console.log(e)
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
    this.getlist()
  },
  getlist(){
    let that = this;
    let p = {
      select: this.data.select_value,
      type: this.data.select_type,
      page: this.data.page,
    }
    wx.showLoading({
      title: lang.message.loading,
    })
    isAdmin(p).then(res => {
      wx.hideLoading();
      if(res.code == 200){
        const radioList = this.data.radioList.concat(res.data.data || [])
        if(radioList.length > 0){
          this.setData({
            dialog_show: true
          })
        }else{
          wx.showToast({
            title: this.data.lang.noData,
            icon:'none'
          })
        }
        this.setData({
          radioList,
        })
      }else{
        wx.showToast({
          title: res.desc,
          icon:'none'
        })
      }
     
      // this.waterCount()
    }).catch(e =>{
      wx.hideLoading();
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon:'none'
      })
    })
  },
  // 关闭选择用户弹窗
  onClose_dialog(){
    if(!this.data.radio){
      this.setData({ 
        dialog_show: false,
        selectradio_info: {},
       });
      return
    }else{
      this.setData({ 
        dialog_show: false,
        wm_no_error:false
       });
    }
  },
  // 用户弹窗
  onChange(event) {
    console.log(event)
    this.setData({
      radio: event.detail,
    });
  },
  // 选择用户弹窗  确认按钮
  onClick(event) {
    console.log(event)
    const { name } = event.currentTarget.dataset;
    let user_type_id =  event.currentTarget.dataset.item.user_type_id;
    if (user_type_id == 8 || user_type_id == 9 || user_type_id == 10){
      this.setData({
        is_T: true,
        selectradio_info: event.currentTarget.dataset.item,
      })
      let time = new Date().getTime();
      this.getNowTime(time);
    }else{
      this.setData({
        is_T: false,
        selectradio_info: event.currentTarget.dataset.item,
      })
    }
    this.setData({
      radio: name,
    });
  },
  // 打印类型
  onType1Open() {
    this.setData({
      show_1: true
    })
  },
  // 打印类型 弹窗关闭按钮
  onCloseType1Select() {
    this.setData({
      show_1: false
    })
  },
  // 弹窗选择打印类型
  onConfirmType1Select(e) {
    const typeLabel_1 = e.detail.value.text
    this.setData({
      parent_type_error: false,
      typeLabel_1,
      seltTypeInfo: e.detail.value,
    })
    this.onCloseType1Select();
  },

  clickPrint(){
    let selectradio_info = this.data.selectradio_info;
    let seltTypeInfo = this.data.seltTypeInfo;
    if (!selectradio_info.wm_no) {
      this.setData({
        wm_no_error : true
      })
      return
    }
    if (!seltTypeInfo) {
      this.setData({
        parent_type_error : true
      })
      return
    }
    // 获取打印信息

    let date = this.handleTimeValue();
    this.setData({
      invoiceInfo_title: `EPASKS-E.P.`,
      invoiceInfo_title_1: `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com

Dados do Cliente
      `,
      invoiceInfo_CustomerData: `
Comsumidor: ${selectradio_info.wm_name}
N° do Cliente: ${selectradio_info.user_code}
N° Contador: ${selectradio_info.wm_no}
NIF: ${selectradio_info.user_card}
EMAIL: ${selectradio_info.email}
Endereco detalhado: ${selectradio_info.wm_address}
N° da Porta: ${selectradio_info.house_number}
Giro: ${selectradio_info.area_code}

Espécies: ${seltTypeInfo.text}
Montante: ${fmoney(seltTypeInfo.amount,2)} KZ

      `,

      invoiceInfo_valores: `
Water manager
0000007/01180000/AGT/2023
${date.time}

    `,
      
    })
    this.blueToothPrint();
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
    let print_type = this.data.print_type;
    // GBK.encode({string}) 解码GBK为一个字节数组
    let info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...this.arrEncoderCopy(this.data.invoiceInfo_title),
      ...blueToolth.printCommand.ct_zc,
      ...this.arrEncoderCopy(this.data.invoiceInfo_title_1),
      ...blueToolth.printCommand.left,
      ...this.arrEncoderCopy(this.data.invoiceInfo_CustomerData),
      ...blueToolth.printCommand.center,
      ...this.arrEncoderCopy(this.data.invoiceInfo_valores),
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
        that.createPayDemandNote();
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
  },
  createPayDemandNote(){
    let that = this;
    let selectradio_info = that.data.selectradio_info; // 选择的用户
    let seltTypeInfo = that.data.seltTypeInfo; // 选择的种类
    let date = this.handleTimeValue();

    let p = {
      wm_id: selectradio_info.wm_id,
      price_list_id: seltTypeInfo.id,
      total_money: seltTypeInfo.amount,
      deta_time: date.time,
    }
    createPayDemandNote(p).then( res =>{

    }).catch( e =>{
      console.log(e)
    })
  }
})