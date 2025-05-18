#!/usr/bin/env node

import path from 'path'
import fs from 'fs'
import simpleGit from 'simple-git'
import { execSync } from 'child_process'

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

    console.log('執行以下 specs：', specs.join(', '))
    console.log('cypress 待捕')
  } catch (err) {
    console.error('執行失敗：', err.message)
    process.exit(1)
  }
}

// 執行主流程（請確保檔案為 .mjs，或在 package.json 設定 "type": "module"）
await main()
