// wx函数promise化
function wxAsyncApi(name, options) {
  if (!name) {
    return;
  }
  return new Promise((reslove, reject) => {
    wx[name]({
      ...(options || {}),
      success: function (res) {
        reslove(res)
      },
      fail: function (res) {
        reject(res)
      }
    })
  })
}
// 防抖
function debounce(fn, wait) {
  let timer = null
  return function () {
    const context = this
    const args = arguments
    timer && clearTimeout(timer)
    timer = setTimeout(() => {
      timer = null
      fn.apply(context, args)
    }, wait)
  }
}

// 节流
function throttle(fn, wait, init) {
  let starTime = init ? 0 : 1
  return function () {
    const context = this
    const args = arguments
    const nowTime = 2
    if(nowTime - starTime > wait) {
      fn.apply(context, args)
    }
    starTime = nowTime
  }
}
function fmoney(s, n){
	/*
	* 参数说明：
	* s：要格式化的数字
	* n：保留几位小数
	* */
	n = n > 0 && n <= 20 ? n : 2;
	s = parseFloat((s + "").replace(/[^\d\.-]/g, "")).toFixed(n) + "";
	var l = s.split(".")[0].split("").reverse(),
	r = s.split(".")[1],
	t = "";
	for ( let i = 0; i < l.length; i++) {

	t += l[i] + ((i + 1) % 3 == 0 && (i + 1) != l.length ? "," : "");

	}
	return t.split("").reverse().join("") + "." + r;
}
/**
 * 支付金额转纯数字（去掉千分位逗号等），供 fb_user_payment 的 total_money 使用
 * 例："1,628.00" → 1628
 */
function parseMoneyNumber(val) {
	if (val === '' || val === null || val === undefined) return NaN
	if (typeof val === 'number') {
		return Number.isFinite(val) ? Number(val) : NaN
	}
	const n = parseFloat(String(val).replace(/,/g, '').replace(/[^\d.-]/g, ''))
	return Number.isFinite(n) ? n : NaN
}
  //获取当前时间
