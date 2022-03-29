import { notification } from 'antd'
import { FC, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import useSWR from 'swr'
import { fetcher } from '../../utils/Fetcher'

const Forms: FC = () => {
  const navigate = useNavigate()
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

  return <></>
}

export default Forms