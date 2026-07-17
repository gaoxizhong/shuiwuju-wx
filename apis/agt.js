import { httpRequest } from '../utils/request'

//REST
//请求示例（Accept: application/json）：
// 开票软件详细信息对象
let softwareInfoDetail = { 
  "productId": "Water Manager", // 开票软件名称
  "productVersion": "1.0.1", // 开票软件版本
  "softwareValidationNumber": "1" // 开票软件认证编号
}
//1 请求注册电子发票
//Endpoint： https://sifphml.minfin.gov.ao/sigt/fe/v1/registarFactura

export const getRegistarFactura = (d) => {
  console.log(d)
  let _data = d;
  let data = {
    "schemaVersion": "1.0.1", // 服务schema版本，如"1.0"
    "submissionUUID": "13e7aaf7-e9e1-40af-875b-930f070c22be",
    "taxRegistrationNumber": "5001442740", // 纳税人识别号
    "submissionTimeStamp": "2026-06-16T14:30:00Z", // 请求提交时间戳，格式为ISO 8601，示例："2025-05-27T14:30:00Z"（UTC）；"2025-05-27T14:30:00-03:00"（含时区信息）
    "softwareInfo": { // 开票软件数据对象
        "softwareInfoDetail": { 
          "productId": "Water Manager", // 开票软件名称
          "productVersion": "1.0.1", // 开票软件版本
          "softwareValidationNumber": "1" // 开票软件认证编号
        },
        "jwsSoftwareSignature": "string" // 使用软件私钥对开票软件进行的数字签名，采用RS256算法（RSA + SHA-256）。softwareInfo对象的所有字段必须用于签名
    },
    "numberOfEntries": "1",  //服务调用中包含的发票数量
    "documents": [{  //发票列表数组（document对象）。预计最多30张发票
        "documentNo": "FA WM2026/00001",  // 文件唯一标识符，由符合SAF-T(AO)文件的开票软件生成。由内部文档代码+空格+文档序列号+斜杠+顺序编号组成
        "documentStatus": "N", // 发票文件当前状态，可选值：N — 正常；S — 自开票；A — 作废；R — 汇总其他应用创建的文件摘要文档，在本应用中生成；C — 为修正之前 生成但被AGT拒绝的文件而生成的纠正文件（在rejectedDocumentNo 字段中标识）
        "jwsDocumentSignature": "string", // 发票签名，使用开具者私钥加密，包含以下发票字段： documentNo、taxRegistrationNumb er、documentType、documentDate、 customerTaxID、 customerCountry、companyName、documentTotals
        "documentDate": "2026-07-16",  // 文件签发日期，格式"YYYY-MM-DD"
        //电子发票文件类型，可选值：FA — 预付款发票；FT — 发票；FR— 发票/收据；FG —汇总发票；AC — 收款通知；AR — 收款通知/收据；TV — 销售凭证；RC — 开具收据；RG — 收据；RE — 冲销或冲销收据；ND — 借项通知单；NC — 贷项通知单；AF — 自开票发票/收据；RP — 保费或保费收据；RA —接受再保险；CS — 共同保险分摊；LD —主导共同保险人分摊
        "documentType": "FA",  
        "eacCode": "36001", // 与本发票相关的活动代码
        "systemEntryDate": "2026-07-16T18:06:06",  //签名时记录注册的时间戳 — ISO 8601格式（YYYY-MMDDThh:mm:ss）
        "customerTaxID": "5001442740", // 发票客户识别号。对于国内买家，填写安哥拉NIF。对于国内纳税人开票文件中未标识买方的，可使用值"999999999
        "customerCountry": "AO", // 买方国家代码，遵循ISO 3166-1-alpha-2标准，国内买方使用"AO"
        "companyName": "string", // 纳税人名称/商号
        "lines": [{  // 发票文件条目列表数组（document对象），以下发票类型（documentType）不 需要填写：AR — 收款通知/收据；RC — 开具收据；RG — 其 他开具收据。其他发票文件类型必须填写此字段
            "lineNumber": 1,  //发票文件条目的行 号，从1开始，每新增一行递增1
            "productCode": "string", // 产品或服务代码 
            "productDescription": "Factura de Adiantamento",  // 产品或服务描述
            "quantity": 1,  // 数量，整数或小数
            "unitOfMeasure": "string",  // 计量单位
            "unitPrice": "string",  // 单价，不含折扣和税费
            "unitPriceBase": "string",  // 扣除行或头折扣后的单价，不含税费
            "debitAmount": "string", // 每行总金额，不含税，已扣除折扣，其中已应用税率和/或豁 免原因的值。debitAmount和 creditAmount字段只 能填写其一；（借方金额）‌：代表资金流出或资产增加的数值，在会计记账中记入借方。
            "creditAmount": "string",  // 每行总金额，不含税，已扣除折扣，其中已应用税率和/或豁免原因的值。debitAmount和creditAmount字段只能填写其一 （贷方金额）‌：代表资金流入或负债/权益增加的数值，在会计记账中记入贷方。
            //预付款发票场景下，‌付款时填借方（预付账款），收货/核销时填贷方（冲减预付账款）‌。‌‌
            "referenceInfo": { // 详细说明本发票文件所引用基础文件的参考信息。以下类型发票必填：NC（贷项通知单），用于标识退货的基础发票
              "reference": "string",  // 本条目引用的原始发票文件参考编号
              "reason": "Anular", // 原始文件介入原因
              "referenceItemLineNo": 1 // 本条目引用的原始发票文件中条目行号的参考
            },
            "taxes": [{  // 指定为该行计算的税 款的对象数组
                "taxType": "IVA",  // 税制类型，可选值：IVA — 增值税；IS —印花税；IEC — 特别 消费税
                "taxCountryRegion": "AO",  //税收适用的国家/地区代码
                "taxCode": "ISE",   //税率代码。ISE表示豁免；NS表示不征税
                "taxPercentage": 0,  // 适用百分比税率（如14表示14%税率）。 豁免或不征税时填写0
                "taxContribution": "string"  // 本行税款的计算值（最多两位小数的十 进制值），贡献于发票文件总税额。此字 段计算值应向上取整 到下一个分，示例：23.144 → 23.15；0.001844 → 0.01；5.9999999 → 6.00
            }],
            "settlementAmount": "string"  // 折扣总额，应反映该行折扣比例和特定折 扣
        }],
        "documentTotals": {  //包含发票总计的对象
          "taxPayable": 0,  // 发票总税额（最多两 位小数的十进制值）
          "netTotal": 100.00,  // 不含税的文档净额（最多两位小数的十 进制值）
          "grossTotal": 100.00 // 含税的文档总额（最多两位小数的十进制值）
      },
      "withholdingTaxList": [{ // 预扣税列表
          "withholdingTaxType": "IVA",  // 预扣税类型 RT - 劳动所得税；II - 工业税；IS - 印花税；IVA - 增值税；IP - 房产税；IAC - 资本应用税；OU - 其他；IRPC - 法人所得税（未来税）；IRPS - 个人所得税
          "withholdingTaxDescription": "IVA",  // 预扣税描述
          "withholdingTaxAmount": 0 // 预扣税金额
      }]
        // "paymentReceipt": {  // 收据数据对象，以下发票类型必填：AR — 收款通知/收据；RC— 开具收据；RG —其他开具收据。其他发票文件类型不填写 此字段
        //     "sourceDocuments": [{  // 已支付的发票文件数据
        //         "lineNo": "string", // 包含在收据中的发票 文件行号，从1开始，每新增一行递增1
        //         "sourceDocumentID": {  // 包含在此收据中的发票文件数据
        //             "originatingON": "string", // 已核销的发票文件编号
        //             "documentDate": "string"  // 付款所涉及的发票或更正文件的签发日  期。格式："YYYYMM-DD"
        //         },
        //         "debitAmount": "string",  // 更正文件收据金额，源自无折扣发票行列 表 借方
        //         "creditAmount": "string" // 更正文件收据金额，源自无折扣发票行列表  贷方
        //     }]
        // },
    }]
  }
  return httpRequest({
    url: 'https://sifphml.minfin.gov.ao/sigt/fe/v1/registarFactura',
    method: 'POST',
    data
  })
}

