<template>
  <div class="home-page">
    <!-- 🎯 搜索区 - 专业搜索引擎风格 -->
    <div class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">🔍 收录 {{ totalCount }} 部网盘资源</div>
        <h1 class="hero-title">夸克搜</h1>
        <p class="hero-subtitle">多网盘资源搜索引擎 · 聚合百度 / 阿里 / 夸克 / 115</p>

        <!-- 主搜索框 -->
        <div class="search-box">
          <div class="search-bar">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜片名、演员、关键词..."
              @keyup.enter="doSearch"
            />
            <div class="search-source-picker">
              <span
                v-for="s in sources" :key="s.id"
                :class="['source-tag', { active: activeSource === s.id }]"
                @click="activeSource = s.id"
              >{{ s.label }}</span>
            </div>
            <button class="search-btn" @click="doSearch" :disabled="!keyword.trim()">搜一下</button>
          </div>
        </div>

        <!-- 热门标签 -->
        <div class="hot-tags">
          <span class="hot-label">🔥 热门搜索：</span>
          <span v-for="kw in hotKeywords" :key="kw" class="hot-tag" @click="searchTag(kw)">{{ kw }}</span>
        </div>
      </div>
    </div>

    <!-- 📂 分类导航 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">📂 资源分类</h2>
        <span class="section-more" @click="$router.push('/collections')">管理分类 →</span>
      </div>
      <div class="category-grid">
        <div
          v-for="cat in categories" :key="cat.name"
          class="category-card"
          :style="{ background: catGradient(cat.name) }"
          @click="$router.push(`/s/${cat.name}`)"
        >
          <div class="cat-icon">{{ catIcon(cat.name) }}</div>
          <div class="cat-name">{{ cat.name }}</div>
          <div class="cat-count">{{ cat.count }} 部</div>
        </div>
      </div>
    </section>

    <!-- 🔥 热门推荐 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">🔥 热门推荐</h2>
        <span class="section-more" @click="$router.push('/s/热门')">查看全部 →</span>
      </div>
      <n-spin :show="loading">
        <n-empty v-if="!loading && hotList.length === 0" description="暂无数据" />
        <div v-else class="card-grid">
          <ResourceCard v-for="item in hotList" :key="item.id" :item="item" />
        </div>
      </n-spin>
    </section>

    <!-- 📦 最新收录 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">📦 最新收录</h2>
        <!-- 视图切换 -->
        <n-button-group size="tiny">
          <n-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode='grid'">
            <template #icon><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></template>
          </n-button>
          <n-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode='list'">
            <template #icon><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></template>
          </n-button>
        </n-button-group>
      </div>
      <n-spin :show="loadingLatest">
        <n-empty v-if="!loadingLatest && latestList.length === 0" description="暂无数据" />
        <div v-if="viewMode === 'grid'" class="card-grid">
          <ResourceCard v-for="item in latestList" :key="item.id" :item="item" />
        </div>
        <n-list v-else class="list-view-card">
          <n-list-item v-for="item in latestList" :key="item.id">
            <n-thing :title="item.title" @click="$router.push(`/d/${item.id}`)" style="cursor:pointer">
              <template #description>
                <n-space>
                  <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
                  <n-tag size="tiny" type="info" :bordered="false">{{ item.source }}</n-tag>
                  <n-text depth="3" style="font-size:12px">{{ item.created_at }}</n-text>
                </n-space>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-spin>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getHot, getLatest } from '../api/index.js'
import ResourceCard from '../components/ResourceCard.vue'

const router = useRouter()
const keyword = ref('')
const activeSource = ref('all')
const categories = ref([])
const hotList = ref([])
const latestList = ref([])
const loading = ref(true)
const loadingLatest = ref(true)
const totalCount = ref(0)
const viewMode = ref('grid')

const sources = [
  { id: 'all', label: '全部' },
  { id: '夸克网盘', label: '夸克' },
  { id: '百度网盘', label: '百度' },
  { id: '阿里云盘', label: '阿里' },
  { id: '115', label: '115' },
]

const hotKeywords = ['家里家外', '逆袭', '重生', '穿越', '总裁', '王妃', '离婚', '萌宝', '修仙', '甜宠']

const CATEGORY_GRADIENTS = {
  '短剧': 'linear-gradient(135deg, #e74c3c, #c0392b)',
  '电影': 'linear-gradient(135deg, #3498db, #2980b9)',
  '电视剧': 'linear-gradient(135deg, #2ecc71, #27ae60)',
  '动漫': 'linear-gradient(135deg, #f39c12, #e67e22)',
  '综艺': 'linear-gradient(135deg, #9b59b6, #8e44ad)',
}

function catGradient(name) { return CATEGORY_GRADIENTS[name] || 'linear-gradient(135deg, #6366f1, #8b5cf6)' }
function catIcon(name) {
  const map = { '短剧': '🎭', '电影': '🎬', '电视剧': '📺', '动漫': '🎨', '综艺': '🎤' }
  return map[name] || '📁'
}

