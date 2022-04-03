import { CheckCircleOutlined, CopyOutlined, DatabaseOutlined, DeleteOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons'
import { Button, Form, Input, Layout, message, notification, PageHeader, Popconfirm, Popover, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import clipboard from 'clipboardy'
import { FC, useEffect } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { req } from '../../../../utils/Fetcher'
import { useRemoveDatabase } from '../hooks/useRemoveDatabase'
import PopoverTutorial from './PopoverTutorial'

interface Props {
  database?: any,
  savingStates: [boolean, (value: boolean) => void],
  tutorialStates: [string | null, (value: string | null) => void]
}

const Header: FC<Props> = ({ database, savingStates, tutorialStates }) => {
  const [isSaving, setIsSaving] = savingStates
  const navigate = useNavigate()
  const params = useParams()
  const [formDb] = useForm()
  const { remove, loading: removeLoading } = useRemoveDatabase()

  useEffect(() => {
    if (database) {
      formDb.setFieldsValue({
        title: database.title,
        description: database.description
      })
    }
  }, [database])

  const update = async (database: Record<string, any>) => {
    setIsSaving(true)
    try {
      await req.patch(`/databases/${params.id}`, { database })
      setIsSaving(false)
    } catch (error) {
      setIsSaving(false)
      notification.error({
        message: 'Something error'
      })
    }
  }

  return <Layout.Content>
    <Form form={formDb}>
      <PageHeader style={{ padding: 0 }} title={
        <PopoverTutorial name="title" title="1/5 Edit Title" content="Click to edit title of your survey." next="description" tutorialStates={tutorialStates}>
          <Form.Item name="title" style={{ marginBottom: 0 }}>
            <Input style={{ fontSize: '20px', marginBottom: 0, padding: 0 }} onBlur={() => update(formDb.getFieldsValue())} size="large" bordered={false} placeholder="Edit your survey name..." />
          </Form.Item>
        </PopoverTutorial>
      } onBack={() => navigate(-1)} breadcrumb={{ routes: [
        { path: '/dashboard/database', breadcrumbName: 'Database' },
        { path: '#', breadcrumbName: database?.title },
      ], itemRender: (route, _, routes) => {
        const last = routes.indexOf(route) === routes.length - 1
        return last ? <span>{route.breadcrumbName}</span> : <Link to={route.path}>{route.breadcrumbName}</Link>
      } }} extra={[
        <Popconfirm key="delete" title="Are you sure?" placement="bottom" onConfirm={() => remove(database?.id, () => navigate(-1))}>
          <Button size="small" loading={removeLoading} shape="round" danger type="text" icon={<DeleteOutlined />} />
        </Popconfirm>,
        <Button key="database" size="small" type="text" shape="round" icon={<DatabaseOutlined />} href={database?.real_object.url} target="_blank" />,
        <PopoverTutorial key="url" name="url" title="5/5 Share URL" content="Click and get your survey URL! 🎊" next="_done" tutorialStates={tutorialStates}>
          <Popover trigger={['click']} placement="bottom" title="Form URL" content={<Layout.Content>
            <Form.Item>
              <Input.Search
                enterButton={<CopyOutlined />}
                value={`${location.origin}/forms/${database?.id}`}
                contentEditable={false}
                onSearch={val => {
                  clipboard.write(val).then(() => message.success('Copied to clipboard'))
                }} />
            </Form.Item>
            <Typography.Paragraph>
              <Button block href={`${location.origin}/forms/${database?.id}`} target="_blank">Open Form</Button>
            </Typography.Paragraph>
          </Layout.Content>}>
            <Button size="small" type="text" shape="round" icon={<LinkOutlined />} />
          </Popover>
        </PopoverTutorial>,
        <Typography.Paragraph type="secondary" key="saved-status" style={{ marginTop: '13px', marginLeft: '5px' }}>
          {isSaving ? <><LoadingOutlined /> Saving</> : <><CheckCircleOutlined /> Saved</>}
        </Typography.Paragraph>
      ]}>
        <PopoverTutorial name="description" title="2/5 Edit Description" content="Click to edit description." next="reorder-0" tutorialStates={tutorialStates}>
          <Form.Item name="description">
            <Input.TextArea onBlur={() => update(formDb.getFieldsValue())} placeholder="Write the survey description here..." bordered={false} />
          </Form.Item>
        </PopoverTutorial>
      </PageHeader>
    </Form>
  </Layout.Content>
}

export default Header