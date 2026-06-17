import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

export function searchResources(params) {
  return api.get('/search', { params }).then(r => r.data)
}

export function getDetail(id) {
  return api.get(`/detail/${id}`).then(r => r.data)
}

export function getCategories() {
  return api.get('/categories').then(r => r.data)
}

export function getHot(limit = 12) {
  return api.get('/hot', { params: { limit } }).then(r => r.data)
}

export function getLatest(limit = 20) {
  return api.get('/latest', { params: { limit } }).then(r => r.data)
}

export function submitResource(data) {
  return api.post('/submit', data).then(r => r.data)
}

// 管理后台
export function adminListResources(params) {
  return api.get('/admin/resources', { params }).then(r => r.data)
}

export function adminAddResource(data) {
  return api.post('/admin/resources', data).then(r => r.data)
}

export function adminUpdateResource(id, data) {
  return api.put(`/admin/resources/${id}`, data).then(r => r.data)
}

export function adminDeleteResource(id) {
  return api.delete(`/admin/resources/${id}`).then(r => r.data)
}

export function adminListSubmissions(params) {
  return api.get('/admin/submissions', { params }).then(r => r.data)
}

export function adminApproveSubmission(id) {
  return api.post(`/admin/submissions/${id}/approve`).then(r => r.data)
}

export function adminRejectSubmission(id) {
  return api.post(`/admin/submissions/${id}/reject`).then(r => r.data)
}
