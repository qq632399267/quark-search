<template>
  <n-message-provider>
    <n-config-provider :theme-overrides="themeOverrides" :locale="zhCN" :date-locale="dateZhCN">
      <div class="app-container">
        <!-- 顶部导航 -->
        <n-layout-header class="header" bordered>
          <div class="header-inner">
            <router-link to="/" class="logo">
              <n-gradient-text type="primary" :size="22" weight="700">
                🔍 夸克搜
              </n-gradient-text>
            </router-link>
            <div class="header-nav">
              <n-button quaternary @click="$router.push('/submit')" size="small">
                <template #icon><n-icon>📤</n-icon></template>
                投稿
              </n-button>
              <n-button quaternary @click="$router.push('/admin')" size="small">
                <template #icon><n-icon>⚙️</n-icon></template>
                管理
              </n-button>
            </div>
          </div>
        </n-layout-header>

        <!-- 主内容 -->
        <n-layout class="main-content">
          <router-view />
        </n-layout>

        <!-- 底部 -->
        <n-layout-footer class="footer" bordered>
          <div class="footer-inner">
            <span>夸克搜 - 网盘资源索引站</span>
            <n-text depth="3" style="font-size: 12px">
              本站仅提供网盘资源索引，不存储任何文件
            </n-text>
          </div>
        </n-layout-footer>
      </div>
    </n-config-provider>
  </n-message-provider>
</template>

<script setup>
import { zhCN, dateZhCN } from 'naive-ui'

const themeOverrides = {
  common: {
    primaryColor: '#6366f1',
    primaryColorHover: '#818cf8',
    primaryColorPressed: '#4f46e5',
    borderRadius: '8px',
  },
}
</script>

<style>
* { margin: 0; padding: 0; box-sizing: border-box; }
body { background: #f5f5f5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
.app-container { min-height: 100vh; display: flex; flex-direction: column; }
.header { position: sticky; top: 0; z-index: 100; background: #fff; }
.header-inner {
  max-width: 1200px; margin: 0 auto; padding: 12px 20px;
  display: flex; align-items: center; justify-content: space-between;
}
.logo { text-decoration: none; }
.header-nav { display: flex; gap: 8px; }
.main-content { flex: 1; max-width: 1200px; margin: 0 auto; padding: 20px; width: 100%; }
.footer { background: #fff; text-align: center; }
.footer-inner { max-width: 1200px; margin: 0 auto; padding: 16px 20px; display: flex; flex-direction: column; gap: 4px; }
a { color: #6366f1; text-decoration: none; }
a:hover { color: #818cf8; }
</style>
