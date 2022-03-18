import { MenuOutlined } from '@ant-design/icons'
import { Button, Layout, Menu } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher, req } from '../utils/Fetcher'

const Header: FC = () => {
  const navigate = useNavigate()
  const { data, error } = useSWR('/users/me', fetcher)
  const { data: respUrl } = useSWR(error ? '/auth/url' : null, fetcher)

  const logout = () => {
    req.post('/auth/logout')
    window.location.reload()
  }

  return <Layout.Header style={{ background: '#ffffff', padding: '0 20px' }}>
    <Menu overflowedIndicator={<MenuOutlined />} mode="horizontal" triggerSubMenuAction="click" theme="light" defaultSelectedKeys={[location.pathname.replace(/^\//, '')]}
      style={{ background: '#ffffff', position: 'relative', display: 'flex', justifyContent: 'right' }}>
      <Menu.Item onClick={() => navigate('/')} key="">Home</Menu.Item>
      <Menu.Item key="action-right" style={{ float: 'right' }}>
        {data?.user ? <Button danger onClick={logout}>Logout</Button> : <Button href={respUrl?.url}>Dashboard</Button> }
      </Menu.Item>
    </Menu>
  </Layout.Header>
}

export default Header