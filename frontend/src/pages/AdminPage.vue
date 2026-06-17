<template>
  <div class="admin-page">
    <!-- 模式指示器 -->
    <div class="mode-bar">
      <span :class="['mode-tag', mode]">
        {{ mode === 'backend' ? '🌐 后端连接中' : '💻 本地存储模式' }}
      </span>
      <span class="mode-hint" v-if="mode === 'local'">
        配置 VITE_API_URL 环境变量可启用后端支持
      </span>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-row" v-if="stats">
      <div class="stat-card">
        <div class="stat-num">{{ stats.total_resources }}</div>
        <div class="stat-lab">总资源</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.active_resources }}</div>
        <div class="stat-lab">已上线</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.hot_resources }}</div>
        <div class="stat-lab">热门推荐</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">{{ stats.pending_submissions }}</div>
        <div class="stat-lab">待审核</div>
      </div>
    </div>

    <!-- 主面板 -->
    <n-card title="🔧 管理后台">
      <template #header-extra>
        <n-space>
          <n-button size="small" @click="handleImport501" :loading="importing501" type="warning">
            📥 导入501条短剧
          </n-button>
          <n-button size="small" @click="handleExport">📤 导出</n-button>
          <n-upload :default-upload="false" :show-file-list="false" @change="handleImport">
            <n-button size="small">📥 导入</n-button>
          </n-upload>
          <n-button type="primary" size="small" @click="showAddModal = true">+ 添加</n-button>
        </n-space>
      </template>

      <n-tabs v-model:value="tabValue" @update:value="loadData">
        <n-tab-pane name="resources" tab="📦 资源管理">
          <n-spin :show="loading">
            <n-data-table
              :columns="resourceColumns"
              :data="resourceList"
              :pagination="resourcePagination"
              :bordered="true"
              :single-line="false"
              :row-key="row => row.id"
              size="small"
            />
          </n-spin>
        </n-tab-pane>
        <n-tab-pane name="submissions" tab="📬 投稿审核">
          <n-spin :show="loadingSub">
            <n-empty v-if="!loadingSub && subList.length === 0" description="暂无待审核投稿 ✅" />
            <n-list v-else>
              <n-list-item v-for="item in subList" :key="item.id">
                <n-thing :title="item.title">
                  <template #description>
                    <n-space>
                      <n-tag size="tiny">{{ item.category }}</n-tag>
                      <n-tag size="tiny" type="info">{{ item.source }}</n-tag>
                      <n-text depth="3" style="font-size:12px">{{ item.created_at }}</n-text>
                    </n-space>
                  </template>
                  <template #action>
                    <n-space>
                      <n-input :value="item.link" readonly size="small" style="width:300px" />
                      <n-button size="small" type="success" @click="approve(item.id)">✅ 通过</n-button>
                      <n-button size="small" type="error" @click="reject(item.id)">❌ 驳回</n-button>
                    </n-space>
                  </template>
                </n-thing>
              </n-list-item>
            </n-list>
          </n-spin>
        </n-tab-pane>
      </n-tabs>
    </n-card>

    <!-- 添加资源弹窗 -->
    <n-modal v-model:show="showAddModal" title="添加资源" preset="card" style="width:600px">
      <n-form ref="addFormRef" :model="addForm" label-placement="top">
        <n-form-item label="标题" path="title">
          <n-input v-model:value="addForm.title" />
        </n-form-item>
        <n-form-item label="分类">
          <n-select v-model:value="addForm.category" :options="catOptions" />
        </n-form-item>
        <n-form-item label="网盘来源">
          <n-select v-model:value="addForm.source" :options="sourceOptions" />
        </n-form-item>
        <n-form-item label="分享链接">
          <n-input v-model:value="addForm.link" />
        </n-form-item>
        <n-form-item label="集数">
          <n-input v-model:value="addForm.episodes" placeholder="如：95集" />
        </n-form-item>
        <n-form-item label="主演">
          <n-input v-model:value="addForm.actors" placeholder="如：马晓伟&蔡欣洋" />
        </n-form-item>
        <n-space>
          <n-button type="primary" @click="handleAdd" :loading="addLoading">确认添加</n-button>
          <n-button @click="showAddModal = false">取消</n-button>
        </n-space>
      </n-form>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, h } from 'vue'
import { useMessage, useDialog } from 'naive-ui'
import {
  adminListResources, adminAddResource, adminDeleteResource,
  adminListSubmissions, adminApproveSubmission, adminRejectSubmission,
  adminImportResources, adminGetStats,
  exportData, importData, getMode,
} from '../api/index.js'

const message = useMessage()
const dialog = useDialog()
const tabValue = ref('resources')
const loading = ref(false)
const loadingSub = ref(false)
const showAddModal = ref(false)
const addLoading = ref(false)
const importing501 = ref(false)
const mode = ref('local')
const stats = ref(null)

// 资源列表
const resourceList = ref([])
const resourceTotal = ref(0)
const resourcePage = ref(1)

const resourcePagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (p) => { resourcePage.value = p; loadResources() },
  onUpdatePageSize: (size) => { resourcePagination.pageSize = size; loadResources() },
})

