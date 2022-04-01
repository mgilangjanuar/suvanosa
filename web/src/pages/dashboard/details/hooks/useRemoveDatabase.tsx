import { useState } from 'react'
import { req } from '../../../../utils/Fetcher'

export function useRemoveDatabase() {
  const [loading, setLoading] = useState<boolean>(false)

  return { remove: async (id: string, done?: () => void) => {
    setLoading(true)
    try {
      await req.delete(`/databases/${id}`)
      done?.()
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }, loading }
}