import useSWR from 'swr'
import { fetcher } from '../utils/Fetcher'

export function useLogin(): { user?: any, url?: string } {
  const { data, error } = useSWR('/users/me', fetcher)
  const { data: respUrl } = useSWR(error ? '/auth/url' : null, fetcher)

  return {
    user: data?.user,
    url: respUrl?.url,
  }
}