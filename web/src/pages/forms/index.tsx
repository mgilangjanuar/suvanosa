import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Checkbox, Col, DatePicker, Divider, Form, Input, InputNumber, Layout, notification, PageHeader, Row, Select, Space, Typography } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher, req } from '../../utils/Fetcher'

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

  const WrapperFormItem: React.FC<{ data: any, valuePropName?: string }> = ({ children, data, valuePropName }) => {
    return <Form.Item name={data.name} label={<Space direction="vertical">
      <Typography.Title level={5}>{data.label}</Typography.Title>
      {data.description && <Typography.Paragraph type="secondary">{data.description}</Typography.Paragraph>}
    </Space>} help={data.help || undefined} valuePropName={valuePropName || undefined} rules={[{ required: data.required, message: `${data.label} can't be blank` }]}>
      {children}
    </Form.Item>
  }

  const RenderedFormItem: React.FC<{ data: any }> = ({ data }) => {
    if (data.type === 'title') {
      return <WrapperFormItem data={data}>
        <Input />
      </WrapperFormItem>
    }
    if (data.type === 'rich_text') {
      return <WrapperFormItem data={data}>
        <Input.TextArea />
      </WrapperFormItem>
    }
    if (data.type === 'email') {
      return <WrapperFormItem data={data}>
        <Input type="email" />
      </WrapperFormItem>
    }
    if (data.type === 'number') {
      return <WrapperFormItem data={data}>
        <InputNumber type="number" style={{ width: '100%' }} />
      </WrapperFormItem>
    }
    if (data.type === 'date') {
      if (data.date_type === 'range') {
        return <WrapperFormItem data={data}>
          <DatePicker.RangePicker showTime style={{ width: '100%' }} />
        </WrapperFormItem>
      }
      return <WrapperFormItem data={data}>
        <DatePicker showTime style={{ width: '100%' }} />
      </WrapperFormItem>
    }
    if (data.type === 'select') {
      return <WrapperFormItem data={data}>
        <Select>
          {data.options?.map((option: any) => <Select.Option key={option.id} value={option.name}>{option.name}</Select.Option>)}
        </Select>
      </WrapperFormItem>
    }
    if (data.type === 'multi_select') {
      return <WrapperFormItem data={data}>
        <Select mode="multiple">
          {data.options?.map((option: any) => <Select.Option key={option.id} value={option.name}>{option.name}</Select.Option>)}
        </Select>
      </WrapperFormItem>
    }
    if (data.type === 'checkbox') {
      return <WrapperFormItem data={data} valuePropName="checked">
        <Checkbox />
      </WrapperFormItem>
    }
    return <></>
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