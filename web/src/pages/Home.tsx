import { Button, Col, Layout, Row, Typography } from 'antd'
import { FC } from 'react'
import { useLogin } from '../hooks/useLogin'

const Home: FC = () => {
  const { user, url } = useLogin()

  return <Layout.Content className="container">
    <Row style={{ textAlign: 'center' }}>
      <Col xxl={{ span: 8, offset: 8 }} xl={{ span: 10, offset: 7 }} lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} span={24}>
        <Typography.Title level={2}>
          Survey engine powered with Notion.
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Start to create beautiful surveys with Notion. What you have to do is create a table in your Notion workspace, and voila! Your survey is ready to share with your audience.
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: '40px' }}>
          <Button size="large" type="primary" onClick={() => window.open(user ? '/dashboard' : url, '_self')}>
            {user ? 'Go to Dashboard' : 'Create a Survey'}
          </Button>
        </Typography.Paragraph>
      </Col>
    </Row>
  </Layout.Content>
}

export default Home