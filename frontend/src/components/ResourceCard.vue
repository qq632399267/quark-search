<template>
  <div class="resource-card" @click="$router.push(`/d/${item.id}`)">
    <!-- 海报区 -->
    <div class="poster-wrap">
      <img
        :src="posterUrl"
        :alt="item.title"
        class="poster-img"
        loading="lazy"
      />
      <div class="poster-overlay">
        <div class="play-icon">▶</div>
      </div>
      <!-- 分类标签 -->
      <div class="category-tag" :style="{ background: categoryColor }">
        {{ item.category }}
      </div>
      <!-- 热度 -->
      <div v-if="item.click_count > 0" class="hot-badge">
        🔥 {{ formatCount(item.click_count) }}
      </div>
      <!-- 集数 -->
      <div v-if="item.episodes" class="episode-badge">
        {{ item.episodes }}
      </div>
    </div>
    <!-- 信息区 -->
    <div class="info-area">
      <div class="card-title">{{ item.title }}</div>
      <div class="card-meta">
        <span class="meta-source">{{ item.source }}</span>
        <span v-if="item.actors" class="meta-actors">{{ item.actors }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { generatePoster, getHotColor } from '../utils/poster.js'

const props = defineProps({
  item: { type: Object, required: true },
})

const CATEGORY_COLORS = {
  '短剧': '#e74c3c',
  '电影': '#3498db',
  '电视剧': '#2ecc71',
  '动漫': '#f39c12',
  '综艺': '#9b59b6',
}

const posterUrl = computed(() => generatePoster(props.item.title))
const categoryColor = computed(() => CATEGORY_COLORS[props.item.category] || '#6366f1')

function formatCount(n) {
  if (n >= 10000) return (n / 10000).toFixed(1) + 'w'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return n
}
</script>

<style scoped>
.resource-card {
  border-radius: 10px;
  overflow: hidden;
  background: #fff;
  cursor: pointer;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06);
}
.resource-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 12px 28px rgba(0,0,0,0.12);
}

/* 海报区 */
.poster-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #f0f0f0;
}
.poster-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.poster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.25s ease;
}
.resource-card:hover .poster-overlay {
  background: rgba(0,0,0,0.35);
}
.play-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255,255,255,0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: #333;
  opacity: 0;
  transform: scale(0.7);
  transition: all 0.25s ease;
}
.resource-card:hover .play-icon {
  opacity: 1;
  transform: scale(1);
}

/* 标签 */
.category-tag {
  position: absolute;
  top: 8px;
  left: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  color: #fff;
  line-height: 1.6;
}
.hot-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 600;
  background: rgba(255,71,87,0.85);
  color: #fff;
  line-height: 1.6;
}
.episode-badge {
  position: absolute;
  bottom: 8px;
  right: 8px;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: rgba(0,0,0,0.6);
  color: #fff;
  line-height: 1.6;
}

/* 信息区 */
.info-area {
  padding: 10px 12px 12px;
}
.card-title {
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  word-break: break-all;
}
.card-meta {
  margin-top: 6px;
  font-size: 12px;
  color: #888;
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.meta-source {
  padding: 1px 6px;
  border-radius: 3px;
  background: #f0f0f5;
  color: #666;
  font-size: 11px;
}
.meta-actors {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 100%;
}
</style>
