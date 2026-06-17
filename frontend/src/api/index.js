import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
})

// ========== 内置种子数据（后端不可用时的降级方案） ==========
const MOCK_DATA = {
  categories: [
    { name: '短剧', desc: '精彩短剧合集，随时随地看' },
    { name: '电影', desc: '最新大片、经典电影收录' },
    { name: '电视剧', desc: '热播剧集、经典剧集' },
    { name: '动漫', desc: '热门动漫、经典番剧' },
    { name: '综艺', desc: '热门综艺节目' },
  ],
  resources: [
    { id: 1, title: '家里家外（79集）王道铁&孙艺燃', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/e89c96061b97', episodes: '79集', actors: '王道铁&孙艺燃', is_hot: true, click_count: 1580, created_at: '2026-06-15', description: '王道铁与孙艺燃联袂主演的家庭情感短剧，讲述家长里短的温情故事。' },
    { id: 2, title: '家里家外2（111集）王道铁＆孙艺燃', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/b6036de25673', episodes: '111集', actors: '王道铁＆孙艺燃', is_hot: true, click_count: 2340, created_at: '2026-06-15', description: '家里家外续集，剧情更加精彩。' },
    { id: 3, title: '双向欲臣（95集）', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/6002fc752e23', episodes: '95集', is_hot: true, click_count: 3200, created_at: '2026-06-14', description: '都市情感短剧，爱恨交织的情感大戏。' },
    { id: 4, title: '回到70年代霸道婆婆带我飞（95集）马晓伟&蔡欣洋', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/38dd56abcf99', episodes: '95集', actors: '马晓伟&蔡欣洋', is_hot: true, click_count: 4120, created_at: '2026-06-14', description: '穿越到70年代遇到霸道婆婆的搞笑温馨故事。' },
    { id: 5, title: '关于黎秘书的一切', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/cf184ee756c8', is_hot: true, click_count: 1890, created_at: '2026-06-13', description: '职场秘书的成长与爱情故事。' },
    { id: 6, title: '未婚妻与他人领证，我撤资离场', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/277ee2e3fd25', click_count: 2560, created_at: '2026-06-13', description: '商业精英遭遇情感背叛后的反击故事。' },
    { id: 7, title: '迷情', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/efeda2b24dee', is_hot: true, click_count: 1780, created_at: '2026-06-12', description: '扑朔迷离的情感悬疑短剧。' },
    { id: 8, title: '我在姜府当奶娘的日子', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/710e13bf4850', click_count: 980, created_at: '2026-06-12', description: '穿越到古代府邸当奶娘的趣味生活。' },
    { id: 9, title: '江南第一深情', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/a662ce26dfc6', is_hot: true, click_count: 3450, created_at: '2026-06-11', description: '江南水乡的少年痴情故事。' },
    { id: 10, title: '封神第二部：战火西岐', category: '电影', source: '夸克网盘', link: 'https://pan.quark.cn/s/example001', is_hot: true, click_count: 8900, created_at: '2026-06-10', description: '封神系列第二部，气势恢宏的神话战争大片。' },
    { id: 11, title: '唐探1900', category: '电影', source: '夸克网盘', link: 'https://pan.quark.cn/s/example002', is_hot: true, click_count: 7600, created_at: '2026-06-09', description: '唐探系列最新作品，悬疑与喜剧并重。' },
    { id: 12, title: '唐朝诡事录', category: '电视剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/example003', is_hot: true, click_count: 12400, created_at: '2026-06-08', description: '唐朝背景的奇幻探案剧集。' },
    { id: 13, title: '凡人修仙传', category: '动漫', source: '夸克网盘', link: 'https://pan.quark.cn/s/example004', is_hot: true, click_count: 15600, created_at: '2026-06-07', description: '经典修仙动漫，讲述凡人韩立的修仙之路。' },
    { id: 14, title: '你好，星期六', category: '综艺', source: '夸克网盘', link: 'https://pan.quark.cn/s/example005', click_count: 4500, created_at: '2026-06-06', description: '热门综艺节目，欢乐不断。' },
  ]
}

const ALL_RESOURCES = MOCK_DATA.resources

function mockResponse(data) {
  return new Promise(resolve => {
    setTimeout(() => resolve({ data }), 200)
  })
}

// ========== 正式API（带降级） ==========
function isBackendAlive() {
  return api.get('/categories', { timeout: 3000 })
    .then(r => r.data)
    .then(() => true)
    .catch(() => false)
}

// 缓存后端是否可用
let _backendOk = null

async function checkBackend() {
  if (_backendOk === null) {
    _backendOk = await isBackendAlive()
  }
  return _backendOk
}

export async function searchResources(params) {
  try {
    const ok = await checkBackend()
    if (ok) {
      const r = await api.get('/search', { params })
      return r.data
    }
  } catch (e) {}
  // fallback
  let items = [...ALL_RESOURCES]
  if (params?.q) {
    const q = params.q.toLowerCase()
    items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description && i.description.toLowerCase().includes(q)))
  }
  if (params?.category) {
    items = items.filter(i => i.category === params.category)
  }
  const page = params?.page || 1
  const pageSize = params?.page_size || 20
  const total = items.length
  const paged = items.slice((page - 1) * pageSize, page * pageSize)
  return { data: paged, total, page, page_size: pageSize }
}

export async function getDetail(id) {
  try {
    const ok = await checkBackend()
    if (ok) {
      const r = await api.get(`/detail/${id}`)
      return r.data
    }
  } catch (e) {}
  const item = ALL_RESOURCES.find(i => i.id == id)
  return { data: item || null }
}

export async function getCategories() {
  try {
    const ok = await checkBackend()
    if (ok) {
      const r = await api.get('/categories')
      return r.data
    }
  } catch (e) {}
  return { data: MOCK_DATA.categories.map(c => ({
    name: c.name,
    count: ALL_RESOURCES.filter(r => r.category === c.name).length
  })) }
}

export async function getHot(limit = 12) {
  try {
    const ok = await checkBackend()
    if (ok) {
      const r = await api.get('/hot', { params: { limit } })
      return r.data
    }
  } catch (e) {}
  const items = ALL_RESOURCES.filter(i => i.is_hot).slice(0, limit)
  return { data: items }
}

export async function getLatest(limit = 20) {
  try {
    const ok = await checkBackend()
    if (ok) {
      const r = await api.get('/latest', { params: { limit } })
      return r.data
    }
  } catch (e) {}
  const items = [...ALL_RESOURCES].sort((a, b) => b.id - a.id).slice(0, limit)
  return { data: items }
}

export function submitResource(data) {
  return api.post('/submit', data).then(r => r.data)
}

// 管理后台
export function adminListResources(params) {
  return api.get('/admin/resources', { params }).then(r => r.data)
}

export function adminAddResource(data) {
  return api.post('/admin/resources', data).then(r => r.data)
}

export function adminUpdateResource(id, data) {
  return api.put(`/admin/resources/${id}`, data).then(r => r.data)
}

export function adminDeleteResource(id) {
  return api.delete(`/admin/resources/${id}`).then(r => r.data)
}

export function adminListSubmissions(params) {
  return api.get('/admin/submissions', { params }).then(r => r.data)
}

export function adminApproveSubmission(id) {
  return api.post(`/admin/submissions/${id}/approve`).then(r => r.data)
}

export function adminRejectSubmission(id) {
  return api.post(`/admin/submissions/${id}/reject`).then(r => r.data)
}
