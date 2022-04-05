import { DatabaseOutlined, ShareAltOutlined } from '@ant-design/icons'
import { Button, Col, Layout, Row, Typography } from 'antd'
import { FC } from 'react'
import { ReactComponent as Notion } from '../notion.svg'
import { useLogin } from '../hooks/useLogin'
import GitHubButton from 'react-github-btn'

const Home: FC = () => {
  const { user, url } = useLogin()

  return <Layout.Content className="container">
    <Row style={{ textAlign: 'center' }}>
      <Col xxl={{ span: 8, offset: 8 }} xl={{ span: 10, offset: 7 }} lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} span={24}>
        <Typography.Title level={2}>
          Survey engine powered with <Notion style={{ width: '43px', height: 'auto', marginBottom: '-7px' }} /> Notion.
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          Start to create beautiful surveys with Notion. What you have to do is create a table in your Notion workspace, and voila! Your survey is ready to share with your audience.
        </Typography.Paragraph>
        <Typography.Paragraph style={{ marginTop: '40px' }}>
          <Button size="large" type="primary" onClick={() => window.open(user ? '/dashboard' : url, '_self')}>
            {user ? 'Go to Dashboard' : 'Create a Survey'}
          </Button>
        </Typography.Paragraph>
        <Typography.Paragraph>
          <GitHubButton href="https://github.com/mgilangjanuar/suvanosa" data-show-count="true" aria-label="Star mgilangjanuar/suvanosa on GitHub">Star</GitHubButton>
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row style={{ textAlign: 'center', marginTop: '120px' }} gutter={36}>
      <Col style={{ marginBottom: '40px' }} xxl={{ span: 8, offset: 8 }} xl={{ span: 10, offset: 7 }} lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} span={24}>
        <Typography.Title level={3}>
          Create a survey with 3 steps.
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          A new way to create a beautiful survey in easy steps.
        </Typography.Paragraph>
      </Col>
      <Col style={{ marginBottom: '40px' }} md={{ span: 6, offset: 3 }} span={24}>
        <Typography.Paragraph style={{ fontSize: '3em', marginBottom: 0 }}>
          <DatabaseOutlined />
        </Typography.Paragraph>
        <Typography.Paragraph strong>
          1. Build table in Notion
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Create a table in your Notion workspace.
        </Typography.Paragraph>
      </Col>
      <Col style={{ marginBottom: '40px' }} md={{ span: 6 }} span={24}>
        <Typography.Paragraph style={{ marginBottom: '13px', marginTop: '13px' }}>
          <img src="/logo512.png" style={{ width: '50px' }} />
        </Typography.Paragraph>
        <Typography.Paragraph strong>
          2. Connect with Suvanosa
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Login to Suvanosa and connect to your table.
        </Typography.Paragraph>
      </Col>
      <Col style={{ marginBottom: '40px' }} md={{ span: 6 }} span={24}>
        <Typography.Paragraph style={{ fontSize: '3em', marginBottom: 0 }}>
          <ShareAltOutlined />
        </Typography.Paragraph>
        <Typography.Paragraph strong>
          3. Share your survey
        </Typography.Paragraph>
        <Typography.Paragraph type="secondary">
          Get the URL and share it with your audience.
        </Typography.Paragraph>
      </Col>
    </Row>
    <Row style={{ textAlign: 'center', marginTop: '120px' }}>
      <Col xxl={{ span: 8, offset: 8 }} xl={{ span: 10, offset: 7 }} lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} span={24}>
        <Typography.Title level={3}>
          Simple and get the job done.
        </Typography.Title>
        <Typography.Paragraph type="secondary">
          View the Notion table for this demo <a target="_blank" href="https://mgilangjanuar.notion.site/ffa2d58fd9e746c681492644ed9cf2d5?v=973aeb530a0b41f6bcc85d9099f11dcf">here</a>.
        </Typography.Paragraph>
        <iframe style={{ width: '100%', height: '860px', border: 'none' }} src="https://suvanosa.appledore.dev/forms/82936ff9-1884-4018-960b-6a543482bdcb" />
      </Col>
    </Row>
  </Layout.Content>
}

export default Home