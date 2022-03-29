import { Card as BaseCard, Descriptions } from 'antd'
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
      <Descriptions column={1} labelStyle={{ fontWeight: 'bold' }}>
        <Descriptions.Item label="Properties">
          {Object.keys(data.properties).join(', ')}
        </Descriptions.Item>
        <Descriptions.Item label="Created At">
          {moment(data.created_time).local().format('lll')}
        </Descriptions.Item>
        <Descriptions.Item label="Database URL">
          <a target="_blank" href={data.url}>{data.url}</a>
        </Descriptions.Item>
        {url && <Descriptions.Item label="Form URL">
          <a target="_blank" href={url}>{url}</a>
        </Descriptions.Item>}
      </Descriptions>
    </>} />
  </BaseCard>
}

export default Card