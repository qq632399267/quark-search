<template>
  <div class="detail-page">
    <n-spin :show="loading">
      <n-empty v-if="!loading && !resource" description="资源不存在 😅" />
      <template v-else-if="resource">
        <!-- 返回 -->
        <button class="back-btn" @click="$router.back()">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M19 12H5m7-7l-7 7 7 7"/></svg>
          返回
        </button>

        <!-- 主内容区 -->
        <div class="detail-layout">
          <!-- 左侧：海报 -->
          <div class="detail-poster">
            <div class="poster-sticky">
              <img :src="posterUrl" :alt="resource.title" class="poster-img" />
              <div class="poster-actions">
                <n-button type="primary" size="large" block @click="openLink">
                  🚀 去网盘保存
                </n-button>
                <n-button size="large" block @click="copyLink" style="margin-top:8px">
                  📋 复制链接
                </n-button>
              </div>
            </div>
          </div>

          <!-- 右侧：信息 -->
          <div class="detail-info">
            <div class="info-header">
              <h1 class="info-title">{{ resource.title }}</h1>
              <div class="info-tags">
                <span class="tag tag-cat">{{ resource.category }}</span>
                <span class="tag tag-source">{{ resource.source }}</span>
                <span v-if="resource.episodes" class="tag tag-ep">{{ resource.episodes }}</span>
                <span v-if="resource.is_hot" class="tag tag-hot">🔥 热门</span>
              </div>
            </div>

            <div class="info-stats">
              <div class="stat-item">
                <span class="stat-value">{{ resource.click_count || 0 }}</span>
                <span class="stat-label">浏览</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ resource.created_at }}</span>
                <span class="stat-label">收录日期</span>
              </div>
              <div class="stat-item">
                <span class="stat-value">{{ resource.id }}</span>
                <span class="stat-label">编号</span>
              </div>
            </div>

            <!-- 演员 -->
            <div v-if="resource.actors" class="info-section">
              <h3 class="info-section-title">🎭 主演</h3>
              <p class="info-section-text">{{ resource.actors }}</p>
            </div>

            <!-- 描述 -->
            <div v-if="resource.description" class="info-section">
              <h3 class="info-section-title">📝 简介</h3>
              <p class="info-section-text">{{ resource.description }}</p>
            </div>

            <!-- 链接 -->
            <div class="info-section">
              <h3 class="info-section-title">🔗 网盘链接</h3>
              <div class="link-box">
                <div class="link-url">{{ resource.link }}</div>
                <div class="link-actions">
                  <n-button size="small" @click="copyLink">复制</n-button>
                  <n-button size="small" type="primary" @click="openLink">打开</n-button>
                </div>
              </div>
              <div class="link-tip">
                ⚠️ 链接可能有时效，请尽快保存到你的夸克网盘
              </div>
            </div>
          </div>
        </div>
      </template>
    </n-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'
import { getDetail } from '../api/index.js'
import { generatePoster } from '../utils/poster.js'

const props = defineProps({ id: String })
const route = useRoute()
const message = useMessage()
const resource = ref(null)
const loading = ref(true)

const posterUrl = computed(() => resource.value ? generatePoster(resource.value.title, 400, 560) : '')

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
.detail-page { padding-bottom: 40px; }

/* 返回按钮 */
.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 14px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fff;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 20px;
}
.back-btn:hover {
  border-color: #6366f1;
  color: #6366f1;
}

/* 主布局 */
.detail-layout {
  display: flex;
  gap: 28px;
  align-items: flex-start;
}

/* 左侧海报 */
.detail-poster {
  flex-shrink: 0;
  width: 320px;
}
.poster-sticky {
  position: sticky;
  top: 76px;
}
.poster-img {
  width: 100%;
  border-radius: 14px;
  box-shadow: 0 4px 20px rgba(0,0,0,0.12);
  display: block;
}
.poster-actions {
  margin-top: 16px;
}

/* 右侧信息 */
.detail-info {
  flex: 1;
  min-width: 0;
}

/* 标题区 */
.info-header {
  margin-bottom: 20px;
}
.info-title {
  font-size: 26px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
  margin-bottom: 12px;
}
.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag {
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
}
.tag-cat { background: #f0f0ff; color: #6366f1; }
.tag-source { background: #e8f5e9; color: #2e7d32; }
.tag-ep { background: #fff3e0; color: #e65100; }
.tag-hot { background: #ffebee; color: #c62828; }

/* 统计 */
.info-stats {
  display: flex;
  gap: 24px;
  padding: 16px 20px;
  background: #f8f9fa;
  border-radius: 12px;
  margin-bottom: 24px;
}
.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.stat-value {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
}
.stat-label {
  font-size: 12px;
  color: #999;
}

/* 信息章节 */
.info-section {
  margin-bottom: 20px;
}
.info-section-title {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
}
.info-section-text {
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

/* 链接框 */
.link-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 14px 16px;
  background: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #eee;
}
.link-url {
  flex: 1;
  font-size: 14px;
  color: #333;
  word-break: break-all;
  font-family: monospace;
}
.link-actions {
  display: flex;
  gap: 6px;
  flex-shrink: 0;
}
.link-tip {
  margin-top: 10px;
  font-size: 12px;
  color: #e67e22;
  background: #fff8e6;
  padding: 8px 14px;
  border-radius: 8px;
}

/* 响应式 */
@media (max-width: 768px) {
  .detail-layout {
    flex-direction: column;
  }
  .detail-poster {
    width: 100%;
    max-width: 280px;
    margin: 0 auto;
  }
  .poster-sticky {
    position: static;
  }
  .info-title {
    font-size: 22px;
  }
  .info-stats {
    flex-wrap: wrap;
    gap: 16px;
  }
  .link-box {
    flex-direction: column;
    align-items: stretch;
  }
  .link-actions {
    justify-content: flex-end;
  }
}
</style>
