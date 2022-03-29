import { DeleteOutlined, MenuOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, DatePicker, Form, Input, InputNumber, Layout, notification, Popconfirm, Select, Space, Tag, Tooltip, Typography } from 'antd'
import { FC, useEffect, useState } from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'
import { req } from '../../../../utils/Fetcher'

const SortableItem = SortableElement(({ value }: any) => {
  const [syncLoading, setSyncLoading] = useState<boolean>()
  const [removeLoading, setRemoveLoading] = useState<boolean>()
  const [required, setRequired] = useState<boolean>(value.form.getFieldValue('forms')?.[value.i]?.required)

  const remove = async () => {
    setRemoveLoading(true)
    try {
      await req.delete(`/forms/${value.form.getFieldValue('forms')?.[value.i]?.id}`)
      notification.success({
        message: 'Deleted'
      })
      value.form.setFieldsValue({
        forms: value.form.getFieldValue('forms').map((form: any, i: number) => {
          if (i === value.i) {
            return null
          }
          return form
        }).filter(Boolean)
      })
      setRemoveLoading(false)
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
      setRemoveLoading(false)
    }
  }

  const sync = async () => {
    setSyncLoading(true)
    try {
      const { data } = await req.patch(`/forms/${value.form.getFieldValue('forms')?.[value.i]?.id}/sync`)
      value.form.setFieldsValue({
        forms: value.form.getFieldValue('forms').map((form: any, i: number) => {
          if (i === value.i) {
            return data.form
          }
          return form
        })
      })
      notification.success({
        message: 'Synced'
      })
      setSyncLoading(false)
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
      setSyncLoading(false)
    }
  }

  useEffect(() => {
    if (required !== value.form.getFieldValue('forms')?.[value.i]?.required) {
      value.form.setFieldsValue({
        forms: value.form.getFieldValue('forms').map((form: any, i: number) => {
          if (i === value.i) {
            return { ...form, required }
          }
          return form
        })
      })
      update()
    }
  }, [required])

  const update = async (data?: any) => {
    value.onSaving(true)
    data = data || value.form.getFieldValue('forms')?.[value.i]
    try {
      await req.patch(`/forms/${data.id}`, { form: {
        ...data,
        order: undefined
      } })
      value.onSaving(false)
    } catch (error) {
      value.onSaving(false)
      notification.error({
        message: 'Error',
        description: `Failed to save form: ${data.label}`
      })
    }
  }

  const _FormItem: FC<{ form: any }> = ({ form }) => {
    return <Form layout="vertical">
      <Form.Item label={<Space direction="vertical">
        <Typography.Title level={5}>{form.label}</Typography.Title>
        <Typography.Paragraph type="secondary">{form.description}</Typography.Paragraph>
      </Space>} help={form.help}>
        {form.type === 'title' || form.type === 'rich_text' ? <Input /> : <></>}
        {form.type === 'email' ? <Input type="email" /> : <></>}
        {form.type === 'number' ? <InputNumber /> : <></>}
        {form.type === 'date' && form.date_type !== 'range' ? <DatePicker showTime style={{ width: '100%' }} /> : <></>}
        {form.type === 'date' && form.date_type === 'range' ? <DatePicker.RangePicker showTime style={{ width: '100%' }} /> : <></>}
        {form.type === 'select' ? <Select>
          {form.options.map((option: any) => <Select.Option key={option.id} value={option.name}>{option.name}</Select.Option>)}
        </Select> : <></>}
      </Form.Item>
    </Form>
  }

  return <>
    {!value.collapsible.collapsibleStates[value.form.getFieldValue('forms')?.[value.i]?.id] ? <Card hoverable
      title={<Layout.Content onClick={() => value.collapsible.setCollapsibleStates({ ...value.collapsible.collapsibleStates, [value.form.getFieldValue('forms')?.[value.i]?.id]: true })}>
        <DragHandle />
      </Layout.Content>}
      extra={<>
        <Popconfirm title="Are you sure to delete this?" onConfirm={remove}>
          <Button loading={removeLoading} size="small" type="text" shape="round" danger icon={<DeleteOutlined />} />
        </Popconfirm>
        <Tooltip title="Sync from Notion">
          <Button loading={syncLoading} size="small" type="text" shape="round" onClick={() => sync()} icon={<SyncOutlined />} />
        </Tooltip>
      </>}
      bodyStyle={{ paddingBottom: 0 }}
      style={{ margin: '20px 0' }}>
      <Form.Item>
        <Layout.Content>
          <Tag style={{ float: 'right' }}>
            {value.form.getFieldValue('forms')?.[value.i]?.type}
          </Tag>
          <Form.Item { ...fieldCol } {...value.field} name={[value.field.name, 'label']} fieldKey={[value.field.fieldKey, 'label']} key={[value.field.fieldKey, 'label']}>
            <Input onBlur={() => update()} bordered={false} placeholder="Please input label..." />
          </Form.Item>
          <Form.Item { ...fieldCol } {...value.field} name={[value.field.name, 'description']} fieldKey={[value.field.fieldKey, 'description']} key={[value.field.fieldKey, 'description']}>
            <Input onBlur={() => update()} bordered={false} placeholder="Write your description or leave it blank..." />
          </Form.Item>
          <Form.Item { ...fieldCol } {...value.field} name={[value.field.name, 'help']} fieldKey={[value.field.fieldKey, 'help']} key={[value.field.fieldKey, 'help']}>
            <Input onBlur={() => update()} bordered={false} placeholder="Write your help text or leave it blank..." />
          </Form.Item>
          <Form.Item valuePropName="checked" { ...fieldCol } {...value.field} name={[value.field.name, 'required']} fieldKey={[value.field.fieldKey, 'required']} key={[value.field.fieldKey, 'required']}>
            <Checkbox onChange={({ target }) => {
              setRequired(target.checked)
              update({
                ...value.form.getFieldValue('forms')?.[value.i],
                required: target.checked
              })
            }} checked={required}>Required</Checkbox>
          </Form.Item>
        </Layout.Content>
      </Form.Item>
    </Card> : <Card hoverable style={{ margin: '20px 0', position: 'relative' }} onClick={() => value.collapsible.setCollapsibleStates({ ...value.collapsible.collapsibleStates, [value.form.getFieldValue('forms')?.[value.i]?.id]: false })}>
      <Card.Meta title={<>
        <DragHandle /> {value.form.getFieldValue('forms')?.[value.i]?.label}
        {value.form.getFieldValue('forms')?.[value.i]?.required && <small style={{ float: 'right' }}>
          <Typography.Text type="secondary" italic> Required</Typography.Text>
        </small>}
      </>}
      />
    </Card>}
  </>
})

const DragHandle = SortableHandle(() => <Tooltip title="Hold &amp; drag to sort">
  <Button size="small" type="text"><MenuOutlined /></Button>
</Tooltip>)

const fieldCol = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
}

export default SortableItem