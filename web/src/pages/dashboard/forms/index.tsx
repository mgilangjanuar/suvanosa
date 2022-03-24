import { DeleteOutlined, MenuOutlined, PlusOutlined, SaveOutlined } from '@ant-design/icons'
import { Button, Card, Col, Drawer, Form, Input, Layout, notification, Popconfirm, Row, Select, Space, Tag, Tooltip, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { FC, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { arrayMove, SortableContainer, SortableElement, SortableHandle } from 'react-sortable-hoc'
import useSWR from 'swr'
import { fetcher, req } from '../../../utils/Fetcher'

const Forms: FC = () => {
  const navigate = useNavigate()
  const [form] = useForm()
  const [formDb] = useForm()
  const params = useParams()
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
    if (db?.database) {
      formDb.setFieldsValue({
        title: db?.database.title,
        description: db?.database.description
      })
    }
  }, [db])

  useEffect(() => {
    if (forms?.forms) {
      form.setFieldsValue({
        forms: forms.forms
      })
    }
  }, [forms])

  const update = async (database: Record<string, any>) => {
    try {
      await req.patch(`/databases/${params.id}`, { database })
      notification.success({
        message: 'Updated'
      })
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
    }
  }

  const remove = async (id: string) => {
    try {
      await req.delete(`/databases/${id}`)
      navigate('/dashboard/database')
      notification.success({
        message: 'Deleted'
      })
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
    }
  }

  const updateFormsOrder = async () => {
    const { forms } = form.getFieldsValue()
    await Promise.all(await forms.map(async (form: any, i: number) => {
      if (form.order !== i) {
        try {
          await req.patch(`/forms/${form.id}`, { form: {
            order: i
          } })
        } catch (error) {
          notification.error({
            message: 'Error',
            description: `Failed to save form: ${form.label}`
          })
        }
      }
    }))
    notification.success({
      message: 'Updated'
    })
  }

  return <>
    <Layout.Content>
      <Form form={formDb}>
        <Typography.Paragraph style={{ textAlign: 'right' }}>
          <Popconfirm title="Are you sure to delete this?" onConfirm={() => remove(db?.database.id)}>
            <Button icon={<DeleteOutlined />} shape="round" type="text" danger>Remove</Button>
          </Popconfirm>
        </Typography.Paragraph>
        <Form.Item name="title">
          <Input onBlur={() => update(formDb.getFieldsValue())} style={{ fontSize: '24px' }} size="large" bordered={false} placeholder="Edit your survey name..." />
        </Form.Item>
        <Form.Item name="description">
          <Input.TextArea onBlur={() => update(formDb.getFieldsValue())} placeholder="Write the survey description here..." bordered={false} />
        </Form.Item>
      </Form>
    </Layout.Content>

    <Layout.Content style={{ marginTop: '40px' }}>
      <Form form={form}>
        <Form.List name="forms">
          {(fields, { add, remove }) => <>
            <SortableList items={fields.map((field, i) => ({ field, remove, i, form }))} onSortEnd={({ oldIndex, newIndex }: any) => {
              form.setFieldsValue({ forms: arrayMove(form.getFieldValue('forms'), oldIndex, newIndex) })
              updateFormsOrder()
            }} useDragHandle useWindowAsScrollContainer />
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                Add form item
              </Button>
            </Form.Item>
          </>}
        </Form.List>
      </Form>
    </Layout.Content>
  </>
}

const SortableItem = SortableElement(({ value }: any) => {
  const [showDrawer, setShowDrawer] = useState<boolean>(!value.form.getFieldValue('forms')?.[value.i]?.label)

  const remove = async () => {
    try {
      await req.delete(`/forms/${value.form.getFieldValue('forms')?.[value.i]?.id}`)
      notification.success({
        message: 'Deleted'
      })
      value.remove(value.field.name)
    } catch (error) {
      notification.error({
        message: 'Something error'
      })
    }
    // value.form.submit()
  }

  const save = () => {
    value.form.submit()
    const data = value.form.getFieldValue('forms')?.[value.i]
    if (data?.label && data?.type) {
      setShowDrawer(false)
    }
  }

  const update = async () => {
    const form = value.form.getFieldValue('forms')?.[value.i]
    try {
      await req.patch(`/forms/${form.id}`, { form: { ...form, order: undefined } })
      notification.success({
        message: 'Updated'
      })
    } catch (error) {
      notification.error({
        message: 'Error',
        description: `Failed to save form: ${form.label}`
      })
    }
  }

  return <Card style={{ margin: '20px 0', position: 'relative', height: '185px' }}>
    <Form.Item>
      <Layout.Content>
        <DragHandle />
        <Space style={{ float: 'right' }}>
          <Tag>
            {value.form.getFieldValue('forms')?.[value.i]?.type}
          </Tag>
          <Popconfirm title="Are you sure to delete this?" onConfirm={remove}>
            <Button type="text" shape="round" danger icon={<DeleteOutlined />}>Remove</Button>
          </Popconfirm>
          {/* <Button type="text" shape="round" onClick={() => setShowDrawer(true)} icon={<EditOutlined />} /> */}
        </Space>
      </Layout.Content>

      <Layout.Content style={{ marginTop: '20px', position: 'absolute', width: '100%' }}>
        <Row>
          <Col>
            <div style={{ textOverflow: 'ellipsis', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              <Form.Item { ...fieldCol } {...value.field} name={[value.field.name, 'label']} fieldKey={[value.field.fieldKey, 'label']}>
                <Input onBlur={() => update()} bordered={false} placeholder="Please input label..." />
              </Form.Item>
              {/* <Typography.Title style={{ marginBottom: 0 }} level={5}>{value.form.getFieldValue('forms')?.[value.i]?.label || 'Untitled'}</Typography.Title> */}
            </div>
          </Col>
        </Row>
      </Layout.Content>

      <Drawer title={`Edit ${value.form.getFieldValue('forms')?.[value.i]?.label || 'Untitled'}`} placement="right" closable visible={showDrawer} onClose={() => setShowDrawer(false)}>
        <Form.Item { ...fieldCol } {...value.field} label="Label" name={[value.field.name, 'label']} fieldKey={[value.field.fieldKey, 'label']} rules={[{ required: true, message: 'Please input label' }]}>
          <Input />
        </Form.Item>
        <Form.Item style={{ marginTop: '20px' }}>
          <Space style={{ float: 'right' }}>
            <Popconfirm title="Are you sure to delete this?" onConfirm={remove}>
              <Button type="text" shape="round" danger icon={<DeleteOutlined />}>Remove</Button>
            </Popconfirm>
            <Button type="text" shape="round" icon={<SaveOutlined />} onClick={save}>Save</Button>
          </Space>
        </Form.Item>
      </Drawer>
    </Form.Item>
  </Card>
})

const SortableList = SortableContainer(({ items }: any) => {
  return <div>{items.map((value: any, index: number) => <SortableItem key={index} index={index} value={value} />)}</div>
})

const DragHandle = SortableHandle(() => <Tooltip title="Hold &amp; drag to sort">
  <Button size="small" type="text"><MenuOutlined /></Button>
</Tooltip>)

const fieldCol = {
  labelCol: { span: 24 },
  wrapperCol: { span: 24 }
}

export default Forms