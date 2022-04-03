import { DoubleRightOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Layout, Popover, Space, Typography } from 'antd'
import { FC } from 'react'

interface Props {
  name: string,
  title: string,
  content: string,
  next: string,
  tutorialStates: [string | null, (value: string | null) => void]
}

const PopoverTutorial: FC<Props> = ({ name, title, content, next, tutorialStates, children }) => {

  const [tutorial, setTutorial] = tutorialStates

  return <Popover trigger={[]} visible={tutorial === name} title={title} content={<Layout.Content>
    <Typography.Paragraph>
      {content}
    </Typography.Paragraph>
    <Typography.Paragraph style={{ textAlign: 'right' }}>
      <Space>
        <Button
          size="small"
          shape="circle"
          type="primary" icon={<RightOutlined />}
          onClick={() => setTutorial(next)} />
        <Button
          size="small"
          shape="circle"
          icon={<DoubleRightOutlined />}
          onClick={() => setTutorial('_done')} />
      </Space>
    </Typography.Paragraph>
  </Layout.Content>}>
    {children}
  </Popover>
}

export default PopoverTutorial