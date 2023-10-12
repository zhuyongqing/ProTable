import { PromiseTableResult, PromiseBaseResult, LoadingResultType, RunFuncType } from './types';
import { ref, onMounted, type Ref } from 'vue';
// 返回loading data run error
export const useRequest = <T>(
  func: (params: any) => PromiseBaseResult<T>,
  params?: any,
  auto?: boolean
): LoadingResultType<T> => {
  const data = ref();
  const loading = ref(false);
  const err = ref(null);
  const run = async (params: any) => {
    loading.value = true;
    const [error, res] = await func(params);
    data.value = res;
    err.value = error;
    loading.value = false;
    return [err, data];
  };
  onMounted(() => {
    if (auto) {
      run(params);
    }
  });
  return { run: run as RunFuncType, data, err, loading };
};

// 列表页面 通用 请求 hook
export const useTableRequest = <T>(
  func: (params: any) => PromiseTableResult<T>,
  params?: any,
  filterOptions?: Ref<any>,
  filterTableData?: (data: any) => any
) => {
  const list = ref();
  const loading = ref(false);
  const err = ref(null);
  const curPage = ref(1);
  const total = ref(0);
  const pageSize = ref(10);

  const loadData = async () => {
    loading.value = true;
    const [err, data] = await func({
      pageNum: curPage.value,
      pageSize: pageSize.value,
      ...params,
      ...filterOptions?.value
    });
    list.value = data?.list ?? data;
    if (filterTableData) {
      list.value = filterTableData(list.value);
    }
    total.value = data?.total ?? 0;
    loading.value = false;
  };
  // 重置
  const reset = () => {
    if (!filterOptions || !filterOptions?.value) return;
    const keys = Reflect.ownKeys(filterOptions?.value);
    filterOptions.value = {};
    keys.forEach((key) => {
      Reflect.set(filterOptions.value!, key, undefined);
    });
    loadData();
  };

  return { loadData, list, loading, err, total, pageSize, curPage, reset };
};
