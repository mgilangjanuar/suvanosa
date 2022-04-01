import { Card as BaseCard, Layout, Typography } from 'antd'
import moment from 'moment'
import { FC, ReactElement } from 'react'

interface Props {
  data: any,
  name?: string,
  url?: string,
  onClick?: () => void,
  extra?: ReactElement
}

const Card: FC<Props> = ({ name, data, url, onClick, extra }) => {
  const titleText = name || data.title[0].plain_text
  return <BaseCard title={onClick ? <Layout.Content style={{ cursor: 'pointer' }} onClick={onClick}>{titleText}</Layout.Content> : titleText} extra={extra}>
    <BaseCard.Meta description={<>
      <Typography.Paragraph>
        <Typography.Text strong>Properties: </Typography.Text>
        <Typography.Text italic>{Object.keys(data.properties).join(', ')}</Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong>Created At: </Typography.Text>
        <Typography.Text>{moment(data.created_time).local().format('lll')}</Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong>Database URL: </Typography.Text>
        <Typography.Text ellipsis><a target="_blank" href={data.url}>{data.url}</a></Typography.Text>
      </Typography.Paragraph>
      {url && <Typography.Paragraph>
        <Typography.Text strong>Form URL: </Typography.Text>
        <Typography.Text ellipsis><a target="_blank" href={url}>{url}</a></Typography.Text>
      </Typography.Paragraph>}
    </>} />
  </BaseCard>
}

export default Card