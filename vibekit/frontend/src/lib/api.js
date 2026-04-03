import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

api.interceptors.response.use(
  (res) => res.data,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true
      try {
        await axios.post('/api/auth/refresh', {}, { withCredentials: true })
        return api.request(err.config)
      } catch {
        if (window.location.pathname.startsWith('/app')) window.location.href = '/login'
      }
    }
    return Promise.reject(err.response?.data?.error || err)
  }
)

export const authApi = {
  signup: (d) => api.post('/auth/signup', d),
  login:  (d) => api.post('/auth/login',  d),
  logout: ()  => api.post('/auth/logout'),
  me:     ()  => api.get('/auth/me'),
}

export const pagesApi = {
  list:      (p) => api.get('/pages', { params: p }),
  create:    (d) => api.post('/pages', d),
  get:       (id)    => api.get(`/pages/${id}`),
  update:    (id, d) => api.put(`/pages/${id}`, d),
  delete:    (id)    => api.delete(`/pages/${id}`),
  publish:   (id)    => api.post(`/pages/${id}/publish`),
  unpublish: (id)    => api.post(`/pages/${id}/unpublish`),
  duplicate: (id)    => api.post(`/pages/${id}/duplicate`),
  contacts:  (id, p) => api.get(`/pages/${id}/contacts`, { params: p }),
  analytics: (id, p) => api.get(`/pages/${id}/analytics`, { params: p }),
  slugCheck: (slug, excludeId) => api.get('/pages/slug-check', { params: { slug, excludeId } }),
}

export const publicApi = {
  getPage:   (slug) => api.get(`/public/pages/${slug}`),
  trackView: (slug) => api.post(`/public/pages/${slug}/view`),
  contact:   (slug, d) => api.post(`/public/pages/${slug}/contact`, d),
}

export default api
