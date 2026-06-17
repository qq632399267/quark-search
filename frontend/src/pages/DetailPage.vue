<template>
  <div class="detail-page">
    <n-spin :show="loading">
      <n-empty v-if="!loading && !resource" description="资源不存在" />
      <template v-else-if="resource">
        <!-- 返回 -->
        <n-button quaternary @click="$router.back()" size="small" style="margin-bottom:16px">
          ← 返回
        </n-button>

        <n-card>
          <n-thing :title="resource.title">
            <template #description>
              <n-space style="margin-top:8px">
                <n-tag :bordered="false">{{ resource.category }}</n-tag>
                <n-tag :bordered="false" type="info">{{ resource.source }}</n-tag>
                <n-tag v-if="resource.episodes" :bordered="false" type="success">{{ resource.episodes }}</n-tag>
              </n-space>
              <div v-if="resource.actors" style="margin-top:8px">
                <n-text depth="3">主演：{{ resource.actors }}</n-text>
              </div>
            </template>
          </n-thing>

          <n-divider />

          <!-- 资源地址 -->
          <n-alert type="warning" :bordered="false" style="margin-bottom:16px">
            <template #header>⚠️ 链接可能有时效，请尽快保存到网盘</template>
          </n-alert>

          <div class="link-box">
            <n-text strong>网盘地址：</n-text>
            <div class="link-row">
              <n-input :value="resource.link" readonly size="large" style="flex:1">
                <template #suffix>
                  <n-button type="primary" @click="copyLink">复制链接</n-button>
                </template>
              </n-input>
            </div>
            <div style="margin-top:12px">
              <n-button type="primary" size="large" @click="openLink" tag="a" :href="resource.link" target="_blank">
                🚀 立即前往网盘保存
              </n-button>
            </div>
          </div>

          <n-divider />
          <n-text depth="3" style="font-size:12px">
            收录时间：{{ resource.created_at }} &nbsp;|&nbsp; 浏览 {{ resource.click_count || 0 }} 次
          </n-text>
        </n-card>

        <!-- 资源描述 -->
        <n-card v-if="resource.description" style="margin-top:16px" title="资源描述">
          <n-text>{{ resource.description }}</n-text>
        </n-card>
      </template>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getDetail } from '../api/index.js'

const props = defineProps({ id: String })
const route = useRoute()
const message = useMessage()
const resource = ref(null)
const loading = ref(true)

async function loadDetail() {
  loading.value = true
  try {
    const res = await getDetail(props.id || route.params.id)
    resource.value = res.data
  } catch (e) {
    resource.value = null
  } finally {
    loading.value = false
  }
}

function copyLink() {
  if (resource.value?.link) {
    navigator.clipboard.writeText(resource.value.link).then(() => {
      message.success('链接已复制，快去网盘保存吧！')
    }).catch(() => {
      message.warning('复制失败，请手动选择链接复制')
    })
  }
}

function openLink() {
  if (resource.value?.link) {
    window.open(resource.value.link, '_blank')
  }
}

onMounted(loadDetail)
</script>

<style scoped>
.link-box { background: #f8f8f8; padding: 20px; border-radius: 12px; }
.link-row { display: flex; gap: 8px; margin-top: 8px; }
</style>
