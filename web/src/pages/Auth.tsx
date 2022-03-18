import { notification } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { req } from '../utils/Fetcher'

const Auth: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      req.post('/auth/token', { code })
        .then(({ data }) => {
          notification.success({ message: `Welcome, ${data.user.email}!` })
          navigate('/dashboard')
        })
        .catch(() => {
          notification.error({ message: 'Whoops!', description: 'Something went wrong. Please reload and try again 🙏' })
        })
    }
  }, [searchParams])

  return <></>
}

export default Auth