import { CheckCircleOutlined, LoadingOutlined, PlusOutlined } from '@ant-design/icons'
import { AutoComplete, Button, Form, Input, Layout, Modal, notification, PageHeader, Typography } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { FC, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { arrayMove } from 'react-sortable-hoc'
import useSWR from 'swr'
import { fetcher, req } from '../../../utils/Fetcher'
import SortableList from './components/SortableList'

const Forms: FC = () => {
  const navigate = useNavigate()
  const params = useParams()
  const { data: db, error: errorDb } = useSWR(`/databases/${params.id}`, fetcher)
  const { data: forms, error: errorForms } = useSWR(`/forms/public/${params.id}`, fetcher)
  const [form] = useForm()
  const [formDb] = useForm()
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [searchFormName, setSearchFormName] = useState<string>()
  const [addLoading, setAddLoading] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)

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

  const updateFormsOrder = async () => {
    const { forms } = form.getFieldsValue()
    setIsSaving(true)
    await Promise.all(await forms.map(async (form: any, i: number) => {
      if (form.order !== i) {
        try {
          await req.patch(`/forms/${form.id}`, { form: {
            order: i
          } })
        } catch (error) {
          setIsSaving(false)
          notification.error({
            message: 'Error',
            description: `Failed to save form: ${form.label}`
          })
        }
      }
    }))
    setIsSaving(false)
  }

  const addForm = async () => {
    setAddLoading(true)
    if (searchFormName) {
      try {
        const { data } = await req.post('/forms', { database_id: params.id, name: searchFormName })
        if (!form.getFieldValue('forms').find((f: any) => f.id === data.form.id)) {
          form.setFieldsValue({
            forms: [...form.getFieldValue('forms'), data.form]
          })
          updateFormsOrder()
          setShowAddModal(false)
          setSearchFormName(undefined)
          setAddLoading(false)
        } else {
          notification.error({
            message: 'Column has been added'
          })
          setAddLoading(false)
        }
      } catch (error) {
        notification.error({
          message: 'Not found'
        })
        setAddLoading(false)
      }
    }
  }

  return <>
    <Layout.Content>
      <Form form={formDb}>
        <PageHeader title={
          <Form.Item name="title" style={{ marginBottom: 0 }}>
            <Input style={{ fontSize: '20px', marginBottom: 0 }} onBlur={() => update(formDb.getFieldsValue())} size="large" bordered={false} placeholder="Edit your survey name..." />
          </Form.Item>
        } onBack={() => navigate(-1)} breadcrumb={{ routes: [
          { path: '/dashboard/database', breadcrumbName: 'Database' },
          { path: '#', breadcrumbName: db?.database?.title },
        ], itemRender: (route, _, routes) => {
          const last = routes.indexOf(route) === routes.length - 1
          return last ? <span>{route.breadcrumbName}</span> : <Link to={route.path}>{route.breadcrumbName}</Link>
        } }} extra={[
          <Typography.Paragraph style={{ marginTop: '10px' }}>{isSaving ? <><LoadingOutlined /> Saving</> : <><CheckCircleOutlined /> Saved</>}</Typography.Paragraph>
        ]}>
          <Form.Item name="description">
            <Input.TextArea onBlur={() => update(formDb.getFieldsValue())} placeholder="Write the survey description here..." bordered={false} />
          </Form.Item>
        </PageHeader>
      </Form>
    </Layout.Content>

    <Layout.Content style={{ marginTop: '40px' }}>
      <Form form={form}>
        <Form.List name="forms">
          {(fields, { remove }) => <>
            <SortableList items={
              fields.map((field, i) => ({
                field, remove, i, form
              }))
            } onSortEnd={({ oldIndex, newIndex }: any) => {
              form.setFieldsValue({ forms: arrayMove(form.getFieldValue('forms'), oldIndex, newIndex) })
              updateFormsOrder()
            }} useDragHandle useWindowAsScrollContainer />
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button type="dashed" onClick={() => setShowAddModal(true)} block icon={<PlusOutlined />}>
                Add form item
              </Button>
            </Form.Item>
          </>}
        </Form.List>
      </Form>
    </Layout.Content>

    <Modal visible={showAddModal} onCancel={() => setShowAddModal(false)} onOk={() => addForm()} okText="Add" okButtonProps={{ loading: addLoading }} title="Search property">
      <Form onFinish={addForm}>
        <Form.Item>
          <AutoComplete options={
            Object.keys(db?.database?.real_object?.properties || {})
              .filter(value => !form.getFieldValue('forms')?.find((f: any) => f.name === value))
              .map(value => ({ value }))
          } disabled={addLoading} placeholder="Input your column name..." value={searchFormName} onChange={setSearchFormName} />
        </Form.Item>
      </Form>
    </Modal>
  </>
}

export default Forms