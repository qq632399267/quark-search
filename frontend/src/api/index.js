/**
 * API 层 — 支持后端 API 和 localStorage 回退
 * 当配置了 API_BASE_URL 且后端可访问时 → 使用后端 API
 * 否则 → 使用本地 localStorage 存储
 */
import CONFIG from './config.js'
import { getResources, setResources, addResource, updateResource, deleteResource, exportData, importData } from './store.js'

// ========== 后端检测 ==========
let _useBackend = false
let _backendOk = null

async function checkBackend() {
  if (_backendOk !== null) return _backendOk
  if (!CONFIG.API_BASE_URL) {
    _backendOk = false
    return false
  }
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), CONFIG.REQUEST_TIMEOUT)
    const res = await fetch(`${CONFIG.API_BASE_URL}/api/categories`, {
      signal: controller.signal,
    })
    clearTimeout(timer)
    _backendOk = res.ok
    _useBackend = _backendOk
    return _backendOk
  } catch {
    _backendOk = false
    _useBackend = false
    return false
  }
}

async function apiGet(path) {
  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`)
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function apiPost(path, body) {
  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.detail || `API error: ${res.status}`)
  }
  return res.json()
}

async function apiPut(path, body) {
  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

async function apiDelete(path) {
  const res = await fetch(`${CONFIG.API_BASE_URL}${path}`, { method: 'DELETE' })
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
}

// ========== 本地存储回退 ==========
function delay(ms = 100) {
  return new Promise(r => setTimeout(r, ms))
}

function getList() {
  return [...getResources()]
}

// ========== 聚合 API ==========

export async function searchResources(params) {
  if (await checkBackend()) {
    const qs = new URLSearchParams()
    if (params?.q) qs.set('q', params.q)
    if (params?.category) qs.set('category', params.category)
    if (params?.source) qs.set('source', params.source)
    qs.set('page', String(params?.page || 1))
    qs.set('page_size', String(params?.page_size || 20))
    return apiGet(`/api/search?${qs}`)
  }
  // localStorage fallback
  await delay()
  let items = getList()
  if (params?.q) {
    const q = params.q.toLowerCase()
    items = items.filter(i =>
      (i.title || '').toLowerCase().includes(q) ||
      (i.description || '').toLowerCase().includes(q)
    )
  }
  if (params?.category) items = items.filter(i => i.category === params.category)
  if (params?.source) items = items.filter(i => i.source === params.source)
  const page = params?.page || 1
  const pageSize = params?.page_size || 20
  const total = items.length
  return { data: items.slice((page - 1) * pageSize, page * pageSize), total, page, page_size: pageSize, total_pages: Math.ceil(total / pageSize) }
}

export async function getDetail(id) {
  if (await checkBackend()) {
    return apiGet(`/api/detail/${id}`)
  }
  await delay()
  const item = getList().find(i => i.id == id) || null
  return { data: item }
}

export async function getCategories() {
  if (await checkBackend()) {
    return apiGet('/api/categories')
  }
  await delay()
  const list = getList()
  const counts = {}
  list.forEach(i => { counts[i.category] = (counts[i.category] || 0) + 1 })
  return { data: Object.entries(counts).map(([name, count]) => ({ name, count })) }
}

export async function getHot(limit = 12) {
  if (await checkBackend()) {
    return apiGet(`/api/hot?limit=${limit}`)
  }
  await delay()
  const items = getList().filter(i => i.is_hot).slice(0, limit)
  return { data: items }
}

export async function getLatest(limit = 20) {
  if (await checkBackend()) {
    return apiGet(`/api/latest?limit=${limit}`)
  }
  await delay()
  const items = getList().sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, limit)
  return { data: items }
}

export async function submitResource(data) {
  if (await checkBackend()) {
    return apiPost('/api/submit', data)
  }
  await delay()
  addResource({ ...data, status: 'pending' })
  return { success: true }
}

// ========== 管理后台 API ==========

export async function adminListResources() {
  if (await checkBackend()) {
    return apiGet('/api/admin/resources')
  }
  await delay()
  return { data: getList() }
}

export async function adminAddResource(data) {
  if (await checkBackend()) {
    return apiPost('/api/admin/resources', data)
  }
  await delay()
  const item = addResource(data)
  return { data: item }
}

export async function adminUpdateResource(id, data) {
  if (await checkBackend()) {
    return apiPut(`/api/admin/resources/${id}`, data)
  }
  await delay()
  const item = updateResource(Number(id), data)
  return { data: item }
}

export async function adminDeleteResource(id) {
  if (await checkBackend()) {
    return apiDelete(`/api/admin/resources/${id}`)
  }
  await delay()
  deleteResource(Number(id))
  return { success: true }
}

export async function adminListSubmissions() {
  if (await checkBackend()) {
    return apiGet('/api/admin/submissions')
  }
  await delay()
  const items = getList().filter(i => i.status === 'pending')
  return { data: items }
}

export async function adminApproveSubmission(id) {
  if (await checkBackend()) {
    return apiPost(`/api/admin/submissions/${id}/approve`, {})
  }
  await delay()
  updateResource(Number(id), { status: 'active' })
  return { success: true }
}

export async function adminRejectSubmission(id) {
  if (await checkBackend()) {
    return apiPost(`/api/admin/submissions/${id}/reject`, {})
  }
  await delay()
  deleteResource(Number(id))
  return { success: true }
}

// 批量导入
export async function adminImportResources(items) {
  if (await checkBackend()) {
    return apiPost('/api/admin/import', { items })
  }
  // 本地模式：逐个添加
  let count = 0
  for (const item of items) {
    addResource(item)
    count++
  }
  return { message: `导入成功，新增 ${count} 条`, count }
}

// 统计信息
export async function adminGetStats() {
  if (await checkBackend()) {
    return apiGet('/api/admin/stats')
  }
  const list = getList()
  return {
    total_resources: list.length,
    active_resources: list.filter(i => i.status !== 'disabled').length,
    hot_resources: list.filter(i => i.is_hot).length,
    pending_submissions: list.filter(i => i.status === 'pending').length,
  }
}

// 导出/导入（通用）
export { exportData, importData }

// 获取当前模式
export function getMode() {
  return _useBackend ? 'backend' : 'local'
}
