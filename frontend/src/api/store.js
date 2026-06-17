// ===== 本地存储管理 =====
// 当后端不可用时，用 localStorage 持久化数据
// 以后部署了后端，数据可以一键导出导入

const STORAGE_KEY = 'quark_search_resources'
const NEXT_ID_KEY = 'quark_search_next_id'

// 默认种子数据
const SEED_DATA = [
  { id: 1, title: '家里家外（79集）王道铁&孙艺燃', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/e89c96061b97', episodes: '79集', actors: '王道铁&孙艺燃', is_hot: true, click_count: 1580, created_at: '2026-06-15', description: '王道铁与孙艺燃联袂主演的家庭情感短剧。' },
  { id: 2, title: '家里家外2（111集）王道铁＆孙艺燃', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/b6036de25673', episodes: '111集', actors: '王道铁＆孙艺燃', is_hot: true, click_count: 2340, created_at: '2026-06-15', description: '家里家外续集。' },
  { id: 3, title: '双向欲臣（95集）', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/6002fc752e23', episodes: '95集', is_hot: true, click_count: 3200, created_at: '2026-06-14' },
  { id: 4, title: '回到70年代霸道婆婆带我飞（95集）马晓伟&蔡欣洋', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/38dd56abcf99', episodes: '95集', actors: '马晓伟&蔡欣洋', is_hot: true, click_count: 4120, created_at: '2026-06-14' },
  { id: 5, title: '关于黎秘书的一切', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/cf184ee756c8', is_hot: true, click_count: 1890, created_at: '2026-06-13' },
  { id: 6, title: '未婚妻与他人领证，我撤资离场', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/277ee2e3fd25', click_count: 2560, created_at: '2026-06-13' },
  { id: 7, title: '迷情', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/efeda2b24dee', is_hot: true, click_count: 1780, created_at: '2026-06-12' },
  { id: 8, title: '我在姜府当奶娘的日子', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/710e13bf4850', click_count: 980, created_at: '2026-06-12' },
  { id: 9, title: '江南第一深情', category: '短剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/a662ce26dfc6', is_hot: true, click_count: 3450, created_at: '2026-06-11' },
  { id: 10, title: '封神第二部：战火西岐', category: '电影', source: '夸克网盘', link: 'https://pan.quark.cn/s/example001', is_hot: true, click_count: 8900, created_at: '2026-06-10' },
  { id: 11, title: '唐探1900', category: '电影', source: '夸克网盘', link: 'https://pan.quark.cn/s/example002', is_hot: true, click_count: 7600, created_at: '2026-06-09' },
  { id: 12, title: '唐朝诡事录', category: '电视剧', source: '夸克网盘', link: 'https://pan.quark.cn/s/example003', is_hot: true, click_count: 12400, created_at: '2026-06-08' },
  { id: 13, title: '凡人修仙传', category: '动漫', source: '夸克网盘', link: 'https://pan.quark.cn/s/example004', is_hot: true, click_count: 15600, created_at: '2026-06-07' },
  { id: 14, title: '你好，星期六', category: '综艺', source: '夸克网盘', link: 'https://pan.quark.cn/s/example005', click_count: 4500, created_at: '2026-06-06' },
]

export function getResources() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  // 首次使用，初始化种子数据
  setResources(SEED_DATA)
  return [...SEED_DATA]
}

export function setResources(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (e) {
    console.error('保存失败:', e)
  }
}

export function addResource(item) {
  const list = getResources()
  const maxId = list.reduce((max, r) => Math.max(max, r.id || 0), 0)
  const newItem = {
    ...item,
    id: maxId + 1,
    click_count: 0,
    created_at: new Date().toISOString().slice(0, 10),
  }
  list.unshift(newItem)
  setResources(list)
  return newItem
}

export function updateResource(id, data) {
  const list = getResources()
  const idx = list.findIndex(r => r.id === id)
  if (idx === -1) return null
  list[idx] = { ...list[idx], ...data }
  setResources(list)
  return list[idx]
}

export function deleteResource(id) {
  const list = getResources().filter(r => r.id !== id)
  setResources(list)
}

export function exportData() {
  const data = getResources()
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `夸克搜-数据备份-${new Date().toISOString().slice(0,10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

export function importData(jsonStr) {
  const data = JSON.parse(jsonStr)
  if (!Array.isArray(data)) throw new Error('数据格式错误')
  setResources(data)
  return data.length
}