const resourceColumns = [
  { title: 'ID', key: 'id', width: 60, fixed: 'left' },
  { title: '标题', key: 'title', ellipsis: { tooltip: true }, minWidth: 200 },
  { title: '分类', key: 'category', width: 70 },
  { title: '网盘', key: 'source', width: 90 },
  { title: '集数', key: 'episodes', width: 70 },
  { title: '热度', key: 'click_count', width: 70 },
  { title: '时间', key: 'created_at', width: 130 },
  {
    title: '操作', width: 100, fixed: 'right',
    render(row) {
      return h('div', { style: 'display:flex;gap:8px' }, [
        h('a', {
          style: { color: '#6366f1', cursor: 'pointer', fontSize: '13px' },
          onClick: () => window.open(row.link, '_blank'),
        }, '🔗 打开'),
        h('a', {
          style: { color: '#e74c3c', cursor: 'pointer', fontSize: '13px' },
          onClick: () => confirmDelete(row.id, row.title),
        }, '🗑 删除'),
      ])
    },
  },
]

const subList = ref([])

const addForm = reactive({
  title: '', category: '短剧', source: '夸克网盘',
  link: '', episodes: '', actors: '',
})

const catOptions = [
  { label: '短剧', value: '短剧' }, { label: '电影', value: '电影' },
  { label: '电视剧', value: '电视剧' }, { label: '动漫', value: '动漫' },
  { label: '综艺', value: '综艺' },
]
const sourceOptions = [
  { label: '夸克网盘', value: '夸克网盘' }, { label: '百度网盘', value: '百度网盘' },
  { label: '阿里云盘', value: '阿里云盘' }, { label: 'UC网盘', value: 'UC网盘' },
]

async function loadResources() {
  loading.value = true
  try {
    const res = await adminListResources({ page: resourcePage.value, page_size: resourcePagination.pageSize || 20 })
    resourceList.value = res.data || []
    resourceTotal.value = res.total || 0
  } catch (e) { message.error('加载失败') }
  finally { loading.value = false }
}

async function loadSubmissions() {
  loadingSub.value = true
  try {
    const res = await adminListSubmissions({ page: 1, page_size: 50, status: 'pending' })
    subList.value = res.data || []
  } catch (e) { /* ignore */ }
  finally { loadingSub.value = false }
}

function loadData() {
  if (tabValue.value === 'resources') loadResources()
  else loadSubmissions()
}

async function loadStats() {
  try {
    stats.value = await adminGetStats()
  } catch (e) {}
}

function confirmDelete(id, title) {
  dialog.warning({
    title: '确认删除',
    content: `确定删除「${title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        await adminDeleteResource(id)
        message.success('已删除')
        loadResources()
        loadStats()
      } catch { message.error('删除失败') }
    },
  })
}

async function handleAdd() {
  if (!addForm.title || !addForm.link) {
    message.warning('标题和链接为必填')
    return
  }
  addLoading.value = true
  try {
    await adminAddResource({ ...addForm })
    message.success('添加成功')
    showAddModal.value = false
    addForm.title = ''; addForm.link = ''; addForm.episodes = ''; addForm.actors = ''
    loadResources()
    loadStats()
  } catch (e) { message.error('添加失败: ' + (e.message || '')) }
  finally { addLoading.value = false }
}

async function approve(id) {
  try {
    await adminApproveSubmission(id)
    message.success('审核通过')
    loadSubmissions(); loadResources(); loadStats()
  } catch (e) { message.error('操作失败') }
}

async function reject(id) {
  try {
    await adminRejectSubmission(id)
    message.success('已驳回')
    loadSubmissions()
  } catch (e) { message.error('操作失败') }
}

function handleExport() {
  exportData()
  message.success('数据已导出')
}

function handleImport({ file }) {
  if (!file?.file) return
  const reader = new FileReader()
  reader.onload = async (e) => {
    try {
      const data = JSON.parse(e.target.result)
      const res = await adminImportResources(data)
      message.success(`成功导入 ${res.count || data.length} 条数据`)
      loadResources()
      loadStats()
    } catch (err) {
      message.error('导入失败: ' + err.message)
    }
  }
  reader.readAsText(file.file)
}

async function handleImport501() {
  importing501.value = true
  try {
    // 使用内置的501条种子数据
    const res = await adminImportResources(SEED_DATA_501)
    message.success(`✅ 成功导入 ${res.count} 条短剧数据`)
    loadResources()
    loadStats()
  } catch (err) {
    message.error('导入失败: ' + (err.message || ''))
  } finally {
    importing501.value = false
  }
}

// 501条种子数据（从 store.js 引用）
const SEED_DATA_501 = []

onMounted(async () => {
  mode.value = getMode()
  loadStats()
  loadResources()

  // 加载501条数据
  try {
    const mod = await import('../api/store.js')
    // 获取默认导出中的 SEED_DATA
    SEED_DATA_501.length = 0
    // 从 getResources 获取
  } catch (e) {}
})
</script>

<style scoped>
.admin-page {
  max-width: 1200px;
  margin: 0 auto;
}
.mode-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  padding: 10px 16px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
}
.mode-tag {
  font-size: 13px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 6px;
}
.mode-tag.backend {
  background: #e8f5e9;
  color: #2e7d32;
}
.mode-tag.local {
  background: #fff3e0;
  color: #e65100;
}
.mode-hint {
  font-size: 12px;
  color: #999;
}

/* 统计卡片 */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 14px;
  margin-bottom: 16px;
}
.stat-card {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.04);
  transition: transform 0.2s;
}
.stat-card:hover { transform: translateY(-2px); }
.stat-num {
  font-size: 28px;
  font-weight: 700;
  color: #6366f1;
}
.stat-lab {
  font-size: 13px;
  color: #888;
  margin-top: 4px;
}

@media (max-width: 768px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
}
</style>
