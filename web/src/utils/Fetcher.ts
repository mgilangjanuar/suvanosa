import axios from 'axios'
import { RETRY_COUNT } from './Constant'

export const apiUrl = `${process.env.REACT_APP_API_BASE_URL || ''}/v1`

export const req = axios.create({
  baseURL: apiUrl,
  withCredentials: true
})

req.interceptors.response.use(response => response, async error => {
  if (!error.response) {
    throw error
  }

  const { config, response: { status, data } } = error
  if (status === 401) {
    try {
      await req.post('/auth/refreshToken')
    } catch (_) {
      throw error
    }
    return await req(config)
  } else if (status === 429) {
    await new Promise(res => setTimeout(res, data.retryAfter || 1000))
    return await req(config)
  } else if (status > 500) {
    config.headers = {
      ...config?.headers || {},
      'x-retry-count': config.headers['x-retry-count'] || 0   // assign default to 0
    }
    if (config.headers['x-retry-count'] < RETRY_COUNT) {
      await new Promise(res => setTimeout(res, ++config.headers['x-retry-count'] * 3000))
      return await req(config)
    }
  }
  throw error
})

export const fetcher = async (url: string, authorization?: string): Promise<any> => {
  const fetch = async () => {
    const { data } = await req.get(url, {
      ...authorization ? { headers: { authorization: `Bearer ${authorization}` } } : {},
      withCredentials: true })
    return data
  }

  try {
    return await fetch()
  } catch ({ response }) {
    throw response
  }
}