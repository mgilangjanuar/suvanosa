import { Layout, notification, Spin, Typography } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { req } from '../utils/Fetcher'

const Auth: FC = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const code = searchParams.get('code')
    if (code) {
      setTimeout(() => {
        req.post('/auth/token', { code })
          .then(({ data }) => {
            notification.success({ message: `Welcome, ${data.user.email}!` })
            navigate('/dashboard')
          })
          .catch(() => {
            notification.error({ message: 'Whoops!', description: 'Something went wrong. Please reload and try again 🙏' })
          })
      }, 1000)
    }
  }, [searchParams])

  return <Layout.Content className="container">
    <Layout.Content style={{ textAlign: 'center', marginTop: '20vh' }}>
      <Typography.Paragraph>
        <Spin />
      </Typography.Paragraph>
      <Typography.Paragraph>
        Preparing something awesome for you...
      </Typography.Paragraph>
    </Layout.Content>
  </Layout.Content>
}

export default Auth