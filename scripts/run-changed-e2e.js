#!/usr/bin/env node
/* eslint-disable no-undef */

import path from 'path'
import fs from 'fs'
import simpleGit from 'simple-git'
import cypress from 'cypress'

const git = simpleGit()

async function main() {
  try {
    console.log('Fetching origin/main…')
    await git.fetch('origin', 'main')

    console.log('Generating diff summary…')
    const summary = await git.diffSummary(['origin/main...HEAD'])
    const changedFiles = summary.files.map((f) => f.file)

    const viewFiles = changedFiles.filter((f) => f.startsWith('src/views/'))
    if (viewFiles.length === 0) {
      console.log('🚫 沒有 src/views 下的變動，跳過 E2E。')
      process.exit(0)
    }

    // 收集可用的 spec 檔案 (.cy.js 或 .spec.js)
    const specs = viewFiles
      .map((f) => {
        const rel = f.replace(/^src\/views\//, '')
        const base = rel.replace(path.extname(rel), '')
        const cyPath = path.posix.join('cypress/e2e', `${base}.cy.js`)
        const specPath = path.posix.join('cypress/e2e', `${base}.spec.js`)
        if (fs.existsSync(cyPath)) return cyPath
        if (fs.existsSync(specPath)) return specPath
        console.warn(`⚠️ 找不到 spec: ${cyPath} 或 ${specPath}`)
        return null
      })
      .filter(Boolean)
    if (specs.length === 0) {
      console.log('❌ 找不到對應的 spec，請確認檔案命名或路徑對應規則。')
      process.exit(1)
    }
    try {
      const results = await cypress.run({
        // 將多個 spec 以逗號串接
        spec: specs.join(','),
      })

      if (results.totalFailed === 0) {
        console.log('✅ E2E 測試成功！')
      } else {
        console.error(`❌ E2E 測試失敗：${results.totalFailed} 個測試失敗`)
        process.exit(1)
      }
    } catch (error) {
      console.error('❌ E2E 執行失敗：', error.message)
      process.exit(1)
    }
  } catch (err) {
    console.error('執行失敗：', err.message)
    process.exit(1)
  }
}

await main()
