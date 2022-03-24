import { useEffect, useState } from 'react'
import { req } from '../../../../utils/Fetcher'

export function useSearch(search?: string) {
  const [results, setResults] = useState<any[]>()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    req.post('/databases/search', { query: search || '' })
      .then(({ data }) => {
        setResults(data?.results ?? [])
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [search])

  return { results, loading }
}