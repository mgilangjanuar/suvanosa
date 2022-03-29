import { ArrowRightOutlined, DeleteOutlined } from '@ant-design/icons'
import { Button, Layout, Popconfirm, Space, Spin, Typography } from 'antd'
import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher, req } from '../../../utils/Fetcher'
import Card from '../components/Card'

const Database: FC = () => {
  const navigate = useNavigate()
  const { data, error, mutate } = useSWR('/databases', fetcher)
  const [removeLoading, setRemoveLoading] = useState<boolean>()

  const remove = async (id: string) => {
    setRemoveLoading(true)
    try {
      await req.delete(`/databases/${id}`)
      mutate()
      setRemoveLoading(false)
    } catch (error) {
      setRemoveLoading(false)
    }
  }

  return <>
    <Layout.Content>
      <h2>My Database</h2>
    </Layout.Content>

    <Layout.Content style={{ marginTop: '40px' }}>
      {!data && !error ? <Spin /> : <>
        {data?.databases?.length ? <>
          {data?.databases.map((db: any) => <Card name={db.title} data={db.real_object} key={db.id} extra={<Space>
            <Popconfirm title="Are you sure?" onConfirm={() => remove(db.id)}>
              <Button loading={removeLoading} shape="round" danger type="text" icon={<DeleteOutlined />} />
            </Popconfirm>
            <Button type="text" shape="round" onClick={() => navigate(`/dashboard/details/${db.id}`)} icon={<ArrowRightOutlined />} />
          </Space>} url={`${location.origin}/forms/${db.id}`} />)}
        </> : <Space direction="vertical">
          <Typography.Paragraph type="secondary">
            You don't have any database yet. Try to connecting with your database in Notion <a href="/dashboard/connect">here</a>.
          </Typography.Paragraph>
        </Space>}
      </>}
    </Layout.Content>
  </>
}

export default Database