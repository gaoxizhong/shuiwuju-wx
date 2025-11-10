// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import {
  getBusinessHallList,getDelUserPaymentList
} from './../../../apis/business-hall'
import {
  delUserPayment,getUserBluetoolthInfoData
} from './../../../apis/water'

import {
  wxAsyncApi,fmoney
} from './../../../utils/util'
const blueToolth = require('./../../../utils/bluetoolth')
//只需要引用encoding.js,注意路径
var encoding = require("./../../../utils/encoding.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userWaterInfo: lang.userWaterInfo,
    lang: lang.index,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    wm_no: '',
    is_seach: false,
    status: '',

    selectIndex: 0,
    show: false,

    page: 1,
    total: 0,

    isScroll: true,
    loading: '',

    list: [],
    statusList: [],
    payWayList: [],
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号
    select_value:'', // 查询内容
    searchStatusList: [],
    selectTypeIndex: 0,
    Type_show: false,
    type_seach: 'type', // type - - 选类型  seach 输入
    title_active: 1,
    delPayLogList: [],
    cancelList: [
      {id: 1,text:'Erro de lançamento'},
      {id: 2,text:'Duplicação'},
      {id: 3,text:'Devolução do pagamento'},
      {id: 4,text:'Outro motivo justificado'},
    ], // 取消原因
    selt_cancel_status: {}, // 选中的取消原因
    is_Printreturn: true
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
      btnName: lang.btnName,
      searchStatusList: lang.searchStatusList, 
      title_active: 1,
      delPayLogList: [],

    })
    this.getListData()
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
    this.getListData()
  },

  getListData() {
    const params = {
      wm_no: this.data.wm_no,
      status: this.data.status,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    console.log(params)
    getBusinessHallList(params).then(res => {
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.price = fmoney(Number(ele.price),2)
      })
      const list = this.data.list.concat(data)
      const total = res.data.list.total || 0
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      const payWayList = res.data.pay_way.map(i => ({
        text: i.title,
        key: i.key
      }))
      this.setData({
        list,
        total,
        statusList,
        payWayList,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
      if(this.data.wm_no){
        this.setData({
          is_seach: true
        })
      }else{
        this.setData({
          is_seach: false
        })
      }
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
    wxAsyncApi('navigateTo', {
      url: '/pages/financial-manager/bill-payment/index',
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.historio,
      })
    })
  },
  // 点击交班按钮
  goToFecho(){
    wxAsyncApi('navigateTo', {
      url: '/pages/business-hall/fecho/index',
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.fecho,
      })
    })
  },
  // 点击其他发票按钮
  goToOther(){
    wxAsyncApi('navigateTo', {
      url: '/pages/query-water/other-invoices/index',
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.fecho,
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
  // 点击缴费按钮
  clickPayBtn(){
    wxAsyncApi('navigateTo', {
      url: `/pages/user-total-info/index?wm_no=${this.data.wm_no}`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
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
  handleTypeSelectItem(e) {
    const {
      index,
      value
    } = e.detail;
    console.log(e.detail)
    this.setData({
      selectTypeIndex: index,
      select_type: value.id,
      type_seach: 'seach'
    });
    this.onCloseTypePopup()
  },
  clickDelete(e){
    let that = this;
    let item = e.currentTarget.dataset.item;
    let index = e.currentTarget.dataset.index;
    that.setData({
      del_selt_info: item,
      del_selt_index: index,
      del_pop: true,
    })
  },
  clickDeleteBtn(){
    let that = this;
    let del_selt_info = that.data.del_selt_info;
    let index = that.data.del_selt_index;
    let list = that.data.list;
    const params = {
      up_id: del_selt_info.up_id,
    }
    delUserPayment(params).then(res => {
      if(res.code == 200){
        wx.showToast({
          title: lang.message.success,
          icon: 'none'
        })
        list.splice(index,1);
        that.setData({
          list,
          del_pop: false,
        })
      }else{
        wx.showToast({
          title: res.desc,
          icon: 'none'
        })
      }
    }).catch( e =>{
      console.log(e)
      wx.showToast({
        title: e.desc,
        icon: 'none'
      })
    })
  },
  clickdelPop(){
    this.setData({
      del_pop: false,

    })
  },
  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      list: [],
      wm_no: '',
      admin_name:'',
      page: 1,
      total: 0,
      title_active,
    })
    if(title_active == 1){
      this.getListData();
    }
    if(title_active == 2){
      this.getDelUserPaymentList();
    }
  },
  getDelUserPaymentList(){
    let that = this;
    const params = {
      wm_no: this.data.wm_no,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type,
      status: this.data.status
    }
    getDelUserPaymentList(params).then( res =>{
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.price = fmoney(Number(ele.price),2)
      })
      const list = this.data.list.concat(data)
      const total = res.data.list.total || 0
      const status = res.data.status
      const statusList = Object.keys(status).map(i => ({
        text: status[i],
        key: i
      }))
      statusList.unshift(lang.allOptions)
      const payWayList = res.data.pay_way.map(i => ({
        text: i.title,
        key: i.key
      }))
      this.setData({
        list,
        total,
        statusList,
        payWayList,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
      if(this.data.wm_no){
        this.setData({
          is_seach: true
        })
      }else{
        this.setData({
          is_seach: false
        })
      }
    }).catch( e=>{
      console.log(e)
    })
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
      console.log(time)
      console.log(timestamp)
  
      return {
        year,
        month,
        day,
        time,
        timestamp
      }
    },
    // 近n天
  getMoreDay(value) {
    const _date = new Date().getTime();
    let letenddate = _date + (value*24*60*60*1000);
    let  _days = new Date(letenddate);
    const year = _days.getFullYear()
    const month = _days.getMonth() + 1
    const day = _days.getDate()
    const time = `${day >= 10 ? day : '0' + day}.${month >= 10 ? month : '0' + month}.${year}`
    return time
  },
    // 缴费单
  // 获取用户打印信息
  blueToothPrint(e){
    let that = this;
    console.log(e)
    let item = e.currentTarget.dataset.item;
    const params = {
      wm_no: item.wm_no,
    }
    if( !that.data.is_Printreturn ){
      return
    }
    that.setData({
      is_Printreturn: false
    })
    
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      console.log(userBluetoolthInfoData)
      let date = that.handleTimeValue();

      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = Number(item.water);
      let sewage_rate_num = Number( Number(total_water) * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(sewage_rate_num * user_type_price).toFixed(2); // 污水价格
    
      let first_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_water:0;
      let first_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].first_step_price:0;
      let second_step_water = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_water:0;
      let second_step_price = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].second_step_price:0;
      let domestico_socio = Number(first_step_water * first_step_price).toFixed(2);
      let domestico_socio_2 = Number(second_step_water * second_step_price).toFixed(2);

      let months = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].months:0; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      let household_num = userBluetoolthInfoData.water_meter.household_num; // 供用水表户数；
      let average_pairce = userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price/household_num.toFixed(2) : userBluetoolthInfoData.water_meter.user_bal/household_num.toFixed(2);  // 平均户数费用
      this.setData({
      // 缴费单
        printInfo_title:`EPASKS-E.P.`,
        printInfo_title_1:`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
0040.0000.9258.2876.1026.4 Banco Bai
0055.0000.4694.8358.1011.7 Banco Atlantica

Factura Simplificada N° ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].order_no:''}

Dados do Cliente
`,
printInfo_Comsumidor:`
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}`,
printInfo_CustomerData:`
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }
        `,
        printInfo_historyData_title:`
Histórico de Leituras
        `,
        printInfo_historyData_info:`
    Data       m³      Leitor
--------------------------------
${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].check_date:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading:''}   ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].reading_user:''}
${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].check_date:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading:''}   ${userBluetoolthInfoData.user_payment[1]?userBluetoolthInfoData.user_payment[1].reading_user:''}
${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].check_date:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading:''}   ${userBluetoolthInfoData.user_payment[2]?userBluetoolthInfoData.user_payment[2].reading_user:''}
-------------------------------- `,
      printInfo_facturacao_title:`   Detalhes de Coberanca`,
      printInfo_facturacao_info:`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}   
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04
CFR: 11.00 Kz X ${userBluetoolthInfoData.user_payment[0].CFR_total_price?userBluetoolthInfoData.user_payment[0].months:0} = ${userBluetoolthInfoData.user_payment[0].CFR_total_price} Kz
`,
      printInfo_TOTAL:`
TOTAL A PAGAR  ${userBluetoolthInfoData.user_payment[0]?userBluetoolthInfoData.user_payment[0].price:userBluetoolthInfoData.water_meter.user_bal} KZ`,
      printInfo_valores:`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager
Processado por programaválido n31.1/AGT20
`,     
      abolido:`
Foi abolido
      `,
      printInfo_time:`
${date.time}

`,
      })
      console.log(1)
      setTimeout(()=>{
        that.setData({
          is_Printreturn: true,
        })
      },1000)
      this.verifyBlueToothPrint();
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
    setTimeout(()=>{
      that.setData({
        is_Printreturn: true,
      })
    },1000)
  },
  // 蓝牙设备打印
  verifyBlueToothPrint() {
    console.log('蓝牙设备打印')
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
      wx.showToast({
        title: lang.blueToolth.connectDevice,
        icon: "none",
        duration: 30000,
      })
      this.handlePrint(connectDeviceInfo)
    }
  },

  handlePrint(p) {
    let that = this;
    let info = [
      ...blueToolth.printCommand.clear,
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_title),
      ...blueToolth.printCommand.ct_zc,
      ...that.arrEncoderCopy(that.data.printInfo_title_1),
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_Comsumidor),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_CustomerData),
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.printInfo_historyData_title),
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_historyData_info),
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.printInfo_facturacao_title),
      ...blueToolth.printCommand.left,
      ...that.arrEncoderCopy(that.data.printInfo_facturacao_info),
      ...blueToolth.printCommand.center,
      ...blueToolth.printCommand.ct,
      ...that.arrEncoderCopy(that.data.printInfo_TOTAL),
      ...that.arrEncoderCopy(that.data.printInfo_valores),
      ...blueToolth.printCommand.ct_zc,
      ...blueToolth.printCommand.center,
      ...that.arrEncoderCopy(that.data.abolido), // 展示'已作废'
      ...that.arrEncoderCopy(that.data.printInfo_time),
      ...blueToolth.printCommand.enter
    ]
    console.log('开始打印，api传信息...')
    blueToolth.writeBLECharacteristicValue({
      // ...this.data.printDeviceInfo,
      ...p,
      value: new Uint8Array(info).buffer,
      lasterSuccess() {
        console.log('打印成功...')
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "none",
          duration: 3000,
        })
      },
      onFail(res){
        console.log('打印失败...')
        console.log(res)
      }
    });
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
    }
})