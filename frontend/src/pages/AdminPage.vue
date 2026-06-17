<template>
  <div class="admin-page">
    <n-card title="🔧 管理后台">
      <template #header-extra>
        <n-button type="primary" size="small" @click="showAddModal = true">+ 添加资源</n-button>
      </template>

      <n-tabs v-model:value="tabValue" @update:value="loadData">
        <n-tab-pane name="resources" tab="资源管理">
          <n-spin :show="loading">
            <n-data-table
              :columns="resourceColumns"
              :data="resourceList"
              :pagination="resourcePagination"
              :bordered="true"
              :single-line="false"
            />
          </n-spin>
        </n-tab-pane>
        <n-tab-pane name="submissions" tab="投稿审核">
          <n-spin :show="loadingSub">
            <n-empty v-if="!loadingSub && subList.length === 0" description="暂无待审核投稿" />
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
                      <n-button size="small" type="success" @click="approve(item.id)">通过</n-button>
                      <n-button size="small" type="error" @click="reject(item.id)">驳回</n-button>
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
} from '../api/index.js'

const message = useMessage()
const dialog = useDialog()
const tabValue = ref('resources')
const loading = ref(false)
const loadingSub = ref(false)
const showAddModal = ref(false)
const addLoading = ref(false)

// 资源列表
const resourceList = ref([])
const resourceTotal = ref(0)
const resourcePage = ref(1)

const resourcePagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: false,
  onChange: (p) => { resourcePage.value = p; loadResources() },
})

const resourceColumns = [
  { title: 'ID', key: 'id', width: 60, fixed: 'left' },
  { title: '标题', key: 'title', ellipsis: { tooltip: true } },
  { title: '分类', key: 'category', width: 80 },
  { title: '网盘', key: 'source', width: 100 },
  { title: '状态', key: 'status', width: 80 },
  { title: '时间', key: 'created_at', width: 140 },
  {
    title: '操作', width: 100,
    render(row) {
      return h('div', [
        h('a', {
          style: { color: '#e74c3c', cursor: 'pointer', fontSize: '13px' },
          onClick: () => confirmDelete(row.id, row.title),
        }, '删除'),
      ])
    },
  },
]

// 投稿列表
const subList = ref([])

// 添加表单
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
    const res = await adminListResources({ page: resourcePage.value, page_size: 20 })
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
  } catch { message.error('添加失败') }
  finally { addLoading.value = false }
}

async function approve(id) {
  try {
    await adminApproveSubmission(id)
    message.success('审核通过')
    loadSubmissions(); loadResources()
  } catch { message.error('操作失败') }
}

async function reject(id) {
  try {
    await adminRejectSubmission(id)
    message.success('已驳回')
    loadSubmissions()
  } catch { message.error('操作失败') }
}

onMounted(loadResources)
</script>