function doSearch() {
  if (keyword.value.trim()) {
    const path = activeSource.value !== 'all'
      ? `/s/${encodeURIComponent(keyword.value.trim())}?source=${activeSource.value}`
      : `/s/${encodeURIComponent(keyword.value.trim())}`
    router.push(path)
  }
}

function searchTag(kw) { router.push(`/s/${encodeURIComponent(kw)}`) }

onMounted(async () => {
  try {
    const [catRes, hotRes, latestRes] = await Promise.all([
      getCategories(), getHot(12), getLatest(24),
    ])
    categories.value = catRes.data || []
    hotList.value = hotRes.data || []
    latestList.value = latestRes.data || []
    totalCount.value = (catRes.data || []).reduce((sum, c) => sum + (c.count || 0), 0)
  } catch (e) { console.error('加载失败', e) }
  finally { loading.value = false; loadingLatest.value = false }
})
</script>

<style scoped>
.home-page { padding-bottom: 40px; }

/* =================== Hero =================== */
.hero {
  position: relative;
  text-align: center;
  padding: 60px 20px 40px;
  border-radius: 16px;
  margin-bottom: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
}
.hero-bg {
  position: absolute; inset: 0;
  background: radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
              radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
              radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 40%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }
.hero-badge {
  display: inline-block; padding: 4px 14px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px); border-radius: 20px;
  font-size: 13px; color: rgba(255,255,255,0.9); margin-bottom: 12px;
}
.hero-title {
  font-size: 46px; font-weight: 800; color: #fff; margin-bottom: 6px;
  letter-spacing: -1px; text-shadow: 0 2px 20px rgba(0,0,0,0.2);
}
.hero-subtitle { font-size: 15px; color: rgba(255,255,255,0.75); margin-bottom: 24px; }

/* 搜索框 */
.search-box { max-width: 680px; margin: 0 auto; }
.search-bar {
  display: flex; align-items: center;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 4px 4px 4px 16px;
  transition: all 0.3s;
  flex-wrap: wrap;
}
.search-bar:focus-within {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.18);
  box-shadow: 0 0 30px rgba(255,255,255,0.08);
}
.search-icon { flex-shrink: 0; color: rgba(255,255,255,0.6); }
.search-bar input {
  flex: 1; min-width: 120px;
  border: none; outline: none;
  padding: 12px 10px;
  font-size: 16px; background: transparent; color: #fff;
}
.search-bar input::placeholder { color: rgba(255,255,255,0.5); }
.search-source-picker {
  display: flex; gap: 2px;
  padding: 2px;
  background: rgba(255,255,255,0.08);
  border-radius: 8px;
}
.source-tag {
  padding: 4px 10px; border-radius: 6px;
  font-size: 12px; color: rgba(255,255,255,0.7);
  cursor: pointer; transition: all 0.2s; white-space: nowrap;
}
.source-tag:hover { background: rgba(255,255,255,0.1); color: #fff; }
.source-tag.active { background: rgba(255,255,255,0.2); color: #fff; font-weight: 600; }
.search-btn {
  flex-shrink: 0;
  padding: 10px 28px; border: none; border-radius: 10px;
  background: #fff; color: #6366f1;
  font-size: 15px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.search-btn:hover { background: #f0f0ff; }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 热门标签 */
.hot-tags {
  margin-top: 16px; display: flex;
  align-items: center; justify-content: center;
  flex-wrap: wrap; gap: 8px;
}
.hot-label { color: rgba(255,255,255,0.7); font-size: 13px; }
.hot-tag {
  padding: 3px 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px; color: rgba(255,255,255,0.9);
  font-size: 13px; cursor: pointer; transition: all 0.2s;
}
.hot-tag:hover { background: rgba(255,255,255,0.25); border-color: rgba(255,255,255,0.4); }

/* =================== Sections =================== */
.section { margin-bottom: 28px; }
.section-header {
  display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px;
}
.section-title { font-size: 20px; font-weight: 700; color: #1a1a1a; }
.section-more { font-size: 14px; color: #6366f1; cursor: pointer; transition: color 0.2s; }
.section-more:hover { color: #4f46e5; }

.category-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)); gap: 14px;
}
.category-card {
  display: flex; flex-direction: column; align-items: center;
  padding: 24px 16px; border-radius: 12px;
  cursor: pointer; transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.category-card:hover { transform: translateY(-4px); box-shadow: 0 8px 24px rgba(0,0,0,0.15); }
.cat-icon { font-size: 36px; margin-bottom: 8px; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1)); }
.cat-name { font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 4px; }
.cat-count { font-size: 13px; color: rgba(255,255,255,0.8); }

.card-grid {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 16px;
}
.list-view-card {
  background: #fff; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}

@media (max-width: 768px) {
  .hero { padding: 40px 16px 30px; }
  .hero-title { font-size: 32px; }
  .category-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
  .card-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .search-bar input { min-width: 80px; }
}
</style>
