<template>
  <div class="submit-page" style="max-width:600px;margin:0 auto">
    <n-card title="📤 提交资源">
      <n-form ref="formRef" :model="form" :rules="rules" label-placement="top">
        <n-form-item label="资源名称" path="title">
          <n-input v-model:value="form.title" placeholder="例：回到70年代霸道婆婆带我飞" />
        </n-form-item>

        <n-form-item label="资源分类" path="category">
          <n-select v-model:value="form.category" :options="categoryOptions" />
        </n-form-item>

        <n-form-item label="网盘来源" path="source">
          <n-select v-model:value="form.source" :options="sourceOptions" />
        </n-form-item>

        <n-form-item label="网盘分享链接" path="link">
          <n-input v-model:value="form.link" placeholder="https://pan.quark.cn/s/xxx" />
        </n-form-item>

        <n-form-item label="资源描述（可选）">
          <n-input v-model:value="form.description" type="textarea" :rows="3"
            placeholder="简单描述一下这个资源" />
        </n-form-item>

        <n-form-item label="联系方式（可选）">
          <n-input v-model:value="form.contact" placeholder="微信号/邮箱，方便我们联系你" />
        </n-form-item>

        <n-button type="primary" block size="large" @click="handleSubmit" :loading="submitting">
          提交审核
        </n-button>
      </n-form>

      <n-alert type="info" :bordered="false" style="margin-top:16px">
        <template #header>提交须知</template>
        <ul style="padding-left:20px;font-size:13px">
          <li>提交后需要管理员审核通过后才会展示</li>
          <li>请确保链接真实有效，避免垃圾信息</li>
          <li>链接有效期通常较短，建议审核通过后及时更新</li>
        </ul>
      </n-alert>
    </n-card>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { submitResource } from '../api/index.js'

const message = useMessage()
const formRef = ref(null)
const submitting = ref(false)

const form = reactive({
  title: '',
  category: '短剧',
  source: '夸克网盘',
  link: '',
  description: '',
  contact: '',
})

const rules = {
  title: { required: true, message: '请输入资源名称', trigger: 'blur' },
  link: { required: true, message: '请输入网盘分享链接', trigger: 'blur' },
}

const categoryOptions = [
  { label: '🎭 短剧', value: '短剧' },
  { label: '🎬 电影', value: '电影' },
  { label: '📺 电视剧', value: '电视剧' },
  { label: '🎨 动漫', value: '动漫' },
  { label: '🎤 综艺', value: '综艺' },
]

const sourceOptions = [
  { label: '夸克网盘', value: '夸克网盘' },
  { label: '百度网盘', value: '百度网盘' },
  { label: '阿里云盘', value: '阿里云盘' },
  { label: 'UC网盘', value: 'UC网盘' },
]

async function handleSubmit() {
  try {
    await formRef.value?.validate()
  } catch {
    message.warning('请完善表单信息')
    return
  }

  submitting.value = true
  try {
    await submitResource({ ...form })
    message.success('提交成功，等待管理员审核！')
    form.title = ''
    form.link = ''
    form.description = ''
    form.contact = ''
  } catch (e) {
    message.error(e.response?.data?.detail || '提交失败，请重试')
  } finally {
    submitting.value = false
  }
}
</script>
