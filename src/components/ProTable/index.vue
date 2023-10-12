<script setup lang="ts">
import ProForm from '../ProForm/index.vue';
import Pagination from '../Pagination/index.vue';
import { useTableRequest } from '@/service/hooks';
import { PromiseTableResult } from '@/service/types';
import { FormInstance, type TableInstance } from 'element-plus';
import { TableColumnCtx } from 'element-plus';
import { ProFormItemProps } from '../ProForm/index.vue';

// 列表 每一列的数据 属性  继承 el-table-column 全部属性 会透传给 column
export interface ColumnProps<T = any> extends Partial<TableColumnCtx<T>> {
  // 是否在列表内显示 如只需要搜索 不需要展示 可设置此字段
  hideInTable?: boolean;
  // 字段如需搜索 此字段 可设置 表单项的 属性
  formProp?: ProFormItemProps;

  // 是否搜索
  search?: boolean;
  // 是否在新增form表单中隐藏
  hideInForm?: boolean;
}

// 列表属性 继承 el-table 全部属性 会透传给 table
interface ProTableProps {
  // 需要请求的一个方法 外面传入  需返回 PromiseTableResult 类型
  requestFunc: (params: any) => PromiseTableResult<any>;
  // 原始请求列表参数
  params: any;
  // 列表每列 字段 属性数组
  columns: ColumnProps[];
  // 搜索字段过滤
  searchDataFilter?: (values: any) => any;
  // 处理表格数据
  filterTableData?: (data: any) => any;
  // 列表数据
  listData?: any[];
}

// 当前组件所有的slot
const slots = useSlots();

const state = reactive({
  // 搜索表单的value
  filterOptions: {}
});

const { filterOptions } = toRefs(state);
// 搜索表单组件的Ref
const formRef = ref<{ form: FormInstance }>();

// 当前table的Ref 可以导出给外面使用  外面可以利用此ref 使用table相关方法
const table = ref<TableInstance>();

let props = defineProps<ProTableProps>();

// 列表列的配置数据
let { columns, params, listData } = toRefs(props);

//筛选出搜索的配置数据
const searchColumns = ref<ColumnProps[]>([]);
watchEffect(() => {
  searchColumns.value = [];
  columns.value.forEach((item) => {
    if (item.search) {
      let tmp = { ...item } as any;
      tmp.formProp = { ...item.formProp, required: false };
      searchColumns.value.push(tmp);
    }
  });
});

watch(params, () => {
  loadData();
});

// useTableRequest 返回列表数据 与 page相关数据可与pagination 绑定 返回字段 都是响应式
let { loadData, list, loading, curPage, pageSize, total, reset } = useTableRequest(
  props.requestFunc,
  props.params,
  filterOptions,
  props.filterTableData
);

onMounted(async () => {
  if (listData?.value) {
    loading.value = false;
    list.value = listData.value;
  } else {
    await loadData();
  }
});

const search = async () => {
  curPage.value = 1;
  if (props.searchDataFilter) {
    filterOptions.value = props.searchDataFilter(filterOptions.value);
  }
  console.log('table search params === ', filterOptions.value);
  await loadData();
};

// 刷新列表
const reloadTable = async () => {
  await loadData();
};

const changeFilterOptions = (data: any) => {
  filterOptions.value = { ...data };
};

// 导出给父组件使用的属性  需要导出的数据 可在此添加
defineExpose({
  table,
  reloadTable,
  changeFilterOptions
});
</script>

<template>
  <div class="ProTable">
    <!-- 搜索表单 -->
    <div class="ProTable__search" v-if="searchColumns.length">
      <ProForm ref="formRef" :form-data="filterOptions" :columns="searchColumns">
        <template #FormFooter>
          <el-form-item>
            <el-button type="primary" @click="search">搜索</el-button>
            <el-button @click="reset">重置</el-button>
          </el-form-item>
        </template>
      </ProForm>
    </div>
    <!-- 列表 头部 操作 -->
    <div class="table-header" v-if="slots.tableHeader">
      <slot name="tableHeader"></slot>
    </div>
    <div class="table-container">
      <!-- 列表 -->
      <div class="main-table">
        <el-table ref="table" v-bind="$attrs" v-loading="loading" :data="list">
          <!-- 渲染每列数据 -->
          <template v-for="column in columns" :key="column.prop">
            <!-- 如果是选择 -->
            <el-table-column
              v-bind="column"
              v-if="column.type === 'selection' || column.type === 'index'"
              align="center"
            ></el-table-column>
            <!-- 如果有折叠 -->
            <el-table-column v-bind="column" v-if="column.type === 'expand'">
              <template #default="scope">
                <slot :name="column.type" :row="scope.row"></slot>
              </template>
            </el-table-column>
            <!-- 一般情况 -->
            <el-table-column
              v-bind="column"
              v-if="!column.type && column.prop && !column.hideInTable"
              align="center"
            >
              <!-- 如果需要自定义 列的头部 -->
              <template #header v-if="slots[`${column.prop}Header`]">
                <slot :name="`${column.prop}Header`" :row="column"></slot>
              </template>
              <!-- 如果需要自定义 当前列的内容 -->
              <template #default="scope" v-if="slots[column.prop]">
                <slot :name="column.prop" :row="scope.row"></slot>
              </template>
            </el-table-column>
          </template>
        </el-table>
      </div>
      <!-- 分页组件 -->
      <div class="main-page">
        <pagination
          v-if="total > 0"
          :total="total"
          v-model:page="curPage"
          v-model:limit="pageSize"
          @pagination="loadData"
        />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ProTable {
  display: flex;
  flex-direction: column;
  overflow: visible;
  width: 100%;
  height: 100%;

  &__search {
    padding: 20px;
    border-radius: 5px;
    box-shadow: 0px 0px 4px 4px rgba($color: #000000, $alpha: 0.05);
    margin-bottom: 10px;

    flex: 0 0 auto;
    background-color: white;
  }

  .table-header {
    background-color: white;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
    margin-bottom: 10px;
    padding: 10px;
    box-shadow: 0px 0px 6px 4px rgba(0, 0, 0, 0.05);
  }

  .table-container {
    display: flex;
    flex-direction: column;
    overflow: hidden;
    box-shadow: 0px 0px 6px 4px rgba(0, 0, 0, 0.05);
    flex: 1 1 auto;
    background-color: white;
  }

  .main-table {
    overflow: scroll;
    height: 100%;
    box-sizing: border-box;
    padding: 10px;
  }
}
</style>
