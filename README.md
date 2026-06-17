# 夸克搜 - 网盘资源索引站

全功能网盘资源搜索引擎，支持夸克/百度/阿里云盘等资源搜索。

## 技术栈
- 前端：Vue 3 + Vite + Naive UI
- 后端：Python FastAPI + SQLite
- 爬虫：Python httpx + BeautifulSoup

## 部署到 Zeabur（推荐，免费）

### 一键部署
[![Deploy on Zeabur](https://zeabur.com/button.svg)](https://zeabur.com)

### 手动部署步骤

1. Fork 或 Clone 本项目到你的 GitHub
2. 打开 [Zeabur](https://zeabur.com) → New Project → Import from GitHub
3. 选择 `quark-search` 仓库
4. Platform 选 **Web Service**，Start Command 填：
   ```
   cd backend && pip install -r requirements.txt && python -m uvicorn main:app --host 0.0.0.0 --port 8080
   ```
5. 部署前端：在同一个 Project 下 Add Service → 选 `frontend` 目录
6. Platform 选 **Static Site**，Output Dir 填 `dist`
7. Zeabur 会自动构建并分配域名

### 国内用户可选方案
- 后端：**Railway** (https://railway.app) 免费套餐
- 前端：**Vercel** (https://vercel.com) 免费套餐
