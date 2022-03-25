import { Card as BaseCard, Typography } from 'antd'
import moment from 'moment'
import { FC, ReactElement } from 'react'

interface Props {
  data: any,
  name?: string,
  url?: string,
  extra?: ReactElement
}

const Card: FC<Props> = ({ name, data, url, extra }) => {
  return <BaseCard title={name || data.title[0].plain_text} extra={extra}>
    <BaseCard.Meta description={<>
      <Typography.Paragraph>
        <Typography.Text strong>Properties: </Typography.Text>
        <Typography.Text>{Object.keys(data.properties).join(', ')}</Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong>Created At: </Typography.Text>
        <Typography.Text>{moment(data.created_time).local().format('lll')}</Typography.Text>
      </Typography.Paragraph>
      <Typography.Paragraph>
        <Typography.Text strong>Database URL: </Typography.Text>
        <Typography.Text><a target="_blank" href={data.url}>{data.url}</a></Typography.Text>
      </Typography.Paragraph>
      {url && <Typography.Paragraph>
        <Typography.Text strong>Form URL: </Typography.Text>
        <Typography.Text><a target="_blank" href={url}>{url}</a></Typography.Text>
      </Typography.Paragraph>}
    </>} />
  </BaseCard>
}

export default Card