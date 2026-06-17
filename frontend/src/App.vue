<template>
  <!-- 顶部导航 -->
  <n-layout-header class="header" bordered>
    <div class="header-inner">
      <router-link to="/" class="logo">
        <span class="logo-icon">Q</span>
        <span class="logo-text">夸克搜</span>
      </router-link>
      <div class="header-nav">
        <n-button quaternary @click="$router.push('/')" size="small" class="nav-btn">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
          </template>
          首页
        </n-button>
        <n-button quaternary @click="$router.push('/favorites')" size="small" class="nav-btn">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          </template>
          收藏
          <n-badge v-if="favCount > 0" :value="favCount" :max="99" style="margin-left:2px" />
        </n-button>
        <n-button quaternary @click="$router.push('/collections')" size="small" class="nav-btn">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
          </template>
          分类
        </n-button>
        <n-button quaternary @click="$router.push('/submit')" size="small" class="nav-btn">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 4v16m-8-8h16"/></svg>
          </template>
          投稿
        </n-button>
        <n-button quaternary @click="$router.push('/admin')" size="small" class="nav-btn">
          <template #icon>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
          </template>
          管理
        </n-button>
      </div>
    </div>
  </n-layout-header>

  <!-- 主内容 -->
  <n-layout class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="page-fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </n-layout>

  <!-- 底部 -->
  <n-layout-footer class="footer" bordered>
    <div class="footer-inner">
      <div class="footer-links">
        <router-link to="/">首页</router-link>
        <span class="footer-dot">·</span>
        <router-link to="/favorites">收藏</router-link>
        <span class="footer-dot">·</span>
        <router-link to="/collections">分类</router-link>
        <span class="footer-dot">·</span>
        <router-link to="/submit">投稿</router-link>
        <span class="footer-dot">·</span>
        <router-link to="/admin">管理</router-link>
      </div>
      <div class="footer-text">
        夸克搜 - 网盘资源索引站 | 只做搜索工具，不存储任何文件
      </div>
    </div>
  </n-layout-footer>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { zhCN, dateZhCN } from 'naive-ui'
import { getFavoriteCount } from './api/favorites.js'

const favCount = ref(0)

function updateFavCount() {
  favCount.value = getFavoriteCount()
}

let timer
onMounted(() => {
  updateFavCount()
  timer = setInterval(updateFavCount, 2000)
})
onUnmounted(() => clearInterval(timer))

const themeOverrides = {
  common: {
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
    borderRadius: '8px',
    bodyColor: '#f0f2f5',
  },
  Card: { borderRadius: '10px' },
  Button: { borderRadius: '8px' },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  background: #f0f2f5;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', Roboto, sans-serif;
  -webkit-font-smoothing: antialiased;
}
.app-container { min-height: 100vh; display: flex; flex-direction: column; }
.header {
  position: sticky; top: 0; z-index: 100;
  background: rgba(255,255,255,0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(0,0,0,0.06);
}
.header-inner {
  max-width: 1200px; margin: 0 auto; padding: 0 20px;
  display: flex; align-items: center; justify-content: space-between;
  height: 56px;
}
.logo { display: flex; align-items: center; gap: 8px; text-decoration: none; }
.logo-icon {
  width: 32px; height: 32px;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
  color: #fff; font-weight: 800; font-size: 16px;
}
.logo-text {
  font-size: 20px; font-weight: 700;
  background: linear-gradient(135deg, #6366f1, #8b5cf6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}
.header-nav { display: flex; gap: 4px; }
.nav-btn { font-size: 13px; }
.main-content { flex: 1; max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; }
.footer { background: #fff; text-align: center; border-top: 1px solid rgba(0,0,0,0.06); margin-top: auto; }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 20px 20px; display: flex; flex-direction: column; gap: 8px; }
.footer-links { display: flex; align-items: center; justify-content: center; gap: 8px; }
.footer-links a { color: #6366f1; text-decoration: none; font-size: 14px; transition: color 0.2s; }
.footer-links a:hover { color: #4f46e5; }
.footer-dot { color: #ccc; }
.footer-text { color: #999; font-size: 12px; }
.page-fade-enter-active, .page-fade-leave-active { transition: opacity 0.2s ease, transform 0.2s ease; }
.page-fade-enter-from { opacity: 0; transform: translateY(8px); }
.page-fade-leave-to { opacity: 0; transform: translateY(-8px); }
::-webkit-scrollbar { width: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: #ccc; border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: #999; }
</style>
