<template>
  <div class="collections-page">
    <div class="page-header">
      <h1 class="page-title">📂 分类整理</h1>
      <p class="page-desc">创建文件夹，将资源按主题、类型归类</p>
    </div>

    <div class="layout">
      <!-- 左侧：文件夹列表 -->
      <div class="sidebar">
        <div class="sidebar-header">
          <span class="sidebar-title">我的文件夹</span>
          <n-button size="tiny" @click="showCreateModal = true">+ 新建</n-button>
        </div>
        <div class="folder-list">
          <div
            v-for="folder in folders" :key="folder.id"
            :class="['folder-item', { active: activeFolder === folder.id }]"
            @click="selectFolder(folder.id)"
          >
            <span class="folder-icon">{{ folder.icon }}</span>
            <span class="folder-name">{{ folder.name }}</span>
            <span class="folder-count">{{ folder.count }}</span>
          </div>
        </div>
        <div class="sidebar-footer">
          <div class="tag-cloud">
            <span class="tag-cloud-title">常用标签</span>
            <div class="tag-list">
              <span
                v-for="tag in commonTags" :key="tag"
                class="tag-item"
                @click="filterTag = filterTag === tag ? '' : tag"
                :class="{ active: filterTag === tag }"
              >{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧：资源列表 -->
      <div class="main-panel">
        <div class="panel-header">
          <span class="panel-title">{{ currentFolderName }}</span>
          <n-button-group size="tiny">
            <n-button :type="viewMode === 'grid' ? 'primary' : 'default'" @click="viewMode='grid'">
              <template #icon><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg></template>
            </n-button>
            <n-button :type="viewMode === 'list' ? 'primary' : 'default'" @click="viewMode='list'">
              <template #icon><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg></template>
            </n-button>
          </n-button-group>
        </div>

        <!-- 收藏的资源 -->
        <n-empty v-if="favResources.length === 0" description="暂无收藏的资源">
          <template #extra>
            <n-button @click="$router.push('/')">去首页收藏资源</n-button>
          </template>
        </n-empty>

        <div v-if="viewMode === 'grid' && filteredResources.length > 0" class="card-grid">
          <ResourceCard
            v-for="item in filteredResources" :key="item.id"
            :item="item"
            :show-fav="true"
            @fav-toggle="reload"
          />
        </div>

        <n-list v-else-if="filteredResources.length > 0" class="list-view">
          <n-list-item v-for="item in filteredResources" :key="item.id">
            <n-thing :title="item.title" @click="$router.push(`/d/${item.id}`)" style="cursor:pointer">
              <template #description>
                <n-space>
                  <n-tag size="tiny" :bordered="false">{{ item.category }}</n-tag>
                  <n-tag size="tiny" type="info" :bordered="false">{{ item.source }}</n-tag>
                </n-space>
              </template>
              <template #action>
                <n-button size="tiny" quaternary @click.stop="removeFav(item.id)">取消收藏</n-button>
              </template>
            </n-thing>
          </n-list-item>
        </n-list>
      </div>
    </div>

    <!-- 新建文件夹弹窗 -->
    <n-modal v-model:show="showCreateModal" title="新建文件夹" preset="card" style="width:400px">
      <n-form>
        <n-form-item label="名称">
          <n-input v-model:value="newFolderName" placeholder="如：古装短剧" />
        </n-form-item>
        <n-space>
          <n-button type="primary" @click="createFolder">创建</n-button>
          <n-button @click="showCreateModal = false">取消</n-button>
        </n-space>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getResources } from '../api/store.js'
import { getFavorites, toggleFavorite, getFolders, createFolder as createFolderAPI } from '../api/favorites.js'
import ResourceCard from '../components/ResourceCard.vue'

const viewMode = ref('grid')
const activeFolder = ref('default')
const showCreateModal = ref(false)
const newFolderName = ref('')
const filterTag = ref('')

const folders = ref([])
const favIds = ref([])

const commonTags = ['短剧', '电影', '电视剧', '动漫', '综艺', '完结', '连载', '甜宠', '古装', '现代']

const favResources = computed(() => {
  const all = getResources()
  return favIds.value.map(id => all.find(r => r.id === id)).filter(Boolean)
})

const filteredResources = computed(() => {
  let items = favResources.value
  if (filterTag.value) {
    items = items.filter(r => r.category === filterTag.value)
  }
  return items
})

const currentFolderName = computed(() => {
  const f = folders.value.find(f => f.id === activeFolder.value)
  return f ? f.name : '默认收藏'
})

function load() {
  favIds.value = getFavorites()
  folders.value = getFolders()
  // 更新文件夹计数
  folders.value.forEach(f => f.count = favIds.value.length)
}

function selectFolder(id) {
  activeFolder.value = id
}

function createFolder() {
  if (!newFolderName.value.trim()) return
  createFolderAPI(newFolderName.value.trim())
  newFolderName.value = ''
  showCreateModal.value = false
  load()
}

function removeFav(id) {
  toggleFavorite(id)
  load()
}

function reload() { load() }

onMounted(load)
</script>

<style scoped>
.collections-page { padding-bottom: 40px; }
.page-header { margin-bottom: 20px; }
.page-title { font-size: 24px; font-weight: 700; color: #1a1a1a; }
.page-desc { font-size: 14px; color: #888; margin-top: 4px; }

.layout { display: flex; gap: 20px; align-items: flex-start; }

/* 左侧栏 */
.sidebar {
  width: 220px; flex-shrink: 0;
  background: #fff; border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  overflow: hidden;
}
.sidebar-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 14px 16px; border-bottom: 1px solid #f0f0f0;
}
.sidebar-title { font-size: 14px; font-weight: 600; color: #333; }
.folder-list { padding: 8px; }
.folder-item {
  display: flex; align-items: center; gap: 8px;
  padding: 8px 12px; border-radius: 8px;
  cursor: pointer; transition: all 0.2s;
  font-size: 14px;
}
.folder-item:hover { background: #f5f5f5; }
.folder-item.active { background: #f0f0ff; color: #6366f1; font-weight: 600; }
.folder-icon { font-size: 16px; }
.folder-name { flex: 1; }
.folder-count { font-size: 12px; color: #999; background: #f0f0f0; padding: 1px 7px; border-radius: 10px; }

.sidebar-footer { padding: 12px 16px; border-top: 1px solid #f0f0f0; }
.tag-cloud-title { font-size: 12px; color: #999; margin-bottom: 6px; display: block; }
.tag-list { display: flex; flex-wrap: wrap; gap: 4px; }
.tag-item {
  padding: 2px 8px; border-radius: 4px;
  font-size: 12px; color: #666; background: #f5f5f5;
  cursor: pointer; transition: all 0.2s;
}
.tag-item:hover { background: #eee; }
.tag-item.active { background: #6366f1; color: #fff; }

/* 主面板 */
.main-panel { flex: 1; min-width: 0; }
.panel-header {
  display: flex; align-items: center; justify-content: space-between;
  margin-bottom: 16px;
}
.panel-title { font-size: 18px; font-weight: 600; color: #1a1a1a; }

.card-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(170px, 1fr)); gap: 14px; }
.list-view { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.04); }

@media (max-width: 768px) {
  .layout { flex-direction: column; }
  .sidebar { width: 100%; }
  .card-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
}
</style>
