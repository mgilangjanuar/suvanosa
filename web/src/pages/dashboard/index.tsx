import { Button, Layout } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher, req } from '../../utils/Fetcher'

const Dashboard: FC = () => {
  const navigate = useNavigate()
  const { error } = useSWR('/users/me', fetcher)

  useEffect(() => {
    if (error) {
      navigate('/')
    }
  }, [error])

  const logout = () => {
    req.post('/auth/logout')
    window.location.reload()
  }

  return <Layout.Content>
    <Button danger onClick={logout}>Logout</Button>
  </Layout.Content>
}

export default Dashboard