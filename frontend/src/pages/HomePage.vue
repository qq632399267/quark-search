<template>
  <div class="home-page">
    <!-- 搜索区 -->
    <div class="hero">
      <h1 class="hero-title">夸克搜</h1>
      <p class="hero-subtitle">网盘资源搜索引擎 · 免费 · 快速</p>
      <div class="search-bar">
        <n-input
          v-model:value="keyword"
          size="large"
          placeholder="搜短剧、电影、电视剧、动漫、综艺..."
          :input-props="{ autocomplete: 'off' }"
          @keyup.enter="doSearch"
        >
          <template #suffix>
            <n-button type="primary" @click="doSearch" :disabled="!keyword.trim()">
              搜索
            </n-button>
          </template>
        </n-input>
      </div>
      <!-- 热门搜索词 -->
      <div class="hot-tags" v-if="hotKeywords.length">
        <n-text depth="3" style="margin-right: 8px">🔥 热门：</n-text>
        <n-tag v-for="kw in hotKeywords" :key="kw" size="small" @click="searchTag(kw)" style="cursor:pointer">
          {{ kw }}
        </n-tag>
      </div>
    </div>

    <!-- 分类导航 -->
    <n-card title="资源分类" class="section-card">
      <n-grid :cols="5" :x-gap="12" :y-gap="12">
        <n-grid-item v-for="cat in categories" :key="cat.name">
          <n-card
            :title="cat.name"
            size="small"
            hoverable
            @click="$router.push(`/s/${cat.name}`)"
            style="cursor:pointer;text-align:center"
          >
            <template #header-extra>
              <n-badge :value="cat.count || 0" :max="999" />
            </template>
            <n-text depth="3" style="font-size:13px">
              {{ getCategoryIcon(cat.name) }} {{ cat.count || 0 }} 部资源
            </n-text>
          </n-card>
        </n-grid-item>
      </n-grid>
    </n-card>

    <!-- 热门推荐 -->
    <n-card title="🔥 热门推荐" class="section-card">
      <n-spin :show="loading">
        <n-empty v-if="!loading && hotList.length === 0" description="暂无数据" />
        <n-grid :cols="cols" :x-gap="12" :y-gap="12" v-else>
          <n-grid-item v-for="item in hotList" :key="item.id">
            <n-card
              size="small"
              hoverable
              :title="item.title"
              @click="$router.push(`/d/${item.id}`)"
              style="cursor:pointer"
            >
              <template #header-extra>
                <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
              </template>
              <div class="resource-meta">
                <n-text depth="3" style="font-size:12px">{{ item.source }}</n-text>
                <n-text v-if="item.episodes" depth="3" style="font-size:12px"> {{ item.episodes }}</n-text>
              </div>
            </n-card>
          </n-grid-item>
        </n-grid>
      </n-spin>
    </n-card>

    <!-- 最新资源 -->
    <n-card title="📦 最新收录" class="section-card">
      <n-spin :show="loadingLatest">
        <n-empty v-if="!loadingLatest && latestList.length === 0" description="暂无数据" />
        <n-list v-else>
          <n-list-item v-for="item in latestList" :key="item.id">
            <template #prefix>
              <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
            </template>
            <n-thing :title="item.title" @click="$router.push(`/d/${item.id}`)" style="cursor:pointer">
              <template #description>
                <n-text depth="3" style="font-size:12px">
                  {{ item.source }} · {{ item.created_at }}
                </n-text>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-spin>
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getCategories, getHot, getLatest } from '../api/index.js'

const router = useRouter()
const keyword = ref('')
const categories = ref([])
const hotList = ref([])
const latestList = ref([])
const loading = ref(true)
const loadingLatest = ref(true)

const hotKeywords = ['家里家外', '迷情', '回到70年代霸道婆婆带我飞', '江南第一深情', '唐朝诡事录']

const cols = computed(() => {
  if (typeof window !== 'undefined') {
    if (window.innerWidth < 640) return 1
    if (window.innerWidth < 1024) return 2
    return 3
  }
  return 3
})

function getCategoryIcon(name) {
  const map = { '短剧': '🎭', '电影': '🎬', '电视剧': '📺', '动漫': '🎨', '综艺': '🎤' }
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
      getHot(9),
      getLatest(30),
    ])
    categories.value = catRes.data || []
    hotList.value = hotRes.data || []
    latestList.value = latestRes.data || []
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
.hero {
  text-align: center; padding: 60px 20px 40px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 16px; margin-bottom: 24px; color: #fff;
}
.hero-title { font-size: 42px; font-weight: 800; margin-bottom: 8px; }
.hero-subtitle { font-size: 16px; opacity: 0.9; margin-bottom: 24px; }
.search-bar { max-width: 600px; margin: 0 auto; }
.hot-tags { margin-top: 16px; display: flex; align-items: center; justify-content: center; flex-wrap: wrap; gap: 6px; }
.hot-tags :deep(.n-tag) { background: rgba(255,255,255,0.2); color: #fff; border: none; }
.section-card { margin-bottom: 20px; }
.resource-meta { display: flex; gap: 8px; margin-top: 4px; }
</style>
