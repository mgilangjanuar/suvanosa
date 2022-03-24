import { DatabaseOutlined, LinkOutlined } from '@ant-design/icons'
import { Col, Layout, Menu, Row } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { req } from '../../utils/Fetcher'
import Forms from './forms'
import Connect from './connect'
import Database from './database'

const Dashboard: FC = () => {
  const params = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    req.get('/users/me')
      .then(() => {
        if (!params.page) {
          return navigate('/dashboard/database')
        }
      })
      .catch(() => navigate('/'))
  }, [])

  return <Layout>
    <Layout.Sider width={200} theme="light" breakpoint="lg" collapsedWidth="50" trigger={null} collapsible>
      <Menu mode="inline" defaultSelectedKeys={[params.page || 'database']} style={{ height: '100vh' }}>
        <Menu.Item key="database" icon={<DatabaseOutlined />}
          onClick={() => navigate('/dashboard/database')}>My Database</Menu.Item>
        <Menu.Item key="connect" icon={<LinkOutlined />}
          onClick={() => navigate('/dashboard/connect')}>Connect</Menu.Item>
      </Menu>
    </Layout.Sider>
    <Layout>
      <Layout.Content className="container">
        <Row>
          <Col xxl={{ span: 14, offset: 5 }} xl={{ span: 16, offset: 4 }} lg={{ span: 18, offset: 3 }} md={{ span: 20, offset: 2 }} span={24}>
            {params.page === 'database' && <Database />}
            {params.page === 'connect' && <Connect />}
            {params.page === 'forms' && <Forms />}
          </Col>
        </Row>
      </Layout.Content>
    </Layout>
  </Layout>
}

export default Dashboard