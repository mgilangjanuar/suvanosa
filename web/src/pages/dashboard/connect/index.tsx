import { ArrowRightOutlined } from '@ant-design/icons'
import { Button, Empty, Input, Layout, Spin } from 'antd'
import { FC, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { req } from '../../../utils/Fetcher'
import Card from '../components/Card'
import { useSearch } from './hooks/useSearch'

const Connect: FC = () => {
  const navigate = useNavigate()
  const [query, setQuery] = useState<string>()
  const [saveLoading, setSaveLoading] = useState<boolean>()
  const { results, loading } = useSearch(query)

  const save = async (id: string) => {
    setSaveLoading(true)
    try {
      const { data } = await req.post('/databases', { id })
      setSaveLoading(false)
      navigate(`/dashboard/details/${data.database.id}`)
    } catch (error) {
      setSaveLoading(false)
    }
  }

  return <>
    <Layout.Content>
      <h2>Connect to Page</h2>
      <Input.Search size="large" onSearch={setQuery} placeholder="Search your table in Notion..." allowClear loading={loading} defaultValue={query} />
    </Layout.Content>

    <Layout.Content style={{ marginTop: '40px' }}>
      <h3>Search Results:</h3>
      {loading ? <Spin /> : <>
        {results?.length ? <>
          {results?.map(result => <Card
            key={result.id}
            data={result}
            onClick={() => save(result.id)}
            extra={
              <Button size="small" loading={saveLoading} type="text" shape="round"
                onClick={() => save(result.id)} icon={<ArrowRightOutlined />}>
                  Save
              </Button>
            } />)}
        </> : <Empty />}
      </>}
    </Layout.Content>
  </>
}

export default Connect