//2、获取电子发票验证状态
//Endpoint： https://sifphml.minfin.gov.ao/sigt/fe/v1/obterEstado
let obterEstado_data = {
    "schemaVersion": "string", // 服务schema版本，如"1.0
    "submissionUUID": "string",   // 由软件提供的请求标识符（GUID或UUID）
    "taxRegistrationNumber": "string", // 纳税人识别号
    "submissionTimeStamp": "string", // 请求提交时间戳，格式ISO 8601
    "softwareInfo": { // 开票软件数据对象
      "softwareInfoDetail": { // 开票软件详细信息对象
        "productId": "string",  // 开票软件名称
        "productVersion": "string", // 开票软件版本
        "softwareValidationNumber": "string"  // 开票软件认证编号
      },
      "jwsSoftwareSignature": "string", //使用软件私钥对开票软件的数字签名，采用RS256算法
    },
    "requestID": "string" // 请求唯一标识符
}
// 3、 列出发票
// Endpoint： https://sifphml.minfin.gov.ao/sigt/fe/v1/listarFacturas
let listarFacturas_data = {
  "schemaVersion": "string", // 服务schema版本，如"1.0"
  "taxRegistrationNumber": "string", // 纳税人识别号
  "submissionTimeStamp": "string",  // 请求提交时间戳，格式ISO 8601
  "softwareInfo": {  //开票软件数据对象
    "softwareInfoDetail": { // 开票软件详细信息对象
      "productId": "string",  // 开票软件名称
      "productVersion": "string", // 开票软件版本
      "softwareValidationNumber": "string"  // 开票软件认证编号
    },
    "jwsSoftwareSignature": "string" // 软件数字签名
  },
  "jwsSignature": "string",  // 请求数字签名
  "requestID": "string", //请求唯一标识符
  "documentType": "string",  // 发票文件类型过滤器
  "documentDateFrom": "string", //发票日期起始范围，格式"YYYY-MM-DD"
  "documentDateTo": "string"  // 发票日期结束范围，格式"YYYY-MM-DD
}
// 4、 查询发票

