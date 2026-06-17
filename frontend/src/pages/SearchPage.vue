<template>
  <div class="search-page">
    <n-card>
      <template #header>
        <div class="search-header">
          <n-input v-model:value="searchWord" size="large" placeholder="输入关键词搜索..."
            @keyup.enter="doSearch" style="max-width:500px">
            <template #suffix>
              <n-button quaternary type="primary" @click="doSearch">搜索</n-button>
            </template>
          </n-input>
        </div>
      </template>

      <!-- 筛选 -->
      <div class="filters">
        <n-space align="center" style="flex-wrap:wrap">
          <n-text depth="3">分类：</n-text>
          <n-button size="tiny" :type="filterCategory === '' ? 'primary' : 'default'"
            @click="filterCategory = ''; loadData()">全部</n-button>
          <n-button size="tiny" v-for="c in allCategories" :key="c"
            :type="filterCategory === c ? 'primary' : 'default'"
            @click="filterCategory = c; loadData()">{{ c }}</n-button>
        </n-space>
        <n-space align="center" style="flex-wrap:wrap;margin-top:8px">
          <n-text depth="3">网盘：</n-text>
          <n-button size="tiny" :type="filterSource === '' ? 'primary' : 'default'"
            @click="filterSource = ''; loadData()">全部</n-button>
          <n-button size="tiny" v-for="s in allSources" :key="s"
            :type="filterSource === s ? 'primary' : 'default'"
            @click="filterSource = s; loadData()">{{ s }}</n-button>
        </n-space>
      </div>

      <n-divider />

      <!-- 搜索结果 -->
      <n-text depth="3" v-if="!loading">共找到 {{ total }} 条结果</n-text>
      <n-spin :show="loading">
        <n-empty v-if="!loading && list.length === 0" description="没有找到相关资源" />
        <n-list v-else>
          <n-list-item v-for="item in list" :key="item.id">
            <n-thing :title="item.title" @click="$router.push(`/d/${item.id}`)" style="cursor:pointer">
              <template #description>
                <n-space>
                  <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
                  <n-tag size="tiny" :bordered="false" type="info">{{ item.source }}</n-tag>
                  <n-text depth="3" style="font-size:12px">{{ item.created_at }}</n-text>
                </n-space>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </n-spin>

      <!-- 分页 -->
      <n-pagination v-if="totalPages > 1"
        v-model:page="currentPage"
        :page-count="totalPages"
        :page-size="pageSize"
        @update:page="loadData"
        style="margin-top:20px;justify-content:center" />
    </n-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { searchResources } from '../api/index.js'

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
.search-header { display: flex; align-items: center; gap: 12px; }
.filters { margin-top: 8px; }
</style>
