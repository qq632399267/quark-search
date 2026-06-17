<template>
  <div class="favorites-page">
    <div class="page-header">
      <h1 class="page-title">⭐ 我的收藏</h1>
      <p class="page-desc" v-if="list.length === 0">还没有收藏任何资源，去首页逛逛吧</p>
      <p class="page-desc" v-else>共 {{ list.length }} 个收藏</p>
    </div>

    <n-empty v-if="loading && list.length === 0" description="暂无收藏">
      <template #extra>
        <n-button @click="$router.push('/')">去首页发现资源</n-button>
      </template>
    </n-empty>

    <div v-else-if="viewMode === 'grid'" class="card-grid">
      <ResourceCard
        v-for="item in resources"
        :key="item.id"
        :item="item"
        :show-fav="true"
        @fav-toggle="handleFavToggle"
      />
    </div>

    <n-list v-else class="fav-list">
      <n-list-item v-for="item in resources" :key="item.id">
        <n-thing :title="item.title" @click="$router.push(`/d/${item.id}`)" style="cursor:pointer">
          <template #description>
            <n-space>
              <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
              <n-tag size="tiny" type="info" :bordered="false">{{ item.source }}</n-tag>
              <n-text depth="3" style="font-size:12px">{{ item.created_at }}</n-text>
            </n-space>
          </template>
          <template #action>
            <n-button size="tiny" quaternary @click.stop="removeFav(item.id)">
              <template #icon><HeartIcon filled /></template>
              取消收藏
            </n-button>
          </template>
        </n-thing>
      </n-list-item>
    </n-list>

    <!-- 视图切换 -->
    <div class="view-toggle" v-if="resources.length">
      <n-button-group size="small">
        <n-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode='grid'">
          <template #icon><GridIcon /></template>
        </n-button>
        <n-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode='list'">
          <template #icon><ListIcon /></template>
        </n-button>
      </n-button-group>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getResources } from '../api/store.js'
import { getFavorites, toggleFavorite } from '../api/favorites.js'
import ResourceCard from '../components/ResourceCard.vue'

const viewMode = ref('grid')
const loading = ref(true)

const favIds = ref([])
const resources = computed(() => {
  const all = getResources()
  return favIds.value.map(id => all.find(r => r.id === id)).filter(Boolean)
})
const list = computed(() => favIds.value)

function load() {
  favIds.value = getFavorites()
  loading.value = false
}

function removeFav(id) {
  toggleFavorite(id)
  load()
}

function handleFavToggle(id) {
  load()
}

onMounted(load)
</script>

<style scoped>
.favorites-page {
  padding-bottom: 40px;
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a1a;
}
.page-desc {
  font-size: 14px;
  color: #888;
  margin-top: 4px;
}
.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}
.fav-list {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.view-toggle {
  position: fixed;
  bottom: 24px;
  right: 24px;
  z-index: 50;
}
</style>
