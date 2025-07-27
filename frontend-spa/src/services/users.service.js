import { efetch } from './efetch'
import  authService from './auth.service'

const BASE_URL = 'http://localhost:3000/api/users'

export default {
  async getAll(params = {}) {
    try {
      const query = new URLSearchParams(params).toString()
      const url = query ? `${BASE_URL}?${query}` : BASE_URL
      const data = await efetch(url, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      })
      console.log('Users fetched:', data)
      return data
    } catch (e) {
      console.error('fetch users failed:', e)
      throw e
    }
  },

  async getById(id) {
    try {
      return await efetch(`${BASE_URL}/${id}`, {
        method: 'GET',
        headers: authService.getAuthHeaders(),
      })
    } catch (e) {
      console.error(`fetch user ${id} failed:`, e)
      throw e
    }
  },

  async create(payload) {
    try {
      const body =
        payload instanceof FormData
          ? payload
          : Object.keys(payload).reduce((fd, k) => {
              if (payload[k] != null) fd.append(k, payload[k])
              return fd
            }, new FormData())

      const headers = authService.getAuthHeaders()
      if (body instanceof FormData) {
        delete headers['Content-Type']
      }

      const data = await efetch(BASE_URL, {
        method: 'POST',
        body,
        headers,
      })
      console.log('User created:', data)
      return data
    } catch (e) {
      console.error('create user failed:', e)
      throw e
    }
  },

  async update(id, payload) {
    try {
      const body =
        payload instanceof FormData
          ? payload
          : Object.keys(payload).reduce((fd, k) => {
              if (payload[k] != null) fd.append(k, payload[k])
              return fd
            }, new FormData())

      const headers = authService.getAuthHeaders()
      if (body instanceof FormData) {
        delete headers['Content-Type']
      }

      const data = await efetch(`${BASE_URL}/${id}`, {
        method: 'PUT',
        body,
        headers,
      })
      console.log('User updated:', data)
      return data
    } catch (e) {
      console.error(`update user ${id} failed:`, e)
      throw e
    }
  },

  async delete(id) {
    try {
      const data = await efetch(`${BASE_URL}/${id}`, {
        method: 'DELETE',
        headers: authService.getAuthHeaders(),
      })
      console.log('User deleted:', data)
      return data
    } catch (e) {
      console.error(`delete user ${id} failed:`, e)
      throw e
    }
  },
}
