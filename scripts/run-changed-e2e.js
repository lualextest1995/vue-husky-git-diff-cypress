#!/usr/bin/env node
/* eslint-disable no-undef */

import path from 'path'
import fs from 'fs'
import simpleGit from 'simple-git'
import cypress from 'cypress'

const git = simpleGit()

const testList = [
  'src/views/HomeView/index.vue',
  'src/views/AboutView/index.vue',
  'src/views/firstModule/firstPage/index.vue',
]

async function main() {
  try {
    console.log('Fetching origin/main…')
    await git.fetch('origin', 'main')

    console.log('Generating diff summary…')
    const summary = await git.diffSummary(['origin/main...HEAD'])
    const changedFiles = summary.files.map((f) => f.file)

    const viewFiles = changedFiles.filter((f) => {
      const isView = f.startsWith('src/views/')
      // 待測試補齊後，可以把 shouldTest 跟 testList 相關都刪掉
      const shouldTest = testList.includes(f)
      if (isView && !shouldTest) {
        console.warn(`⚠️ 白名單允許無測試：${f}`)
        return false
      }
      return isView && shouldTest
    })

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
