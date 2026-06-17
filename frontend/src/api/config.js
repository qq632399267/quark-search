/**
 * API 配置
 * 设置后端地址后，前端将通过 API 与后端通信
 * 留空则使用 localStorage 模式（纯前端）
 * 可通过环境变量 VITE_API_URL 覆盖
 */
const CONFIG = {
  // 后端 API 地址
  // 开发环境：http://localhost:8000
  // 生产环境：https://your-domain.com
  // 不设置则自动使用 localStorage 模式
  API_BASE_URL: import.meta.env.VITE_API_URL || '',

  // 请求超时（毫秒）
  REQUEST_TIMEOUT: 5000,
}

export default CONFIG
