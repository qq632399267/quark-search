<template>
  <div class="home-page">
    <!-- 🎯 搜索区 -->
    <div class="hero">
      <div class="hero-bg"></div>
      <div class="hero-content">
        <div class="hero-badge">🔥 收录 {{ totalCount }} 部资源</div>
        <h1 class="hero-title">夸克搜</h1>
        <p class="hero-subtitle">网盘资源搜索引擎 · 免费 · 快速</p>
        <div class="search-bar">
          <div class="search-input-wrap">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
            <input
              v-model="keyword"
              type="text"
              placeholder="搜短剧、电影、电视剧、动漫、综艺..."
              @keyup.enter="doSearch"
            />
            <button class="search-btn" @click="doSearch" :disabled="!keyword.trim()">
              搜索
            </button>
          </div>
        </div>
        <div class="hot-tags" v-if="hotKeywords.length">
          <span class="hot-label">🔥 热门：</span>
          <span
            v-for="kw in hotKeywords" :key="kw"
            class="hot-tag"
            @click="searchTag(kw)"
          >{{ kw }}</span>
        </div>
      </div>
    </div>

    <!-- 📂 分类导航 -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">📂 资源分类</h2>
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
      </div>
      <n-spin :show="loadingLatest">
        <n-empty v-if="!loadingLatest && latestList.length === 0" description="暂无数据" />
        <div v-else class="card-grid">
          <ResourceCard v-for="item in latestList" :key="item.id" :item="item" />
        </div>
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
const categories = ref([])
const hotList = ref([])
const latestList = ref([])
const loading = ref(true)
const loadingLatest = ref(true)
const totalCount = ref(0)

const hotKeywords = ['家里家外', '逆袭', '重生', '穿越', '总裁', '王妃', '离婚', '萌宝']

const CATEGORY_GRADIENTS = {
  '短剧': 'linear-gradient(135deg, #e74c3c, #c0392b)',
  '电影': 'linear-gradient(135deg, #3498db, #2980b9)',
  '电视剧': 'linear-gradient(135deg, #2ecc71, #27ae60)',
  '动漫': 'linear-gradient(135deg, #f39c12, #e67e22)',
  '综艺': 'linear-gradient(135deg, #9b59b6, #8e44ad)',
}

function catGradient(name) {
  return CATEGORY_GRADIENTS[name] || 'linear-gradient(135deg, #6366f1, #8b5cf6)'
}

function catIcon(name) {
  const map = {
    '短剧': '🎭', '电影': '🎬', '电视剧': '📺', '动漫': '🎨', '综艺': '🎤',
  }
  return map[name] || '📁'
}

function doSearch() {
  if (keyword.value.trim()) {
    router.push(`/s/${encodeURIComponent(keyword.value.trim())}`)
  }
}

function searchTag(kw) {
  router.push(`/s/${encodeURIComponent(kw)}`)
}

onMounted(async () => {
  try {
    const [catRes, hotRes, latestRes] = await Promise.all([
      getCategories(),
      getHot(12),
      getLatest(24),
    ])
    categories.value = catRes.data || []
    hotList.value = hotRes.data || []
    latestList.value = latestRes.data || []
    totalCount.value = (catRes.data || []).reduce((sum, c) => sum + (c.count || 0), 0)
  } catch (e) {
    console.error('加载失败', e)
  } finally {
    loading.value = false
    loadingLatest.value = false
  }
})
</script>

<style scoped>
.home-page { padding-bottom: 40px; }

/* =================== Hero =================== */
.hero {
  position: relative;
  text-align: center;
  padding: 70px 20px 50px;
  border-radius: 16px;
  margin-bottom: 28px;
  overflow: hidden;
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #a855f7 100%);
}
.hero-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 50%, rgba(255,255,255,0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 50% 0%, rgba(255,255,255,0.12) 0%, transparent 40%);
  pointer-events: none;
}
.hero-content { position: relative; z-index: 1; }

.hero-badge {
  display: inline-block;
  padding: 4px 14px;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(4px);
  border-radius: 20px;
  font-size: 13px;
  color: rgba(255,255,255,0.9);
  margin-bottom: 16px;
}
.hero-title {
  font-size: 46px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
  letter-spacing: -1px;
  text-shadow: 0 2px 20px rgba(0,0,0,0.2);
}
.hero-subtitle {
  font-size: 16px;
  color: rgba(255,255,255,0.8);
  margin-bottom: 28px;
}

/* 搜索框 */
.search-bar { max-width: 560px; margin: 0 auto; }
.search-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.12);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  padding: 4px 4px 4px 16px;
  transition: all 0.3s;
}
.search-input-wrap:focus-within {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.18);
  box-shadow: 0 0 30px rgba(255,255,255,0.08);
}
.search-icon {
  flex-shrink: 0;
  color: rgba(255,255,255,0.6);
}
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  padding: 12px 12px;
  font-size: 16px;
  background: transparent;
  color: #fff;
}
.search-input-wrap input::placeholder {
  color: rgba(255,255,255,0.5);
}
.search-btn {
  flex-shrink: 0;
  padding: 10px 24px;
  border: none;
  border-radius: 10px;
  background: #fff;
  color: #6366f1;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.search-btn:hover { background: #f0f0ff; }
.search-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* 热门标签 */
.hot-tags {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 8px;
}
.hot-label {
  color: rgba(255,255,255,0.7);
  font-size: 13px;
}
.hot-tag {
  padding: 3px 12px;
  background: rgba(255,255,255,0.12);
  border: 1px solid rgba(255,255,255,0.2);
  border-radius: 14px;
  color: rgba(255,255,255,0.9);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}
.hot-tag:hover {
  background: rgba(255,255,255,0.25);
  border-color: rgba(255,255,255,0.4);
}

/* =================== Sections =================== */
.section {
  margin-bottom: 28px;
}
.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #1a1a1a;
}
.section-more {
  font-size: 14px;
  color: #6366f1;
  cursor: pointer;
  transition: color 0.2s;
}
.section-more:hover { color: #4f46e5; }

/* =================== Category Grid =================== */
.category-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 14px;
}
.category-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 24px 16px;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}
.category-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}
.cat-icon {
  font-size: 36px;
  margin-bottom: 8px;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}
.cat-name {
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
}
.cat-count {
  font-size: 13px;
  color: rgba(255,255,255,0.8);
}

/* =================== Card Grid =================== */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* =================== Responsive =================== */
@media (max-width: 768px) {
  .hero { padding: 50px 16px 36px; }
  .hero-title { font-size: 34px; }
  .hero-subtitle { font-size: 14px; }
  .category-grid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
  .card-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
@media (max-width: 400px) {
  .card-grid { grid-template-columns: repeat(2, 1fr); gap: 8px; }
  .category-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
