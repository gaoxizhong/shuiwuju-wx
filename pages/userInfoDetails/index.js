const app = getApp()
let lang = app.globalData.lang
const blueToolth = require('./../../utils/bluetoolth')
const {
  wxAsyncApi,fmoney,handleTimeValue
} = require('./../../utils/util')
const GBK = require('./../../utils/gbk.min')
//只需要引用encoding.js,注意路径
var encoding = require("./../../utils/encoding.js")
import {
  getFbuserStatis,getUserBluetoolthInfoData,getUserPayItemDetail
} from './../../apis/water'
import {
  getDemandNoteList,  // 其他类型发票订单列表
} from './../../apis/admin'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.userWaterInfo,
    btnName: lang.btnName,
    langDialog: lang.dialog,
    wm_no: '',
    status: '',
    admin_name:'', // 管理员搜索字段
    show: false,
    selectIndex: 0, // 状态索引
    isScroll: false,
    startTime: '',
    endTime: '',
    wm_id:'',
    water_mater: {}, // 水表信息
    wm_payment_statis: {}, //缴费单统计
    user_payment_list: [], //缴费单列表
    water_mater_pay_log_list: [], //缴费(支付)记录
    user_pay_log_count: '', //缴费(支付)次数
    user_pay_log_total_money_sum: '', //缴费(支付)总金额
    user_pay_log_discount_money_sum: '', //缴费(支付)减免总额
    water_mater_price_sum: '', //缴费单总金额
    water_mater_payment_count: '', //缴费单数量
    water_mater_arrears_money_sum: '', //欠费总额
    title_active: 1,
    infoData: {},
    payStatusList: [
      {key: 1,title: "Numerário"},
      {key: 2,title: "Cartão Multicaixa"},
      {key: 3,title: "Pagamento bancário"},
    ],
    pay_way:'',
    pay_text:'',
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    const data = JSON.parse(options.data)
    console.log(data)
    lang = app.globalData.lang
    this.setData({
      wm_id: data.wm_id,
      lang: lang.userWaterInfo,
      btnName: lang.btnName,
      langDialog: lang.dialog,
    })
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
  handleGetTime(e) {
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    this.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      isScroll: true,
      loading: ''
    })
    this.getFbuserStatis();
  },
  getFbuserStatis(){
    let that = this;
    let p = {
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_id: this.data.wm_id,
    }
    getFbuserStatis(p).then( res =>{
      if(res.code == 200){
        let form = res.data.data;
        form.user_payment_list = form.user_payment_list.reverse();
        // form.user_bal = fmoney(form.water_mater.user_bal,2);
        form.user_bal = (form.water_mater.user_bal).toFixed(2);
        let water_mater_payment_count = form.water_mater_payment_count; //缴费单数量
        let user_pay_log_total_money_sum = form.user_pay_log_total_money_sum;//缴费(支付)总金额
        let user_pay_log_discount_money_sum = form.user_pay_log_discount_money_sum; //缴费(支付)减免总额
        let water_mater_price_sum = form.water_mater_price_sum; //缴费单总金额
        let water_mater_arrears_money_sum = form.water_mater_arrears_money_sum; //欠费总额
        let user_pay_log_count = form.user_pay_log_count; //缴费(支付)次数
        that.setData({
          form,
          water_mater_payment_count,
          user_pay_log_count,
          user_pay_log_total_money_sum,
          user_pay_log_discount_money_sum,
          water_mater_price_sum,
          water_mater_arrears_money_sum
        })
      }
    }).catch( e=>{
      console.log(e)
    })
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
  onChange(e){
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      title_active,
    })

  },
  // ====================== ↓ =======================
  // 获取当前缴费记录收据下的 包含的缴费单数据
  getUserPayItemDetail(i){
    let that = this;
    const id = i;
    const params = {
      user_pay_log_id: id,
    }
    getUserPayItemDetail(params).then(res => {
      let infoData = res.data.list; // 当前缴费记录下的 包含的缴费单数据
      let pay_way = that.data.pay_way;
        this.setData({
          infoData,
        })
        const payStatusList = that.data.payStatusList;
        payStatusList.forEach( ele =>{
          if(ele.key == pay_way){
            that.setData({
              pay_text: ele.title,
            })
          }
        })
        that.getUserBluetoolthInfoData1(that.handlePrint);
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 点击缴费单列表打印
  clickPrintItem(e){
    console.log(e)
    let that = this;
    let selectPrintInfo = e.currentTarget.dataset.item;
    let print_type = e.currentTarget.dataset.type;
    that.setData({
      print_type,
      selectPrintInfo,
      selectImprimirIndex: e.currentTarget.dataset.index, 
    })
    if(print_type == 'reciboInfo'){
      that.setData({
        pay_way: selectPrintInfo.pay_way
      })
      that.getUserPayItemDetail(selectPrintInfo.id);
    }else{
      that.getUserBluetoolthInfoData(that.handlePrint);
    }
    
  },

  // 获取用户缴费单打印信息
  getUserBluetoolthInfoData(f){
    let that = this;
    let selectPrintInfo = that.data.selectPrintInfo;
    let user_payment_list = that.data.form.user_payment_list; // 缴费单列表
    let selectImprimirIndex = that.data.selectImprimirIndex;
    let date_time = handleTimeValue().time;
    let log_list = '';
    let arr = user_payment_list.slice(selectImprimirIndex,selectImprimirIndex + 3);

    arr.forEach((ele,index) => {
      log_list +=`${ ele.check_date }   ${ele.reading}   ${ele.reading_user?ele.reading_user:''}
`
    })
    const params = {
      wm_no: that.data.form.water_mater.wm_no,
    }
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let user_type_price = userBluetoolthInfoData.user_type.price; // 用户类型单价
      let total_water = Number(selectPrintInfo.water);
      let sewage_rate_num = Number( total_water * Number(userBluetoolthInfoData.water_meter.sewage_rate)/100).toFixed(2); // 污水量
      let sewage_rate_price =  Number(Number(sewage_rate_num) * Number(user_type_price)).toFixed(2); // 污水价格
      let months = selectPrintInfo.months; // 月份
      let T_Fixa = Number(userBluetoolthInfoData.user_type.rent_money * months).toFixed(2);
      let consumo_price =Number(total_water * user_type_price).toFixed(2); // 非阶段计价 水费用展示
      let household_num = userBluetoolthInfoData.water_meter.household_num; // 供用水表户数；
      let average_pairce = Number(selectPrintInfo.price)/household_num.toFixed(2);  // 平均户数费用
      // 缴费单
      let printInfo_title =`EPASKS-E.P.`;
      let printInfo_title_1 =`
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com
0040.0000.9258.2876.1026.4 Banco Bai
0055.0000.4694.8358.1011.7 Banco Atlantica

Factura Simplificada N° ${selectPrintInfo.order_no}

Dados do Cliente`;
      let printInfo_Comsumidor = `
Comsumidor: ${userBluetoolthInfoData.water_meter.wm_name}`;
      let printInfo_CustomerData=`
N° do Cliente: ${userBluetoolthInfoData.water_meter.user_code}
N° Contador: ${userBluetoolthInfoData.water_meter.wm_no}
NIF: ${userBluetoolthInfoData.water_meter.user_card}
EMAIL: ${userBluetoolthInfoData.water_meter.email}
Endereco detalhado: ${userBluetoolthInfoData.water_meter.wm_address}
N° da Porta: ${userBluetoolthInfoData.water_meter.house_number}
Giro: ${userBluetoolthInfoData.water_meter.area_code}
Totalizador/Normal: ${userBluetoolthInfoData.water_meter.is_share ? 'Totalizador':'Normal' }
Unidades: ${userBluetoolthInfoData.water_meter.household_num }`;
      let printInfo_historyData_title =`
Histórico de Leituras`;
      let printInfo_historyData_info =`
Data       m³      Leitor
--------------------------------
${log_list?log_list:''}
-------------------------------- `;
      let printInfo_facturacao_title =`Detalhes de Coberanca`;
      let printInfo_facturacao_info =`
Categoria Tarifaria: ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}
Consumo: ${userBluetoolthInfoData.user_type.is_constant == 0?total_water + '(m³)': total_water + '* ' + user_type_price +'=' + consumo_price}
T.Fixa ${userBluetoolthInfoData.user_type?userBluetoolthInfoData.user_type.type_name:''}: ${ userBluetoolthInfoData.user_type.rent_money +' * '+months +'=' + T_Fixa }
Agua Resid: (${userBluetoolthInfoData.water_meter.sewage_rate}%): ${ sewage_rate_num+ '* ' + user_type_price + ' = ' + sewage_rate_price}  
${userBluetoolthInfoData.water_meter.is_share?'O custo médio: ' +average_pairce +'KZ':'' }
IVA(0%) M04
CFR: 11.00 Kz X ${userBluetoolthInfoData.user_payment[0].CFR_total_price?userBluetoolthInfoData.user_payment[0].months:0} = ${userBluetoolthInfoData.user_payment[0].CFR_total_price} Kz
`;
      let printInfo_TOTAL =`
TOTAL A PAGAR  ${selectPrintInfo.price} KZ`;

      let pagamento_pagamento =`
limite de pagamento: ${selectPrintInfo.created_at}`;
      let printInfo_valores =`
Saldo
${userBluetoolthInfoData.water_meter.user_bal} KZ
Water manager`; 
      let printInfo_time =`
Processado por programaválido n31.1/AGT20
${date.time}

`;
    let printData = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": printInfo_title + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
          "concentration": 15, //打印浓度1~20，默认15
          "align": 1, //0左对齐，1居中对齐，2右对齐；
          "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
          //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
          "isDoubleHeight": true, //是否倍高；
          "isDoubleWidth": false, //是否倍宽；
          "isUnderLine": 0, //是否加下划线；
          "isBold": true, //是否加粗；
        },
        {
          "printType": 0,
          "text": printInfo_title_1 + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_Comsumidor + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 32,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": true, //加粗；
        },
        {
          "printType": 0,
          "text": printInfo_CustomerData + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_historyData_title + "\n",
          "concentration": 15,
          "align": 1, // 居中
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_historyData_info + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_facturacao_title + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_facturacao_info + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_TOTAL + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 24,
          "isDoubleHeight": true, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": pagamento_pagamento + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_valores + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 34,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": printInfo_time + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
      ]
    }


      if (typeof f == 'function'){
        return f(printData)
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
    })
  },
  // 获取用户收据打印信息
  getUserBluetoolthInfoData1(f){
    let that = this;
    let selectPrintInfo = that.data.selectPrintInfo;

    const params = {
      wm_no: that.data.form.water_mater.wm_no,
    }
    getUserBluetoolthInfoData(params).then(res => {
      const userBluetoolthInfoData = res.data
      let info = that.data.infoData; // 缴费记录下的缴费单信息
      let user_info = '';
      info.forEach(ele => {
        user_info += `${ ele.check_date }   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.arrears_money).toFixed(2)}KZ   ${Number(ele.price).toFixed(2)}KZ
`
      })
      console.log('收据')
      //收据
      let receiptInfo_title = `EPASKS-E.P.`;

      let receiptInfo_title_1 = `
Empresa Publica de Aguas e Saneamento do Cuanza Su7Sul Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF: 5601022917
Recibo N° ${selectPrintInfo.invoice_code}
ORIGINAL
Nome: ${userBluetoolthInfoData.water_meter.wm_name}
Contribuinte: ${userBluetoolthInfoData.water_meter.user_card}`;

      let receiptInfo_historyData = `
DATA: ${selectPrintInfo.pay_time}
  Data    Total    Pend.    Liq.
--------------------------------
${user_info?user_info:''}
--------------------------------
`;
      let receiptInfo_TOTAL = `
TOTAL: ${selectPrintInfo.total_money} KZ 
`;
      let receiptInfo_Pagamento = `Modos de Pagamento`;
      let receiptInfo_Modos = `
Método       Moeda       Total
--------------------------------
${that.data.pay_text}   AOA    ${selectPrintInfo.total_money} KZ
--------------------------------`;
      let receiptInfo_Saldo = `
Saldo: ${userBluetoolthInfoData.water_meter.user_bal} KZ

Water manager
Processado por programaválido n31.1/AGT20
Este documento nao serve de fatura
IVA Regime Simplificado
Utilizador: ${selectPrintInfo.operator_name}
--------------------------------
*Obrigado e volte sempre!*

`;
      let printData = {
        "name": "printMix", //普通纸混合打印
        "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
        "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
        "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
        "data": [
          {
            "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
            "text": receiptInfo_title + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
            "concentration": 15, //打印浓度1~20，默认15
            "align": 1, //0左对齐，1居中对齐，2右对齐；
            "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
            //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
            "isDoubleHeight": true, //是否倍高；
            "isDoubleWidth": false, //是否倍宽；
            "isUnderLine": 0, //是否加下划线；
            "isBold": true, //是否加粗；
          },
          {
            "printType": 0,
            "text": receiptInfo_title_1 + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": receiptInfo_historyData + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": receiptInfo_TOTAL + "\n",
            "concentration": 15,
            "align": 1,
            "lineHeight": 24,
            "isDoubleHeight": true, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": receiptInfo_Pagamento + "\n",
            "concentration": 15,
            "align": 1, // 居中
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": receiptInfo_Modos + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          {
            "printType": 0,
            "text": receiptInfo_Saldo + "\n",
            "concentration": 15,
            "align": 1,
            "lineHeight": 30,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          },
          
        ]
      }

      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
      if (typeof f == 'function'){
        return f(printData)
      }
    }).catch((res) => {
      wx.showToast({
        title: res.desc,
        icon: 'none',
        duration: 2000
      })
      setTimeout(()=>{
        that.setData({
          is_return: true
        })
      },1000)
    })
  },
  // 蓝牙设备打印
  verifyBlueToothPrint() {},
  handlePrint(p) {
    let that = this;
    let print_type = that.data.print_type;
    console.log(print_type)
    let info = [];
    // 收据
    if(print_type == 'receiptInfo'){
      let selectPrintInfo = that.data.selectPrintInfo;
      if(selectPrintInfo.receipt_number){
        let receiptInfo_number = `
Ref. Recibo: ${selectPrintInfo.receipt_number}`;
        let i_value = {
          "printType": 0,
          "text": receiptInfo_number + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        };
        p.data.splice(2, 0, i_value);
        console.log(p);
        console.log('receiptInfo 开始打印，传信息...');
        that.SendControlCommand(p);
        return
        }else{
        addUserPayLogNumber({
          id: selectPrintInfo.id,
          type: 1
        }).then(res => {
          let receiptInfo_number = `
Ref. Recibo: ${res.data.receipt_number}`;
          let i_value = {
            "printType": 0,
            "text": receiptInfo_number + "\n",
            "concentration": 15,
            "align": 0,
            "lineHeight": 26,
            "isDoubleHeight": false, 
            "isDoubleWidth": false,
            "isUnderLine": 0,
            "isBold": false,
          };
          p.data.splice(2, 0, i_value);
          console.log('receiptInfo 开始打印，传信息...');
          that.SendControlCommand(p);
        })
      }
    }
    // 缴费单
    console.log('printInfo: 拼接缴费单信息...')
    if(print_type == 'printInfo'){
      console.log('printInfo 开始打印，传信息...');
      that.SendControlCommand(p);
    }
  },


