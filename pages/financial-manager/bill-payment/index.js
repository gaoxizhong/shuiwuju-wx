// pages/business-hall/index/index.js
const app = getApp()
let lang = app.globalData.lang
import { getAllUserPayLog,delAllUserPayLog,getDelAllUserPayLog, } from './../../../apis/financial-manager'
import { obterAgtEstado, issueAgtCreditNote } from './../../../apis/admin'
import {
  wxAsyncApi,
  fmoney,
  handleTimeValue,
  resolveAgtPayLogDeleteGate,
  isAgtPayLogRedInkDone,
} from './../../../utils/util'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lang: lang.index,
    otherInvoices: lang.otherInvoices,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    page: 1,
    total: 0,
    isScroll: true,
    loading: '',
    list: [],
    stime: '', // 开始时间
    etime: '', // 结束时间


    type_seach: 'type', // type - - 选类型  seach 输入
    select_type: 1, // 1:水表号/ 2:用户名/3:用户地址/ 4:门牌号
    select_value:'', // 查询内容
    searchStatusList: [],
    selectTypeIndex: 0,
    Type_show: false,
    title_active: 1,
    del_selt_info: {},
    del_selt_index: null,
    delList: [],  // 删除记录
    cancelShowPop: false,
    cancelList: [], // 取消原因
    selt_cancel_status: {}, // 选中的取消原因
    status_type: '',
    is_return: true
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    lang = app.globalData.lang
    const stime = this.data.startTime
    const etime = this.data.endTime
    this.setData({
      lang: lang.index,
      otherInvoices: lang.otherInvoices,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      searchStatusList: lang.searchStatusList,

    })
    // if (stime && etime) {
    //   this.getListData()
    // }
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
  handleSearchInfo() {
    this.setData({
      page: 1,
      list: [],
      delPayLogList: [],
      isScroll: true,
      loading: ''
    })
    this.getListData();
    // if(this.title_active == 1){
    //   this.getListData();
    // }else{
    //   this.getDelAllUserPayLog();
    // }
  },
  handleGetTime(e) {
    let that = this;
    console.log(e)
    const {
      endDate,
      endTime,
      startDate,
      startTime,
    } = e.detail
    that.setData({
      endDate,
      endTime,
      startDate,
      startTime,
      list: [],
      delPayLogList: [],
      page: 1,
      total: 0,
      isScroll: true,
      loading: ''
    })
    if(this.data.title_active == 1){
      this.getListData();
    }else{
      this.getDelAllUserPayLog();
    }
  },
  getListData() {
    const params = {
      stime: this.data.startTime,
      etime: this.data.endTime,
      wm_no: this.data.wm_no,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    if(params.type == 1){
      params.wm_no = this.data.select_value
    }
    getAllUserPayLog(params).then(res => {
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.total_money = fmoney(Number(ele.total_money),2);
        ele.after_arrears_money = fmoney(Number(ele.after_arrears_money),2);
      })
      const list = this.data.list.concat(data)
      const total = res.data.list.total || 0
      this.setData({
        list,
        total,
        isScroll: true,
        loading: total > list.length ? lang.message.scrollLoading : lang.message.noMoreEmpty
      })
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
    const item = e.currentTarget.dataset.item;
    wxAsyncApi('navigateTo', {
      url: `/pages/business-hall/user-pay-info/index?item=${JSON.stringify(item)}&source=business-hall`,
    }).then(res => {
      wx.setNavigationBarTitle({
        title: lang.message.info,
      })
    })
  },
  // 点击历史记录按钮
  goToHistorio(){
 
  },
  // 点击交班按钮
  goToFecho(){
  
  },
  pollObterUntilRedInk(userPayLogId, maxTimes, intervalSec) {
    const times = maxTimes != null ? maxTimes : 5
    const interval = (intervalSec != null ? intervalSec : 3) * 1000
    let count = 0
    const run = () => {
      return obterAgtEstado({ user_pay_log_id: userPayLogId }).then((estadoRes) => {
        count += 1
        if (isAgtPayLogRedInkDone(null, estadoRes)) {
          return estadoRes
        }
        if (count >= times) {
          return Promise.reject({ desc: lang.otherInvoices.agtDeleteNcFail })
        }
        return new Promise((resolve) => {
          setTimeout(resolve, interval)
        }).then(() => run())
      })
    }
    return run()
  },

  issueNcForPayLog(item, reason) {
    return issueAgtCreditNote({
      user_pay_log_id: item.id,
      reason: reason || 'Anulacao por erro de emissao',
      poll: 1,
      poll_times: 5,
      poll_interval: 3,
    }).then(() => this.pollObterUntilRedInk(item.id, 5, 3))
  },

  removePayLogFromList(index) {
    const list = this.data.list.slice()
    list.splice(index, 1)
    this.setData({
      list,
      del_selt_index: null,
      del_selt_info: {},
      cancelShowPop: false,
    })
  },

  delPayLogRecord(item) {
    return delAllUserPayLog({
      user_pay_log_id: item.id,
      del_data_time: handleTimeValue().time,
    })
  },

  /** 查询 AGT 状态 → 必要时 NC 冲红 → jc 删除（不调 fb_add_user_pay_log_number） */
  runDeletePayLogWithAgtGate(item, index, options) {
    const that = this
    const opts = options || {}
    const oi = lang.otherInvoices
    const comment = opts.comment || ''
    wx.showLoading({
      title: lang.message.loading,
      mask: true,
    })
    return obterAgtEstado({ user_pay_log_id: item.id }).then((estadoRes) => {
      const gate = resolveAgtPayLogDeleteGate(item, estadoRes)
      if (gate === 'forbid_issuing') {
        wx.hideLoading()
        wx.showToast({
          title: oi.agtDeleteIssuing,
          icon: 'none',
          duration: 3000,
        })
        return Promise.reject({ skipReset: true })
      }
      if (gate === 'need_nc') {
        wx.showLoading({
          title: oi.agtDeleteNcLoading,
          mask: true,
        })
        return that.issueNcForPayLog(item, comment)
      }
      return estadoRes
    }).then(() => that.delPayLogRecord(item)).then((res) => {
      wx.hideLoading()
      if (res && res.code == 200) {
        wx.showToast({ title: lang.message.success })
        that.removePayLogFromList(index)
      } else if (res) {
        wx.showToast({ title: res.desc, icon: 'none' })
      }
    }).catch((e) => {
      wx.hideLoading()
      if (!e || !e.skipReset) {
        wx.showToast({
          title: (e && e.desc) || oi.agtDeleteNcFail,
          icon: 'none',
        })
      }
    }).finally(() => {
      that.setData({ is_return: true })
    })
  },

  // 点击列表删除 icon
  clickDelete(e){
    const that = this
    const item = e.currentTarget.dataset.item
    const index = e.currentTarget.dataset.index
    if (item.cancel_receipt_number) {
      wx.showModal({
        title: lang.historical.title,
        content: lang.historical.content,
        cancelText: lang.historical.cancelText,
        confirmText: lang.historical.confirmText,
        complete: (res) => {
          if (res.confirm) {
            that.setData({ is_return: false })
            that.runDeletePayLogWithAgtGate(item, index, {})
          }
        },
      })
      return
    }
    that.setData({
      cancelList: [
        { id: 1, text: 'Erro de lançamento' },
        { id: 2, text: 'Duplicação' },
        { id: 3, text: 'Devolução do pagamento' },
        { id: 4, text: 'Outro motivo justificado' },
      ],
      del_selt_index: index,
      del_selt_info: item,
      cancelShowPop: true,
    })
  },
  onChange(e){
    console.log(e)
    let title_active = Number(e.currentTarget.dataset.index)
    this.setData({
      delPayLogList: [],
      list: [],
      select_value: '',
      wm_no: '',
      admin_name:'',
      page: 1,
      total: 0,
      title_active,
    })
    
  },
  getDelAllUserPayLog(){
    let that = this;
    const params = {
      stime: this.data.startTime + ' 00:00:00',
      etime: this.data.endTime + ' 23:59:59',
      wm_no: this.data.wm_no,
      page: this.data.page,
      select: this.data.select_value,
      type: this.data.select_type
    }
    getDelAllUserPayLog(params).then( res =>{
      const data = res.data.list.data || [];
      data.forEach(ele =>{
        ele.total_money = fmoney(Number(ele.total_money),2);
        ele.after_arrears_money = fmoney(Number(ele.after_arrears_money),2);
      })
      const delPayLogList = this.data.delPayLogList.concat(data)
      this.setData({
        delPayLogList,
      })
    }).catch( e=>{
      console.log(e)
    })
  },
  // 点击取消按钮
  // clickQx(){

  // },
  onCloseType1Select() {
    this.setData({
      cancelShowPop: false
    })
  },
  // 取消原因弹窗 确认
  onConfirmType1Select(e){
    const that = this
    const valueinfo = e.detail.value
    const datainfo = this.data.del_selt_info
    const index = that.data.del_selt_index
    if (!that.data.is_return) {
      return
    }
    that.setData({ is_return: false })
    that.runDeletePayLogWithAgtGate(datainfo, index, {
      comment: valueinfo.text,
    })
  },
})