const app = getApp()
let lang = app.globalData.lang
const {
  wxAsyncApi,
} = require('../../../utils/util')
import {
  isAdmin,
  getTrPriceList,
  getDemandNoteList,
  issueAgtInvoice,
} from '../../../apis/admin'
import {
  getBusinessHallList,
} from '../../../apis/business-hall'

Page({
  data: {
    lang: lang.index,
    quickFactura: lang.quickFactura,
    otherInvoices: lang.otherInvoices,
    langDialog: lang.dialog,
    btnName: lang.btnName,
    searchStatusList: [],
    type_seach: 'type',
    select_type: 1,
    select_value: '',
    selectTypeIndex: 0,
    page: 1,
    radioList: [],
    radio: '',
    selectradio_info: null,
    dialog_show: false,
    Type_show: false,
    columns_1: [],
    listTabActive: 1,
    paymentBillList: [],
    page_paymentBill: 1,
    paymentTotal: 0,
    demandNoteList: [],
    page_demandNote: 1,
    isScroll: true,
    total: 0,
    selectAll: false,
    selectedCount: 0,
  },

  onLoad() {
    this.getTrPriceList()
  },

  onShow() {
    lang = app.globalData.lang
    this.setData({
      lang: lang.index,
      quickFactura: lang.quickFactura,
      otherInvoices: lang.otherInvoices,
      langDialog: lang.dialog,
      btnName: lang.btnName,
      searchStatusList: lang.searchStatusList,
    })
    wx.setNavigationBarTitle({
      title: lang.quickFactura.pageTitle,
    })
  },

  getListKey() {
    return this.data.listTabActive === 1 ? 'paymentBillList' : 'demandNoteList'
  },

  getCurrentList() {
    return this.data.listTabActive === 1 ? this.data.paymentBillList : this.data.demandNoteList
  },

  resetListSelection() {
    this.setData({
      selectAll: false,
      selectedCount: 0,
    })
  },

  syncSelectAllState(list) {
    const selectable = list.filter(item => item.canSelect)
    const selectedCount = list.filter(item => item.checked).length
    const selectAll = selectable.length > 0 && selectable.every(item => item.checked)
    this.setData({ selectedCount, selectAll })
  },

  getTrPriceList() {
    getTrPriceList({}).then(res => {
      if (res.code == 200) {
        const columns_1 = (res.data.data || []).map(ele => ({
          id: ele.id,
          amount: ele.price,
          text: ele.name,
        }))
        this.setData({ columns_1 })
      }
    })
  },

  mapInvoicePrintStatus(ele) {
    const qf = this.data.quickFactura
    const code = ele.bill_invoice_code
      || ele.invoice_code
      || ele.agt_document_no
      || ele.agt_invoice_no
      || ''
    const printed = !!(code || ele.invoice_status == 2)
    return {
      invoice_printed: printed,
      invoice_print_label: printed ? qf.invoicePrinted : qf.invoiceNotPrinted,
      invoice_code_display: code,
    }
  },

  mapPaymentBillItem(ele) {
    const otherInvoices = this.data.otherInvoices
    const invoiceInfo = this.mapInvoicePrintStatus(ele)
    const unpaid = ele.status === 1
    const canSelect = unpaid && !invoiceInfo.invoice_printed
    return {
      ...ele,
      ...invoiceInfo,
      listType: 'payment',
      checked: false,
      canSelect,
      pay_unpaid: unpaid,
      pay_label: ele.status_text || (unpaid ? otherInvoices.payStatusUnpaid : otherInvoices.payStatusPaid),
      display_title: ele.wm_no || ele.order_no || this.data.selectradio_info.wm_no,
      display_sub: `${this.data.lang.water}：${(Number(ele.reading) * 10000) / 10000}`,
      display_money: ele.price,
    }
  },

  mapDemandNoteItem(ele) {
    const otherInvoices = this.data.otherInvoices
    const invoiceInfo = this.mapInvoicePrintStatus(ele)
    const unpaid = ele.pay_status === 0
    const canSelect = unpaid && !invoiceInfo.invoice_printed
    return {
      ...ele,
      ...invoiceInfo,
      listType: 'demand',
      checked: false,
      canSelect,
      pay_unpaid: unpaid,
      pay_label: unpaid ? otherInvoices.payStatusUnpaid : otherInvoices.payStatusPaid,
      display_title: ele.water_meter ? ele.water_meter.wm_no : this.data.selectradio_info.wm_no,
      display_sub: `${this.data.lang.parent_type}：${ele.price_name || ''}`,
      display_money: ele.total_money,
    }
  },

  getPaymentBillList() {
    const selectradio_info = this.data.selectradio_info
    if (!selectradio_info) return
    wx.showLoading({ title: `${lang.message.loading}...` })
    getBusinessHallList({
      wm_no: selectradio_info.wm_no,
      select: selectradio_info.wm_no,
      type: 1,
      status: '',
      page: this.data.page_paymentBill,
    }).then(res => {
      wx.hideLoading()
      if (res.code == 200) {
        const raw = res.data.list.data || []
        const mapped = raw.map(item => this.mapPaymentBillItem(item))
        const paymentBillList = this.data.paymentBillList.concat(mapped)
        this.setData({
          paymentBillList,
          paymentTotal: res.data.list.total || 0,
        })
        this.syncSelectAllState(paymentBillList)
      }
    }).catch(() => wx.hideLoading())
  },

  getDemandNoteList() {
    const selectradio_info = this.data.selectradio_info
    if (!selectradio_info) return
    const p = {
      page: this.data.page_demandNote,
      type: 0,
      wm_id: selectradio_info.wm_id,
      wm_no: selectradio_info.wm_no,
    }
    wx.showLoading({ title: `${lang.message.loading}...` })
    getDemandNoteList(p).then(res => {
      wx.hideLoading()
      if (res.code == 200) {
        const columns_1 = this.data.columns_1
        const raw = res.data.data.data || []
        raw.forEach(ele => {
          columns_1.forEach(item => {
            if (ele.price_list_id == item.id) {
              ele.price_name = item.text
            }
          })
        })
        const mapped = raw.map(item => this.mapDemandNoteItem(item))
        const demandNoteList = this.data.demandNoteList.concat(mapped)
        this.setData({
          demandNoteList,
          total: res.data.data.total,
        })
        this.syncSelectAllState(demandNoteList)
      }
    }).catch(() => wx.hideLoading())
  },

  refreshCurrentList() {
    if (this.data.listTabActive === 1) {
      this.setData({ page_paymentBill: 1, paymentBillList: [] })
      this.getPaymentBillList()
      return
    }
    this.setData({ page_demandNote: 1, demandNoteList: [] })
    this.getDemandNoteList()
  },

  onListTabChange(e) {
    const listTabActive = Number(e.currentTarget.dataset.index)
    this.resetListSelection()
    this.setData({ listTabActive })
    if (listTabActive === 1) {
      if (!this.data.paymentBillList.length) {
        this.getPaymentBillList()
      } else {
        const paymentBillList = this.data.paymentBillList.map(item => ({
          ...item,
          checked: false,
        }))
        this.setData({ paymentBillList })
      }
      return
    }
    if (!this.data.demandNoteList.length) {
      this.setData({ page_demandNote: 1, demandNoteList: [] })
      this.getDemandNoteList()
      return
    }
    const demandNoteList = this.data.demandNoteList.map(item => ({
      ...item,
      checked: false,
    }))
    this.setData({ demandNoteList })
  },

  onShowTypePopup() {
    const select = this.selectComponent('#Type_select')
    select && select.setColumnIndex(0, this.data.selectTypeIndex)
    this.setData({ Type_show: true })
  },

  onCloseTypePopup() {
    this.setData({ Type_show: false })
  },

  handleTypeSelectItem(e) {
    const { index, value } = e.detail
    this.setData({
      selectTypeIndex: index,
      select_type: value.id,
      type_seach: 'seach',
      page: 1,
      select_value: '',
      radioList: [],
    })
    this.onCloseTypePopup()
  },

  handleChangeInput(e) {
    this.setData({ select_value: e.detail })
  },

  handlesearchReading(e) {
    this.setData({
      select_value: e.detail.value,
      type_seach: 'type',
    })
  },

  handleSearchInfo() {
    this.setData({
      page: 1,
      radioList: [],
      selectradio_info: null,
      radio: '',
      paymentBillList: [],
      demandNoteList: [],
      page_paymentBill: 1,
      page_demandNote: 1,
      listTabActive: 1,
    })
    this.resetListSelection()
    this.getlist()
  },

  getlist() {
    wx.showLoading({ title: lang.message.loading })
    isAdmin({
      select: this.data.select_value,
      type: this.data.select_type,
      page: this.data.page,
    }).then(res => {
      wx.hideLoading()
      if (res.code == 200) {
        const radioList = res.data.data || []
        if (radioList.length > 0) {
          this.setData({ dialog_show: true, radioList })
        } else {
          wx.showToast({
            title: this.data.otherInvoices.noSearchData,
            icon: 'none',
          })
        }
      } else {
        wx.showToast({ title: res.desc, icon: 'none' })
      }
    }).catch(e => {
      wx.hideLoading()
      wx.showToast({ title: e.desc, icon: 'none' })
    })
  },

  onClose_dialog() {
    this.setData({ dialog_show: false })
  },

  onChange(event) {
    this.setData({ radio: event.detail })
  },

  onClick(event) {
    const { name } = event.currentTarget.dataset
    this.resetListSelection()
    this.setData({
      selectradio_info: event.currentTarget.dataset.item,
      select_value: event.currentTarget.dataset.item.wm_no,
      radio: name,
      page_demandNote: 1,
      page_paymentBill: 1,
      paymentBillList: [],
      demandNoteList: [],
      listTabActive: 1,
    })
    this.setData({ page_paymentBill: 1, paymentBillList: [] })
    this.getPaymentBillList()
  },

  toggleSelectAll() {
    const listKey = this.getListKey()
    const list = this.getCurrentList().map(item => ({
      ...item,
      checked: item.canSelect ? !this.data.selectAll : false,
    }))
    this.setData({ [listKey]: list })
    this.syncSelectAllState(list)
  },

  toggleSelectItem(e) {
    const index = e.currentTarget.dataset.index
    const listKey = this.getListKey()
    const list = this.getCurrentList().slice()
    const item = list[index]
    if (!item || !item.canSelect) return
    list[index] = {
      ...item,
      checked: !item.checked,
    }
    this.setData({ [listKey]: list })
    this.syncSelectAllState(list)
  },

  onItemTap(e) {
    const index = e.currentTarget.dataset.index
    const item = this.getCurrentList()[index]
    if (!item) return
    if (item.canSelect) {
      this.toggleSelectItem(e)
      return
    }
    if (this.data.listTabActive === 2) {
      this.goToPayDetail(item)
    }
  },

  buildAgtParams(item) {
    const { selectradio_info } = this.data
    const params = {
      document_type: 'FT',
      poll: 1,
      poll_times: 5,
      poll_interval: 3,
    }
    if (selectradio_info.user_card) {
      params.customer_tax_id = selectradio_info.user_card
    }
    if (item.listType === 'payment') {
      params.source_type = 'user_pay_log'
      params.source_id = item.id
      return params
    }
    params.source_type = 'user_pay_demand_note'
    params.source_id = item.id
    return params
  },

  issueOneInvoice(item) {
    return issueAgtInvoice(this.buildAgtParams(item))
  },

  clickBatchIssue() {
    const { quickFactura, otherInvoices, selectedCount } = this.data
    if (!selectedCount) return
    const selected = this.getCurrentList().filter(item => item.checked && item.canSelect)
    if (!selected.length) {
      wx.showToast({
        title: quickFactura.noSelectable,
        icon: 'none',
      })
      return
    }
    wx.showLoading({
      title: otherInvoices.agtLoading,
      mask: true,
    })
    let successCount = 0
    let failCount = 0
    const runNext = (index) => {
      if (index >= selected.length) {
        wx.hideLoading()
        wx.showModal({
          title: otherInvoices.agtSuccessTitle,
          content: `${quickFactura.batchIssueDone}\n${otherInvoices.agtSuccessTitle}: ${successCount}\n${otherInvoices.agtFailTitle}: ${failCount}`,
          showCancel: false,
          confirmText: lang.dialog.confirmText,
          success: () => {
            this.refreshCurrentList()
          },
        })
        return
      }
      this.issueOneInvoice(selected[index]).then(() => {
        successCount += 1
        runNext(index + 1)
      }).catch(() => {
        failCount += 1
        runNext(index + 1)
      })
    }
    runNext(0)
  },

  goToPayDetail(item) {
    const data = JSON.stringify(item)
    wxAsyncApi('navigateTo', {
      url: `/pages/user-parenType-info/index?data=${data}&source=business-hall`,
    })
  },

  addListData() {
    if (this.data.listTabActive === 1) {
      const { page_paymentBill, paymentBillList, paymentTotal } = this.data
      if (paymentBillList.length >= paymentTotal) return
      this.setData({ page_paymentBill: page_paymentBill + 1 })
      this.getPaymentBillList()
      return
    }
    const { page_demandNote, demandNoteList, total } = this.data
    if (demandNoteList.length >= total) return
    this.setData({ page_demandNote: page_demandNote + 1 })
    this.getDemandNoteList()
  },
})
