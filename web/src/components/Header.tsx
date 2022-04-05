import { MenuOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { FC } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLogin } from '../hooks/useLogin'
import { ReactComponent as Notion } from '../notion.svg'
import { req } from '../utils/Fetcher'

const Header: FC = () => {
  const navigate = useNavigate()
  const { user, url } = useLogin()

  const logout = () => {
    req.post('/auth/logout')
    window.location.reload()
  }

  return <Layout.Header style={{ background: '#ffffff', padding: '0 20px' }}>
    <div key="logo" className="logo" style={{ marginRight: '30px' }}>
      <Link to="/" style={{ color: '#000' }}>
        <img src="/logo512.png" style={{ height: '24px' }} /> Suvanosa
      </Link>
    </div>
    <Menu overflowedIndicator={<MenuOutlined />} mode="horizontal" triggerSubMenuAction="click" theme="light" defaultSelectedKeys={[location.pathname.replace(/^\//, '')]}
      style={{ background: '#ffffff', position: 'relative', display: 'flex', justifyContent: 'right' }}>
      <Menu.Item
        onClick={() => navigate(user ? '/dashboard' : '/')}
        key={user ? 'dashboard' : ''}>
        {user ? 'Dashboard' : 'Home'}
      </Menu.Item>
      <Menu.Item key="action-right" style={{ float: 'right' }} onClick={user ? logout : () => window.open(url, '_self')} danger={user}>
        {user ? 'Logout' : <>
          <Notion style={{ width: '25px', height: 'auto', marginBottom: '-6px' }} /> Login with Notion
        </> }
      </Menu.Item>
    </Menu>
  </Layout.Header>
}

export default Header