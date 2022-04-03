import { DeleteOutlined, MenuOutlined, SyncOutlined } from '@ant-design/icons'
import { Button, Card, Checkbox, Form, Input, Layout, notification, Popconfirm, Space, Tag, Tooltip, Typography } from 'antd'
import { useEffect, useState } from 'react'
import { SortableElement, SortableHandle } from 'react-sortable-hoc'
import { req } from '../../../../utils/Fetcher'
import PopoverTutorial from './PopoverTutorial'

const SortableItem = SortableElement(({ value }: any) => {
  const [syncLoading, setSyncLoading] = useState<boolean>()
  const [removeLoading, setRemoveLoading] = useState<boolean>()
  const [required, setRequired] = useState<boolean>(value.form.getFieldValue('forms')?.[value.i]?.required)

  const remove = async () => {
    setRemoveLoading(true)
    value.onSaving(true)
    try {
      await req.delete(`/forms/${value.form.getFieldValue('forms')?.[value.i]?.id}`)
      value.form.setFieldsValue({
        forms: value.form.getFieldValue('forms').map((form: any, i: number) => {
          if (i === value.i) {
            return null
          }
          return form
        }).filter(Boolean)
      })
      setRemoveLoading(false)
      value.onSaving(false)
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
      setRemoveLoading(false)
      value.onSaving(false)
    }
  }

  const sync = async () => {
    setSyncLoading(true)
    value.onSaving(true)
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
      setSyncLoading(false)
      value.onSaving(false)
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
      setSyncLoading(false)
      value.onSaving(false)
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

  return <>
    {!value.collapsible.collapsibleStates[value.form.getFieldValue('forms')?.[value.i]?.id] ? <Card hoverable
      title={<Layout.Content onClick={() => value.collapsible.setCollapsibleStates({ ...value.collapsible.collapsibleStates, [value.form.getFieldValue('forms')?.[value.i]?.id]: true })}>
        <DragHandle />
      </Layout.Content>}
      extra={<Space size={0}>
        <Popconfirm title="Are you sure to delete this?" onConfirm={remove}>
          <Button loading={removeLoading} size="small" type="text" shape="round" danger icon={<DeleteOutlined />} />
        </Popconfirm>
        <Tooltip title="Sync from Notion">
          <Button loading={syncLoading} size="small" type="text" shape="round" onClick={() => sync()} icon={<SyncOutlined />} />
        </Tooltip>
      </Space>}
      bodyStyle={{ paddingBottom: 0 }}
      style={{ margin: '20px 0' }}>
      <Form.Item>
        <PopoverTutorial name={`form-${value.i}`} title="4/5 Form Details" content="Edit your label, description, and help text for your input." next="url" tutorialStates={value.tutorialStates}>
          <Layout.Content>
            <Tag style={{ float: 'right' }}>
              {value.form.getFieldValue('forms')?.[value.i]?.type}
            </Tag>
            <Form.Item { ...fieldCol } {...value.field} name={[value.field.name, 'label']} fieldKey={[value.field.fieldKey, 'label']} key={[value.field.fieldKey, 'label']}>
              <Input onBlur={() => update()} bordered={false} placeholder="Please input label..." style={{ fontSize: '16px' }} />
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
        </PopoverTutorial>
      </Form.Item>
    </Card> : <Card hoverable style={{ margin: '20px 0', position: 'relative' }} onClick={() => value.collapsible.setCollapsibleStates({ ...value.collapsible.collapsibleStates, [value.form.getFieldValue('forms')?.[value.i]?.id]: false })}>
      <Card.Meta title={<>
        <PopoverTutorial name={`reorder-${value.i}`} title="3/5 Reorder Form" content="Hold and drag to sort the forms order." next="form-0" tutorialStates={value.tutorialStates}>
          <DragHandle />
        </PopoverTutorial> {value.form.getFieldValue('forms')?.[value.i]?.label}
        {value.form.getFieldValue('forms')?.[value.i]?.required && <small style={{ float: 'right' }}>
          <Typography.Text type="secondary" italic> Required</Typography.Text>
        </small>}
      </>}
      />
    </Card>}
  </>
})

const DragHandle = SortableHandle(() => <Button type="text" shape="round" icon={<MenuOutlined />} />)

const fieldCol = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
}

export default SortableItem