// Endpoint： https://sifphml.minfin.gov.ao/sigt/fe/v1/consultarFactura
let consultarFactura_data = {
  "schemaVersion": "string", // 服务schema版本，如"1.0"
  "submissionUUID": "string", // 由软件提供的请求标识符（GUID或UUID）
  "taxRegistrationNumber": "string", // 纳税人识别号
  "submissionTimeStamp": "string",  // 请求提交时间戳，格式ISO 8601
  "invoiceNo": "string",  // 发票编号
  "softwareInfo": {  //开票软件数据对象
    "softwareInfoDetail": { // 开票软件详细信息对象
      "productId": "string",  // 开票软件名称
      "productVersion": "string", // 开票软件版本
      "softwareValidationNumber": "string"  // 开票软件认证编号
    },
    "jwsSoftwareSignature": "string" // 软件数字签名
  },
  "jwsSignature": "string" // 请求数字签名
}

// 5、申请序列号
// Endpoint： https://sifphml.minfin.gov.ao/sigt/fe/v1/solicitarSerie
let solicitarSerie_data = {
  "schemaVersion": "string", // 服务schema版本，如"1.0"
  "submissionUUID": "string", // 由软件提供的请求标识符（GUID或UUID）
  "taxRegistrationNumber": "string", // 纳税人识别号
  "submissionTimeStamp": "string",  // 请求提交时间戳，格式ISO 8601
  "softwareInfo": {  //开票软件数据对象
    "softwareInfoDetail": { // 开票软件详细信息对象
      "productId": "string",  // 开票软件名称
      "productVersion": "string", // 开票软件版本
      "softwareValidationNumber": "string"  // 开票软件认证编号
    },
    "jwsSoftwareSignature": "string" // 软件数字签名
  },
  "seriesYear":"String", // 系统年份
  "documentType": "String", // 文件类型
  "establishmentNumber": "String", // 机构编号  
  "seriesContingencyIndicator": "String",
  "jwsSignature": "string" // 请求数字签名
}