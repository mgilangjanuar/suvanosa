import { AutoComplete, Form, FormInstance, Modal, notification } from 'antd'
import { FC, useState } from 'react'
import { useParams } from 'react-router-dom'
import { req } from '../../../../utils/Fetcher'

interface Props {
  database?: any,
  visibilityStates: [boolean, (value: boolean) => void],
  form: FormInstance,
  updateFormsOrder: () => void
}

const AddForm: FC<Props> = ({ database, visibilityStates, form, updateFormsOrder }) => {
  const params = useParams()
  const [showAddModal, setShowAddModal] = visibilityStates
  const [searchFormName, setSearchFormName] = useState<string>()
  const [addLoading, setAddLoading] = useState<boolean>(false)

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

  return <Modal
    visible={showAddModal}
    onCancel={() => setShowAddModal(false)}
    onOk={() => addForm()}
    okText="Add"
    okButtonProps={{ loading: addLoading }}
    title="Search property">
    <Form onFinish={addForm}>
      <Form.Item>
        <AutoComplete options={
          Object.keys(database?.real_object?.properties || {})
            .filter(value => !form.getFieldValue('forms')?.find((f: any) => f.name === value))
            .map(value => ({ value }))
        } disabled={addLoading}
        placeholder="Input your column name..."
        value={searchFormName} onChange={setSearchFormName} />
      </Form.Item>
    </Form>
  </Modal>
}

export default AddForm