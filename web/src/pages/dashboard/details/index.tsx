import { PlusOutlined } from '@ant-design/icons'
import { Button, Form, Input, Layout, notification } from 'antd'
import { useForm } from 'antd/lib/form/Form'
import { FC, useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { arrayMove } from 'react-sortable-hoc'
import useSWR from 'swr'
import { fetcher, req } from '../../../utils/Fetcher'
import AddForm from './components/AddForm'
import Header from './components/Header'
import SortableList from './components/SortableList'

const Details: FC = () => {
  const params = useParams()
  const { data: db, error: errorDb } = useSWR(`/databases/${params.id}`, fetcher)
  const { data: forms, error: errorForms } = useSWR(`/forms/public/${params.id}`, fetcher)
  const [form] = useForm()
  const [collapsibleStates, setCollapsibleStates] = useState<{ [key: string]: boolean }>({})
  const [showAddModal, setShowAddModal] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [tutorial, setTutorial] = useState<string | null>(localStorage.getItem('tutorial') || 'title')

  useEffect(() => {
    if (errorDb || errorForms) {
      notification.error({
        message: 'Something error',
        description: 'Please reload to try again',
      })
    }
  }, [errorDb, errorForms])

  useEffect(() => {
    if (forms?.forms) {
      form.setFieldsValue({
        forms: forms.forms.map((form: any) => ({ ...form, collapsed: true }))
      })
      setCollapsibleStates(forms.forms.reduce((acc: any, form: any) => ({
        ...acc, [form.id]: collapsibleStates?.[form.id] || true
      }), {}))
    }
  }, [forms])

  useEffect(() => {
    if (tutorial) {
      localStorage.setItem('tutorial', tutorial)
    }
  }, [tutorial])

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

  return <>
    <Header database={db?.database} savingStates={[isSaving, setIsSaving]} tutorialStates={[tutorial, setTutorial]} />

    <Layout.Content style={{ marginTop: '40px' }}>
      <Form autoComplete="off" form={form}>
        <Input type="hidden" autoComplete="false" />
        <Form.List name="forms">
          {(fields, { remove }) => <>
            <SortableList items={
              fields.map((field, i) => ({
                field,
                remove,
                i,
                form,
                collapsible: { collapsibleStates, setCollapsibleStates },
                tutorialStates: [tutorial, setTutorial],
                onSaving: (val: boolean) => setIsSaving(val)
              }))
            } onSortEnd={({ oldIndex, newIndex }: any) => {
              form.setFieldsValue({
                forms: arrayMove(form.getFieldValue('forms'), oldIndex, newIndex)
              })
              updateFormsOrder()
            }} useDragHandle useWindowAsScrollContainer />
            <Form.Item wrapperCol={{ span: 24 }}>
              <Button size="large" type="dashed" onClick={() => setShowAddModal(true)} block icon={<PlusOutlined />}>
                Add form item
              </Button>
            </Form.Item>
          </>}
        </Form.List>
      </Form>
    </Layout.Content>

    <AddForm database={db?.database} visibilityStates={[showAddModal, setShowAddModal]} form={form} updateFormsOrder={updateFormsOrder} />
  </>
}

export default Details