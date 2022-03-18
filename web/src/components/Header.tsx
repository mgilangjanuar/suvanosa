import { MenuOutlined } from '@ant-design/icons'
import { Layout, Menu } from 'antd'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

const Header: FC = () => {
  const navigate = useNavigate()

  return <Layout.Header style={{ background: '#ffffff', padding: '0 20px' }}>
    <Menu overflowedIndicator={<MenuOutlined />} mode="horizontal" triggerSubMenuAction="click" theme="light" defaultSelectedKeys={[location.pathname.replace(/^\//, '')]}
      style={{ background: '#ffffff', position: 'relative', display: 'flex' }}>
      <Menu.Item onClick={() => navigate('/')} key="">Home</Menu.Item>
    </Menu>
  </Layout.Header>
}

export default Header