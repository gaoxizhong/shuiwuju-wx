/**
 * AGT 发票校验 QR + ESC/POS 打印（GS ( k）
 * 指令与凯胜诺等 ESC/POS 机「QR Code」一致：Model 2、纠错 M、存储后打印
 */
const encoding = require('./encoding.js')

const AGT_QR_BASE = 'https://quiosqueagt.minfin.gov.ao/facturacao-eletronica/consultar-fe'
const DEFAULT_EMISSOR_NIF = '5601022917'

function utf8Bytes(str) {
  return [...new encoding.TextEncoder().encode(str == null ? '' : String(str))]
}

/** AGT 官方 consultar-fe URL（documentNo 空格 → %20） */
function buildAgtConsultaFeUrl(documentNo, emissorNif) {
  const emissor = String(emissorNif || DEFAULT_EMISSOR_NIF).trim()
  const doc = String(documentNo || '').trim()
  if (!doc) return ''
  const documentParam = encodeURIComponent(doc)
  return `${AGT_QR_BASE}?emissor=${encodeURIComponent(emissor)}&document=${documentParam}`
}

/**
 * @param {string} text QR 内容（通常为 AGT URL）
 * @param {Object} [options]
 * @param {number} [options.moduleSize=6] 模块大小（3–16，常用 4–8）
 * @param {number} [options.ecLevel=49] 49=M，48=L
 */
function buildEscPosQrCodeBytes(text, options) {
  const opts = options || {}
  const data = utf8Bytes(text)
  if (!data.length) return []
  const moduleSize = opts.moduleSize != null ? opts.moduleSize : 6
  const ecLevel = opts.ecLevel != null ? opts.ecLevel : 49
  const model = [29, 40, 107, 4, 0, 49, 65, 50, 0]
  const size = [29, 40, 107, 3, 0, 49, 67, moduleSize]
  const ec = [29, 40, 107, 3, 0, 49, 69, ecLevel]
  const storeLen = data.length + 3
  const pL = storeLen & 0xff
  const pH = (storeLen >> 8) & 0xff
  const store = [29, 40, 107, pL, pH, 49, 80, 48, ...data]
  const print = [29, 40, 107, 3, 0, 49, 81, 48]
  return [...model, ...size, ...ec, ...store, ...print]
}

module.exports = {
  AGT_QR_BASE,
  DEFAULT_EMISSOR_NIF,
  buildAgtConsultaFeUrl,
  buildEscPosQrCodeBytes,
}
