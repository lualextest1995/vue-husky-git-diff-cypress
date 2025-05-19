/* eslint-disable no-undef */
export const getPagePermission = (permissions, path) => {
  const pathArr = path.split('/')
  return Object.entries(permissions).reduce((acc, [role, info]) => {
    const pagePermessions = pathArr.reduce((acc, path) => acc?.[path] ?? [], info)
    acc[role] = pagePermessions
    return acc
  }, {})
}

export const createItFactory = (permissions, strategy) => {
  for (const role in permissions) {
    const roleName = role === 'developer' ? '開發商' : '代理商'
    describe(roleName, () => {
      const permList = permissions[role]
      for (const permission of permList) {
        const scenario = strategy[role]?.[permission]
        if (scenario) {
          it(`【${roleName}】${scenario.title}`, () => {
            scenario.run()
          })
        } else {
          it.skip(`【${roleName}】${permission} 未定義測試案例`, () => {})
        }
      }
    })
  }
}
