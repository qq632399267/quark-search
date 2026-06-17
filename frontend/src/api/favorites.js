/**
 * 收藏管理 - localStorage
 * 用户收藏的资源
 */
const FAV_KEY = 'quark_search_favorites'
const FOLDER_KEY = 'quark_search_folders'

// ====== 收藏夹 ======

export function getFavorites() {
  try {
    const raw = localStorage.getItem(FAV_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return []
}

export function setFavorites(list) {
  localStorage.setItem(FAV_KEY, JSON.stringify(list))
}

export function toggleFavorite(resourceId) {
  const list = getFavorites()
  const idx = list.indexOf(resourceId)
  if (idx >= 0) {
    list.splice(idx, 1)
    setFavorites(list)
    return false // 已取消收藏
  } else {
    list.unshift(resourceId)
    setFavorites(list)
    return true // 已收藏
  }
}

export function isFavorite(resourceId) {
  return getFavorites().includes(resourceId)
}

export function getFavoriteCount() {
  return getFavorites().length
}

// ====== 收藏文件夹 ======

export function getFolders() {
  try {
    const raw = localStorage.getItem(FOLDER_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {}
  return [
    { id: 'default', name: '默认收藏', icon: '⭐', count: 0 },
  ]
}

export function setFolders(list) {
  localStorage.setItem(FOLDER_KEY, JSON.stringify(list))
}

export function createFolder(name, icon = '📁') {
  const list = getFolders()
  const id = 'folder_' + Date.now()
  list.push({ id, name, icon, count: 0 })
  setFolders(list)
  return { id, name, icon, count: 0 }
}

export function deleteFolder(id) {
  if (id === 'default') return // 不能删除默认文件夹
  const list = getFolders().filter(f => f.id !== id)
  // 把该文件夹下的资源移回默认
  setFolders(list)
}

export function renameFolder(id, name) {
  const list = getFolders()
  const f = list.find(f => f.id === id)
  if (f) { f.name = name; setFolders(list) }
}