// =========================  ↑   ====================

  // 打印信息
  imprimirInfo(){
    let that = this;
    let item = that.data.form;
    let water_mater_payment_count = item.water_mater_payment_count; //缴费单数量
    let user_pay_log_total_money_sum = item.user_pay_log_total_money_sum;//缴费(支付)总金额
    let user_pay_log_discount_money_sum = item.user_pay_log_discount_money_sum; //缴费(支付)减免总额
    let water_mater_price_sum = item.water_mater_price_sum; //缴费单总金额
    let water_mater_arrears_money_sum = item.water_mater_arrears_money_sum; //欠费总额
    let water_mater_pay_log_list = item.water_mater_pay_log_list; //缴费(支付)记录
    let log_list = '';
    let date_time = handleTimeValue().time;

    water_mater_pay_log_list.forEach((ele,index) => {
      log_list +=`${ ele.pay_time }     ${ele.total_money}KZ
`
    })
    let title = `EPASKS-E.P.`;
    let title_1 = `
Empresa Publica de Aquas e Saneamento do Kwanza Sul EP
Avenida 14 de Abril. N° 15-zona 1 Sumbe- Cuanza-Sul
NIF:5601022917
Atendimento ao Cliente941648993
Comunicação de Roturas941648999
Email info.epasksagmail.com

N° Contador: ${item.water_mater.wm_no}
Comsumidor: ${item.water_mater.wm_name}
Localidade: ${item.water_mater.area1} ${item.water_mater.area2} ${item.water_mater.area3} ${item.water_mater.wm_address}
NIF: ${item.water_mater.user_card}
Telefone: ${item.water_mater.wm_phone}
EMAIL: ${item.email}
Leitura anterior: ${item.water_mater.last_reading} (m³)
Ordem de pagamento: ${item.water_mater_payment_count?item.water_mater_payment_count:0}
Linha de pagamento pendente: ${item.water_mater_price_sum} KZ
Créditos já pagos: ${item.user_pay_log_total_money_sum} KZ
Valor total devido: ${item.water_mater_arrears_money_sum} KZ
Limite de redução: ${item.user_pay_log_discount_money_sum} KZ
Saldo da conta: ${item.user_bal} KZ

${that.data.startTime} - ${that.data.endTime}
Registro de pagamentos:
--------------------------------
${log_list?log_list:''}
--------------------------------
`;

    let valores = `
Water manager
Processado por programaválido n31.1/AGT20
DATA: ${date_time}

`;
    let printData = {
      "name": "printMix", //普通纸混合打印
      "top": 80,  //打印内容距离纸张顶部的空白高度，单位为点(8个点等于1毫米), 取值范围是8~304；
      "runOnNewThread": false, // 注意：这里是布尔值，不是字符串！是否新开线程来执行本次打印任务，默认为false;
      "forwardMorePaper": 80, //内容打印完成后，继续走纸的距离(目的是使打印内容完成吐到纸仓内外) 单位为点(8个点等于1毫米),取值范围是0~248；
      "data": [
        {
          "printType": 0,  // 0(文字)，1(条形码)，2(二维码)，3(图片);
          "text": title + "\n", //注意"printMix"方法中"printType"=0时,文字内容末尾必须添加\n作为结尾标记；
          "concentration": 15, //打印浓度1~20，默认15
          "align": 1, //0左对齐，1居中对齐，2右对齐；
          "lineHeight": 30,//行高，单位为点(8个点等于1毫米)，需要不小于字符本身高度(默认字符高24，倍高则为48)；
          //注意，使用倍高时，本参数会自动翻倍，故应设置为想要高度的一半； 最大值为255；为0时打印机使用默认行高；
          "isDoubleHeight": true, //是否倍高；
          "isDoubleWidth": false, //是否倍宽；
          "isUnderLine": 0, //是否加下划线；
          "isBold": true, //是否加粗；
        },
        {
          "printType": 0,
          "text": title_1 + "\n",
          "concentration": 15,
          "align": 0,
          "lineHeight": 30,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
        {
          "printType": 0,
          "text": valores + "\n",
          "concentration": 15,
          "align": 1,
          "lineHeight": 26,
          "isDoubleHeight": false, 
          "isDoubleWidth": false,
          "isUnderLine": 0,
          "isBold": false,
        },
      ]
    }
    that.SendControlCommand(printData)
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




    // 新打印机打印方法
  SendControlCommand(printData) {
    let that = this;

    console.log('链接打印',printData)
    // 接口地址：如果访问不了，IP可以改成设备本地IP尝试；
    var apiUrl = "http://127.0.0.1:8080/print/jsonToPrint?data=" + encodeURIComponent(JSON.stringify(printData));
    wx.showLoading();

    wx.request({
      url: apiUrl,
      method: "GET",
      success: (res) => {
        console.log('success...',res)
        console.log(res)
        wx.hideLoading();
        wx.showToast({
          title: lang.blueToolth.printSuccess,
          icon: "none",
          duration: 3000,
        })
      },
      fail: (err) => {
        console.log('err...',err)// 控制台打印完整错误，方便排查
        wx.hideLoading();

      }
    })
  },
})