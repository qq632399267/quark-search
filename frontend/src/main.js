import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import naive from 'naive-ui'
import App from './App.vue'

import HomePage from './pages/HomePage.vue'
import SearchPage from './pages/SearchPage.vue'
import DetailPage from './pages/DetailPage.vue'
import SubmitPage from './pages/SubmitPage.vue'
import AdminPage from './pages/AdminPage.vue'
import FavoritesPage from './pages/FavoritesPage.vue'
import CollectionsPage from './pages/CollectionsPage.vue'

const routes = [
  { path: '/', component: HomePage },
  { path: '/s/:keyword', component: SearchPage, props: true },
  { path: '/d/:id(\\d+)', component: DetailPage, props: true },
  { path: '/submit', component: SubmitPage },
  { path: '/admin', component: AdminPage },
  { path: '/favorites', component: FavoritesPage },
  { path: '/collections', component: CollectionsPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

const app = createApp(App)
app.use(router)
app.use(naive)
app.mount('#app')
