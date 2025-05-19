import permissionsTable from '../../../fixtures/permissions.json'
import { getPagePermission, createItFactory } from '../../../utils/permission'

const path = 'firstModule/firstPage'
const rolePermissions = getPagePermission(permissionsTable, path)

const scenariosMap = {
  developer: {
    create: {
      title: 'Create 測試',
      run: () => {
        cy.log('開發商 Create 測試')
      },
    },
    read: {
      title: 'Read 測試',
      run: () => {
        cy.log('開發商 Read 測試')
      },
    },
    update: {
      title: 'Update 測試',
      run: () => {
        cy.log('開發商 Update 測試')
      },
    },
    delete: {
      title: 'Delete 測試',
      run: () => {
        cy.log('開發商 Delete 測試')
      },
    },
  },
  agent: {
    read: {
      title: 'Read 測試',
      run: () => {
        cy.log('代理商 Read 測試')
      },
    },
  },
}

describe('firstModule - firstPage', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  createItFactory(rolePermissions, scenariosMap)
})