function handleTimeValue(date) {
    const _date = date ? new Date(date) : new Date();
    const submissionTimeStamp = _date.toISOString();
    console.log( '获取当前时间:',submissionTimeStamp )
    const year = _date.getFullYear();
    const month = _date.getMonth() + 1;
    const day = _date.getDate();
    const hh = _date.getHours();
    const mm = _date.getMinutes();
    const ss = _date.getSeconds();
    const dayTime = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day}`
    const time = `${year}-${month >= 10 ? month : '0' + month}-${day >= 10 ? day : '0' + day} ${hh >= 10 ? hh : '0' + hh}:${mm >= 10 ? mm : '0' + mm}:${ss >= 10 ? ss : '0' + ss}`
    const timestamp = new Date(year, month - 1, day, hh, mm, ss).getTime() / 1000
    return {
      year,
      month,
      day,
      time,
      dayTime,
      timestamp,
      submissionTimeStamp
    }
  }
// 判断当前时间是否在时间段内
function judgmentData(s,e){
  const now = new Date(); // 当前时间
  const start = new Date(s); // 定义的开始时间
  const end = new Date(e); // 定义的结束时间
  if (now >= start && now <= end) {
    console.log('当前时间在时间段内');
    return true
  } else {
    console.log('当前时间不在时间段内');
    return false
  }
}

/**
 * 解析 tr_issue_agt_invoice 业务 data
 */
function getAgtInvoiceData(res) {
  const root = res || {}
  const payload = root.data || root
  return payload.data || payload
}

/**
 * 收集 AGT obterEstado 校验/请求错误（E11/E40/E70、429 限流等）
 */
function getAgtValidationErrors(res) {
  const data = getAgtInvoiceData(res)
  const errors = []
  const pushErr = (item) => {
    if (!item) return
    if (typeof item === 'string') {
      const t = item.trim()
      if (t) errors.push(t)
      return
    }
    const id = item.idError || item.id || ''
    const desc = item.descriptionError || item.description || item.message || ''
    const text = [id, desc].filter(Boolean).join(': ').trim()
    if (text) errors.push(text)
  }
  const statusData = (data.status_result && data.status_result.data) || {}
  const docList = statusData.documentStatusList || []
  docList.forEach((doc) => {
    if (!doc || typeof doc === 'string') return
    ;(doc.errorList || []).forEach(pushErr)
  })
  ;(statusData.requestErrorList || []).forEach(pushErr)
  // 兼容已解析在 submission / agt_response_status 里的结构
  let agtStatus = data.agt_response_status
  if (typeof agtStatus === 'string') {
    try {
      agtStatus = JSON.parse(agtStatus)
    } catch (e) {
      agtStatus = null
    }
  }
  if (agtStatus) {
    ;(agtStatus.documentStatusList || []).forEach((doc) => {
      if (!doc || typeof doc === 'string') return
      ;(doc.errorList || []).forEach(pushErr)
    })
    ;(agtStatus.requestErrorList || []).forEach(pushErr)
  }
  ;(data.error_list || []).forEach(pushErr)
  return errors
}

/** 解析 AGT validation_status / documentStatus */
function getAgtDocStatuses(res) {
  const data = getAgtInvoiceData(res)
  const submission = data.submission || {}
  const validationStatus = String(
    data.validation_status || submission.validation_status || ''
  ).toUpperCase()
  const statusData = (data.status_result && data.status_result.data) || {}
  const docList = statusData.documentStatusList || []
  let docStatus = ''
  if (docList[0] && typeof docList[0] === 'object') {
    docStatus = String(
      docList[0].documentStatus || docList[0].document_status || ''
    ).toUpperCase()
  }
  if (!docStatus && typeof data.agt_response_status === 'string') {
    try {
      const parsed = JSON.parse(data.agt_response_status)
      const list = (parsed && parsed.documentStatusList) || []
      if (list[0] && typeof list[0] === 'object') {
        docStatus = String(list[0].documentStatus || '').toUpperCase()
      }
    } catch (e) { /* ignore */ }
  }
  return { validationStatus, docStatus }
}

/**
 * 已提交但校验结果未返回（如 obterEstado 429 限流）
 * 此时不可当开票成功，也不宜只提示笼统失败
 */
function isAgtValidationPending(res) {
  if (isAgtValidationPassed(res)) return false
  const data = getAgtInvoiceData(res)
  const { validationStatus, docStatus } = getAgtDocStatuses(res)
  // 已有明确无效态，不算 pending
  if (validationStatus === 'I' || docStatus === 'I') return false
  if (data.rate_limited === true) return true
  const hasDocNo = !!(data.document_no || data.documentNo
    || (data.submission && (data.submission.document_no || data.submission.documentNo)))
  const submitOk = !!(data.submit_result && data.submit_result.success !== false)
  const hasRequestId = !!(data.request_id || data.requestID)
  if (!hasDocNo && !submitOk && !hasRequestId) return false
  // 尚无校验状态
  if (validationStatus || docStatus) return false
  const errors = getAgtValidationErrors(res)
  const is429 = errors.some((e) => String(e).indexOf('429') !== -1
    || /limite|限流|excedido/i.test(String(e)))
  const nextStep = String(data.next_step || '')
  const suggestRetry = /obter_estado|继续查询|稍后/i.test(nextStep)
  return is429 || suggestRetry || data.agt_response_status == null
    || (data.invoice_ok !== true && !validationStatus && !docStatus)
}

/**
 * AGT 校验是否通过：invoice_ok===true 或 validation_status/documentStatus===V
 * 通过后才可走打印；I=无效；null/空=未出结果（pending）
 */
function isAgtValidationPassed(res) {
  const payload = (res && res.data) || res || {}
  const data = getAgtInvoiceData(res)
  // tr_obter_agt_estado：invoice_ok 为权威成功标记
  if (data.invoice_ok === true) {
    return true
  }
  if (payload.success === false || data.success === false) {
    return false
  }
  if (data.error || payload.error) {
    return false
  }
  if (data.rate_limited === true) {
    return false
  }
  const { validationStatus, docStatus } = getAgtDocStatuses(res)
  // V=校验通过；I=无效（号已占用但开票失败，不可当成功发票号）
  if (validationStatus === 'I' || docStatus === 'I') {
    return false
  }
  if (validationStatus !== 'V' && docStatus !== 'V') {
    return false
  }
  if (getAgtValidationErrors(res).length) {
    return false
  }
  return true
}

/** 从开票/查询结果解析 request_id */
function extractAgtRequestId(res) {
  const data = getAgtInvoiceData(res)
  const submission = data.submission || {}
  return String(
    data.request_id
    || data.requestID
    || submission.request_id
    || (data.submit_result && data.submit_result.data && data.submit_result.data.requestID)
    || ''
  )
}

/** 合并开票结果与查询结果的发票号 */
function mergeAgtDocumentNo(issueRes, estadoRes) {
  const fromEstado = getAgtInvoiceData(estadoRes || {})
  const fromIssue = getAgtInvoiceData(issueRes || {})
  return String(
    fromEstado.document_no
    || fromEstado.documentNo
    || fromEstado.invoice_code
    || (fromEstado.submission && (fromEstado.submission.document_no || fromEstado.submission.documentNo))
    || fromIssue.document_no
    || fromIssue.documentNo
    || (fromIssue.submission && (fromIssue.submission.document_no || fromIssue.submission.documentNo))
    || ''
  )
}

module.exports = {
  wxAsyncApi,
  debounce,
  throttle,
  fmoney,
  parseMoneyNumber,
  judgmentData,
  handleTimeValue,
  getAgtInvoiceData,
  getAgtValidationErrors,
  getAgtDocStatuses,
  isAgtValidationPending,
  isAgtValidationPassed,
  extractAgtRequestId,
  mergeAgtDocumentNo,
}