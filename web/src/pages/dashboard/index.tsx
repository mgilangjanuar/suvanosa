import { Layout } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { req } from '../../utils/Fetcher'

const Dashboard: FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    req.get('/users/me')
      .catch(() => navigate('/'))
  }, [])

  return <Layout.Content className="container">
  </Layout.Content>
}

export default Dashboard