import { MenuOutlined } from '@ant-design/icons'
import { Button, Layout, Menu } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { req } from '../utils/Fetcher'

const Header: FC = () => {
  const navigate = useNavigate()
  const { user, url } = useLogin()

  const logout = () => {
    req.post('/auth/logout')
    window.location.reload()
  }

  return <Layout.Header style={{ background: '#ffffff', padding: '0 20px' }}>
    <Menu overflowedIndicator={<MenuOutlined />} mode="horizontal" triggerSubMenuAction="click" theme="light" defaultSelectedKeys={[location.pathname.replace(/^\//, '')]}
      style={{ background: '#ffffff', position: 'relative', display: 'flex', justifyContent: 'right' }}>
      <Menu.Item onClick={() => navigate('/')} key="">Home</Menu.Item>
      <Menu.Item key="action-right" style={{ float: 'right' }}>
        {user ? <Button danger onClick={logout}>Logout</Button> : <Button href={url}>Login</Button> }
      </Menu.Item>
    </Menu>
  </Layout.Header>
}

export default Header