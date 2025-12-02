import { computed, ref } from 'vue'
import { CHANGE_EVENT, UPDATE_MODEL_EVENT } from '@element-plus/constants'
import { useSelect } from './useSelect'

import type { ComputedRef } from 'vue'
import type { SelectEmits, SelectProps } from './select'

export const useLazy = (
  props: SelectProps,
  emit: SelectEmits,
  modelValue: ComputedRef<any>
) => {
  const lazyValue = ref<any[]>([])
  const lazyEnable = ref(false)
  const isLazy = computed(() => {
    return props.multiple && props.lazyWriteBack && lazyEnable.value
  })
  const LazyModelValue = computed(() => {
    return isLazy.value ? lazyValue.value : modelValue.value
  })
  const lazyEmit = ((...args: Parameters<SelectEmits>) => {
    const event = args[0] as string
    if (UPDATE_MODEL_EVENT === event && isLazy.value) {
      lazyValue.value = args[1] as any
      return
    } else if (CHANGE_EVENT === event && isLazy.value) {
      return
    } else if (
      'visible-change' === event &&
      props.multiple &&
      props.lazyWriteBack
    ) {
      if (args[1]) {
        lazyValue.value = modelValue.value as any[]
        lazyEnable.value = true
      } else {
        lazyValue.value = []
        lazyEnable.value = false
      }
    }

    emit(...args)
  }) as SelectEmits

  let API: ReturnType<typeof useSelect>
  const setAPI = (_API: ReturnType<typeof useSelect>) => {
    API = _API
  }

  const clearLazy = () => {
    lazyValue.value = []
  }
  const confirmLazy = () => {
    API.toggleMenu()
    emit(UPDATE_MODEL_EVENT, lazyValue.value)
  }

  return {
    LazyModelValue,
    lazyEmit,
    setAPI,
    clearLazy,
    confirmLazy,
    lazyProps: {
      isLazy,
      clearLazy,
      confirmLazy,
    },
  }
}
