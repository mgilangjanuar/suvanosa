import { SortableContainer } from 'react-sortable-hoc'
import SortableItem from './SortableItem'

const SortableList = SortableContainer(({ items }: any) => {
  return <div>{items.map((value: any, index: number) => <SortableItem key={index} index={index} value={value} />)}</div>
})

export default SortableList