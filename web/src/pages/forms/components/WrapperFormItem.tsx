import { Form, Space, Typography } from 'antd'
import { FC } from 'react'

const WrapperFormItem: FC<{ data: any, valuePropName?: string }> = ({ children, data, valuePropName }) => {
  return <Form.Item
    style={{ marginBottom: '30px' }}
    name={data.name}
    label={<Space direction="vertical" size={0}>
      <Typography.Title level={5} style={{ margin: 0 }}>{data.label}</Typography.Title>
      {data.description && <Typography.Text type="secondary">{data.description}</Typography.Text>}
    </Space>}
    help={data.help || undefined}
    valuePropName={valuePropName || undefined}
    rules={[{ required: data.required, message: `${data.label} can't be blank` }]}>
    {children}
  </Form.Item>
}

export default WrapperFormItem