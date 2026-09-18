const fs = require('fs')
const path = require('path')
const { marked } = require('marked')
const HTMLtoDOCX = require('html-to-docx')

const input = process.argv[2] || path.join(__dirname, '../docs/invoice-logic.md')
const output = process.argv[3] || input.replace(/\.md$/i, '.docx')

async function main() {
  const md = fs.readFileSync(input, 'utf8')
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"></head><body>${marked.parse(md)}</body></html>`
  const buffer = await HTMLtoDOCX(html, null, {
    table: { row: { cantSplit: true } },
    footer: false,
    pageNumber: false,
  })
  fs.writeFileSync(output, buffer)
  console.log('Generated:', output)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
