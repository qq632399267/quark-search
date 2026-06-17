import { getResources, addResource, updateResource, deleteResource, exportData, importData } from './store.js'

function delay(ms = 200) {
  return new Promise(r => setTimeout(r, ms))
}

function getList() {
  return [...getResources()]
}

export async function searchResources(params) {
  await delay()
  let items = getList()
  if (params?.q) {
    const q = params.q.toLowerCase()
    items = items.filter(i => (i.title || '').toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q))
  }
  if (params?.category) {
    items = items.filter(i => i.category === params.category)
  }
  if (params?.source) {
    items = items.filter(i => i.source === params.source)
  }
  const page = params?.page || 1
  const pageSize = params?.page_size || 20
  const total = items.length
  const paged = items.slice((page - 1) * pageSize, page * pageSize)
  return { data: paged, total, page, page_size: pageSize }
}

export async function getDetail(id) {
  await delay()
  const item = getList().find(i => i.id == id) || null
  return { data: item }
}

export async function getCategories() {
  await delay()
  const list = getList()
  const counts = {}
  list.forEach(i => {
    counts[i.category] = (counts[i.category] || 0) + 1
  })
  const data = Object.entries(counts).map(([name, count]) => ({ name, count }))
  return { data }
}

export async function getHot(limit = 12) {
  await delay()
  const items = getList().filter(i => i.is_hot).slice(0, limit)
  return { data: items }
}

export async function getLatest(limit = 20) {
  await delay()
  const items = getList().sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, limit)
  return { data: items }
}

export function submitResource(data) {
  return delay().then(() => {
    addResource({ ...data, status: 'pending' })
    return { success: true }
  })
}

// 管理后台
export function adminListResources() {
  return delay().then(() => ({ data: getList() }))
}

export function adminAddResource(data) {
  return delay().then(() => {
    const item = addResource(data)
    return { data: item }
  })
}

export function adminUpdateResource(id, data) {
  return delay().then(() => {
    const item = updateResource(Number(id), data)
    return { data: item }
  })
}

export function adminDeleteResource(id) {
  return delay().then(() => {
    deleteResource(Number(id))
    return { success: true }
  })
}

export function adminListSubmissions() {
  return delay().then(() => {
    const items = getList().filter(i => i.status === 'pending')
    return { data: items }
  })
}

export function adminApproveSubmission(id) {
  return delay().then(() => {
    updateResource(Number(id), { status: 'active' })
    return { success: true }
  })
}

export function adminRejectSubmission(id) {
  return delay().then(() => {
    deleteResource(Number(id))
    return { success: true }
  })
}

export { exportData, importData }
