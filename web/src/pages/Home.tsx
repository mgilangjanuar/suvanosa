import { Button, Layout } from 'antd'
import { FC } from 'react'
import useSwrImmutable from 'swr/immutable'
import { fetcher } from '../utils/Fetcher'

const Home: FC = () => {
  const { data } = useSwrImmutable('/auth/url', fetcher)
  return <Layout.Content>
    <Button href={data?.url}>Login</Button>
  </Layout.Content>
}

export default Home