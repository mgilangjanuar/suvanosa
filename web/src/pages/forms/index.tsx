import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Col, Divider, Form, Layout, notification, PageHeader, Row, Typography } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher, req } from '../../utils/Fetcher'
import RenderedFormItem from './components/RenderedFormItem'

const Forms: FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const [form] = Form.useForm()
  const { data: db, error: errorDb } = useSWR(`/databases/${params.id}`, fetcher)
  const { data: forms, error: errorForms } = useSWR(`/forms/public/${params.id}`, fetcher)

  useEffect(() => {
    if (errorDb || errorForms) {
      notification.error({
        message: 'Something error',
        description: 'Please reload to try again',
      })
    }
  }, [errorDb, errorForms])

  useEffect(() => {
    if (db && db.database === null) {
      navigate('/', { replace: true })
    }
  }, [db])

  const submit = async () => {
    const data = form.getFieldsValue()
    try {
      await req.post(`/forms/public/${db?.database.id}`, { forms: data })
    } catch (error) {
      notification.error({
        message: 'Something error',
        description: 'Please reload to try again',
      })
    }
  }

  return <Layout.Content className="container">
    <Row>
      <Col xxl={{ span: 8, offset: 8 }} xl={{ span: 10, offset: 7 }} lg={{ span: 12, offset: 6 }} md={{ span: 16, offset: 4 }} span={24}>
        <PageHeader title={db?.database.title}>
          {db?.database.description && <Typography.Paragraph>
            {db?.database.description}
          </Typography.Paragraph>}
        </PageHeader>
        <Divider />
        <Form layout="vertical" form={form} onFinish={submit}>
          {forms?.forms.map((f: any) =>
            <RenderedFormItem key={f.id} data={f} />
          )}
          <Divider />
          <Form.Item style={{ textAlign: 'right' }} wrapperCol={{ offset: 6, span: 12 }}>
            <Button htmlType="submit" type="default" block>Send <ArrowRightOutlined /></Button>
          </Form.Item>
        </Form>
      </Col>
    </Row>
  </Layout.Content>
}

export default Forms