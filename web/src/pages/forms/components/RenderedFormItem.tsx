import { Checkbox, DatePicker, Form, Input, InputNumber, Select, Space, Typography } from 'antd'
import { FC } from 'react'

const WrapperFormItem: FC<{ data: any, valuePropName?: string }> = ({ children, data, valuePropName }) => {
  return <Form.Item name={data.name} style={{ marginBottom: '30px' }} label={<Space direction="vertical" size={0}>
    <Typography.Title level={5} style={{ margin: 0 }}>{data.label}</Typography.Title>
    {data.description && <Typography.Text type="secondary">{data.description}</Typography.Text>}
  </Space>} help={data.help || undefined} valuePropName={valuePropName || undefined} rules={[{ required: data.required, message: `${data.label} can't be blank` }]}>
    {children}
  </Form.Item>
}

const RenderedFormItem: FC<{ data: any }> = ({ data }) => {
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

export default RenderedFormItem