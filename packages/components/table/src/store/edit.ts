import { getCurrentInstance, nextTick, reactive } from 'vue'

import type { DefaultRow, Table, TableProps } from '../table/defaults'
import type { TableColumnCtx } from '../table-column/defaults'

interface EditStatus {
  cell: Element | null
  rowIndex: number
  columnIndex: number
}

function useEdit<T extends DefaultRow>() {
  const instance = getCurrentInstance() as Table<T> & { props: TableProps<T> }

  const edit = reactive<EditStatus>({
    cell: null,
    rowIndex: -1,
    columnIndex: -1,
  })

  const handleDocumentClick = async (e: MouseEvent) => {
    const target = (e.composedPath()?.[0] ?? e.target) as Element
    if (!target) {
      return
    }
    await new Promise((resolve) => setTimeout(resolve))
    if (target.closest('.el-popper')) {
      return
    }
    if (edit.cell?.contains(target)) {
      return
    }
    const column = instance.store.states.columns.value[edit.columnIndex]
    const row = instance.store.states.data.value[edit.rowIndex]
    const exit = instance.props.beforeExitEdit?.({
      row,
      column,
      cell: edit.cell!,
      rowIndex: edit.rowIndex,
      columnIndex: edit.columnIndex,
      edit,
    })
    if (exit === false) {
      return
    }
    const oldEdit = {
      row,
      column,
      cell: edit.cell!,
      rowIndex: edit.rowIndex,
      columnIndex: edit.columnIndex,
      edit,
    }
    edit.rowIndex = -1
    edit.columnIndex = -1
    edit.cell = null
    document.removeEventListener('mousedown', handleDocumentClick)
    nextTick(() => instance.props.afterExitEdit?.(oldEdit))
  }

  const setEdit = <T extends DefaultRow>(
    row: T,
    column: TableColumnCtx<T>,
    cell: Element,
    rowIndex: number,
    columnIndex: number
  ) => {
    const enter = instance.props?.beforeEnterEdit?.({
      row,
      column,
      cell,
      rowIndex,
      columnIndex,
      edit,
    })
    if (enter === false) {
      return
    }
    edit.rowIndex = rowIndex
    edit.columnIndex = columnIndex
    edit.cell = cell
    document.addEventListener('mousedown', handleDocumentClick)
    nextTick(() =>
      instance.props?.afterEnterEdit?.({
        row,
        column,
        cell,
        rowIndex,
        columnIndex,
        edit,
      })
    )
  }

  return {
    setEdit,
    states: {
      edit,
    },
  }
}

export default useEdit
