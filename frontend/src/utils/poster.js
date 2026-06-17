/**
 * 生成海报占位图（SVG渐变）
 * 每条短剧根据标题 hash 生成独特的渐变色
 */

// 预设色板 - 16组好看的渐变
const PALETTES = [
  ['#667eea', '#764ba2'], // 紫蓝
  ['#f093fb', '#f5576c'], // 粉红
  ['#4facfe', '#00f2fe'], // 青蓝
  ['#43e97b', '#38f9d7'], // 青绿
  ['#fa709a', '#fee140'], // 粉黄
  ['#a18cd1', '#fbc2eb'], // 淡紫粉
  ['#fccb90', '#d57eeb'], // 橙紫
  ['#e0c3fc', '#8ec5fc'], // 紫蓝淡
  ['#f5576c', '#ff6f91'], // 红粉
  ['#30cfd0', '#330867'], // 蓝紫深
  ['#a1c4fd', '#c2e9fb'], // 淡蓝
  ['#ffecd2', '#fcb69f'], // 杏色
  ['#89f7fe', '#66a6ff'], // 天蓝
  ['#fddb92', '#d1fdff'], // 奶油蓝
  ['#c1dfc4', '#deecdd'], // 灰绿
  ['#d299c2', '#fef9d7'], // 粉米
]

// 纯色背景备选
const SOLID_COLORS = [
  '#667eea', '#f093fb', '#4facfe', '#43e97b',
  '#fa709a', '#a18cd1', '#fccb90', '#f5576c',
  '#30cfd0', '#a1c4fd', '#ffecd2', '#89f7fe',
]

function hashCode(str) {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash |= 0
  }
  return Math.abs(hash)
}

/**
 * 根据标题生成 SVG 海报的 data URL
 * @param {string} title - 短剧标题
 * @param {number} width - 图片宽度
 * @param {number} height - 图片高度
 * @returns {string} data:image/svg+xml URL
 */
export function generatePoster(title, width = 300, height = 420) {
  const hash = hashCode(title || '')
  const paletteIdx = hash % PALETTES.length
  const [color1, color2] = PALETTES[paletteIdx]

  // 提取标题前2-4个字符作为展示文字
  const displayText = extractDisplayText(title)

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:${color1}" />
        <stop offset="100%" style="stop-color:${color2}" />
      </linearGradient>
      <linearGradient id="overlay" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="60%" style="stop-color:rgba(0,0,0,0)" />
        <stop offset="100%" style="stop-color:rgba(0,0,0,0.6)" />
      </linearGradient>
    </defs>
    <rect width="${width}" height="${height}" fill="url(#bg)" rx="8" />
    <rect width="${width}" height="${height}" fill="url(#overlay)" rx="8" />
    <text x="${width / 2}" y="${height / 2 - 20}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, sans-serif" font-size="48" font-weight="bold"
      fill="rgba(255,255,255,0.9)">${escapeXml(displayText)}</text>
    <line x1="${width * 0.25}" y1="${height / 2 + 15}" x2="${width * 0.75}" y2="${height / 2 + 15}"
      stroke="rgba(255,255,255,0.3)" stroke-width="1" />
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

/**
 * 生成类别图标（基于纯色背景）
 */
export function generateCategoryPoster(name, width = 200, height = 120) {
  const hash = hashCode(name || '')
  const color = SOLID_COLORS[hash % SOLID_COLORS.length]

  const map = {
    '短剧': '🎭',
    '电影': '🎬',
    '电视剧': '📺',
    '动漫': '🎨',
    '综艺': '🎤',
  }
  const emoji = map[name] || '📁'

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
    <rect width="${width}" height="${height}" fill="${color}" rx="10" />
    <text x="${width / 2}" y="${height / 2 - 10}"
      text-anchor="middle" dominant-baseline="middle"
      font-size="36">${emoji}</text>
    <text x="${width / 2}" y="${height / 2 + 30}"
      text-anchor="middle" dominant-baseline="middle"
      font-family="Arial, sans-serif" font-size="14" font-weight="bold"
      fill="rgba(255,255,255,0.9)">${escapeXml(name)}</text>
  </svg>`

  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function extractDisplayText(title) {
  if (!title) return '?'
  // 去掉括号内容
  let text = title.replace(/[（(][^）)]*[）)]/g, '')
  // 去掉"AI短剧"等后缀
  text = text.replace(/(AI)?短剧/g, '')
  // 去掉"第"字开头的内容
  text = text.replace(/第[一二三四五六七八九十\d]+[季部集]/g, '')
  // 取前4个字符
  text = text.trim().slice(0, 4)
  return text || '?'
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * 获取短剧热力值对应的颜色
 */
export function getHotColor(count) {
  if (count > 1000) return '#ff4757'
  if (count > 500) return '#ff6348'
  if (count > 200) return '#ffa502'
  if (count > 50) return '#2ed573'
  return '#747d8c'
}
