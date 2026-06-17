<template>
  <div class="search-page">
    <!-- 搜索头 -->
    <div class="search-header-card">
      <div class="search-header-inner">
        <div class="search-input-wrap">
          <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          <input
            v-model="searchWord"
            type="text"
            placeholder="输入关键词搜索..."
            @keyup.enter="doSearch"
          />
          <button class="search-btn" @click="doSearch">搜索</button>
        </div>
      </div>
    </div>

    <!-- 筛选 -->
    <div class="filters-card">
      <div class="filter-row">
        <span class="filter-label">分类</span>
        <div class="filter-tags">
          <span
            :class="['filter-tag', { active: filterCategory === '' }]"
            @click="filterCategory = ''; loadData()"
          >全部</span>
          <span
            v-for="c in allCategories" :key="c"
            :class="['filter-tag', { active: filterCategory === c }]"
            @click="filterCategory = c; loadData()"
          >{{ c }}</span>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">网盘</span>
        <div class="filter-tags">
          <span
            :class="['filter-tag', { active: filterSource === '' }]"
            @click="filterSource = ''; loadData()"
          >全部</span>
          <span
            v-for="s in allSources" :key="s"
            :class="['filter-tag', { active: filterSource === s }]"
            @click="filterSource = s; loadData()"
          >{{ s }}</span>
        </div>
      </div>
    </div>

    <!-- 结果统计 -->
    <div class="result-stats" v-if="!loading">
      <span class="result-count">共找到 <strong>{{ total }}</strong> 条结果</span>
      <span class="result-view">以卡片视图显示</span>
    </div>

    <!-- 结果列表 -->
    <n-spin :show="loading">
      <n-empty v-if="!loading && list.length === 0" description="没有找到相关资源 😅">
        <template #extra>
          <n-button size="small" @click="$router.push('/')">返回首页</n-button>
        </template>
      </n-empty>

      <div v-else class="card-grid">
        <ResourceCard v-for="item in list" :key="item.id" :item="item" />
      </div>
    </n-spin>

    <!-- 分页 -->
    <div v-if="totalPages > 1" class="pagination-wrap">
      <div class="pagination-inner">
        <button class="page-btn prev" :disabled="currentPage <= 1" @click="currentPage--; loadData()">
          ← 上一页
        </button>
        <span class="page-info">{{ currentPage }} / {{ totalPages }}</span>
        <button class="page-btn next" :disabled="currentPage >= totalPages" @click="currentPage++; loadData()">
          下一页 →
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchResources } from '../api/index.js'
import ResourceCard from '../components/ResourceCard.vue'

const route = useRoute()
const searchWord = ref('')
const list = ref([])
const loading = ref(false)
const total = ref(0)
const currentPage = ref(1)
const pageSize = 20
const totalPages = ref(1)

const filterCategory = ref('')
const filterSource = ref('')
const allCategories = ['短剧', '电影', '电视剧', '动漫', '综艺']
const allSources = ['夸克网盘', '百度网盘', '阿里云盘', 'UC网盘']

async function loadData() {
  loading.value = true
  try {
    const res = await searchResources({
      q: searchWord.value,
      category: filterCategory.value,
      source: filterSource.value,
      page: currentPage.value,
      page_size: pageSize,
    })
    list.value = res.data || []
    total.value = res.total || 0
    totalPages.value = res.total_pages || 1
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function doSearch() {
  currentPage.value = 1
  loadData()
}

onMounted(() => {
  const kw = route.params.keyword
  if (kw) {
    searchWord.value = decodeURIComponent(kw)
    loadData()
  }
})
</script>

<style scoped>
.search-page { padding-bottom: 40px; }

/* 搜索头卡片 */
.search-header-card {
  background: linear-gradient(135deg, #4f46e5, #7c3aed);
  border-radius: 14px;
  padding: 24px 20px;
  margin-bottom: 16px;
}
.search-header-inner { max-width: 600px; margin: 0 auto; }
.search-input-wrap {
  display: flex;
  align-items: center;
  background: rgba(255,255,255,0.15);
  backdrop-filter: blur(8px);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 12px;
  padding: 3px 3px 3px 14px;
  transition: all 0.3s;
}
.search-input-wrap:focus-within {
  border-color: rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.2);
}
.search-icon { flex-shrink: 0; }
.search-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  padding: 10px 10px;
  font-size: 15px;
  background: transparent;
  color: #fff;
}
.search-input-wrap input::placeholder { color: rgba(255,255,255,0.55); }
.search-btn {
  flex-shrink: 0;
  padding: 8px 20px;
  border: none;
  border-radius: 8px;
  background: #fff;
  color: #6366f1;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}
.search-btn:hover { background: #f0f0ff; }

/* 筛选卡片 */
.filters-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.filter-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 10px;
}
.filter-row:last-child { margin-bottom: 0; }
.filter-label {
  flex-shrink: 0;
  font-size: 13px;
  color: #888;
  padding-top: 4px;
  min-width: 36px;
}
.filter-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.filter-tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  color: #666;
  background: #f5f5f5;
  cursor: pointer;
  transition: all 0.2s;
  user-select: none;
}
.filter-tag:hover { background: #eee; }
.filter-tag.active {
  background: #6366f1;
  color: #fff;
}

/* 结果统计 */
.result-stats {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.result-count {
  font-size: 14px;
  color: #666;
}
.result-count strong { color: #1a1a1a; }
.result-view {
  font-size: 12px;
  color: #999;
}

/* 卡片网格 */
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

/* 分页 */
.pagination-wrap {
  display: flex;
  justify-content: center;
  margin-top: 24px;
}
.pagination-inner {
  display: flex;
  align-items: center;
  gap: 12px;
  background: #fff;
  padding: 8px 16px;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.page-btn {
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  background: #fff;
  color: #333;
  cursor: pointer;
  transition: all 0.2s;
}
.page-btn:hover:not(:disabled) {
  border-color: #6366f1;
  color: #6366f1;
}
.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}
.page-info {
  font-size: 14px;
  color: #666;
  min-width: 60px;
  text-align: center;
}

/* 响应式 */
@media (max-width: 768px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
  .search-header-card { padding: 18px 14px; }
  .filters-card { padding: 12px 14px; }
}
</style>
