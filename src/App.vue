<script setup lang="ts">
import ProTable, { ColumnProps } from './components/ProTable/index.vue';
import ProForm from './components/ProForm/index.vue';
import { getUserList, User } from '@/api/user';
let sourceData = ref([] as any[]);
let columns: Ref<ColumnProps<User>[]> = ref([
  {
    label: '姓名',
    prop: 'name',
    align: 'center',
    search: true,
    formProp: {
      required: true,
      el: 'input'
    }
  },
  {
    label: '手机号',
    prop: 'phone',
    align: 'center',
    search: true,
    formProp: {
      required: true,
      el: 'input'
    }
  },
  {
    label: '年龄',
    prop: 'age',
    align: 'center',
    search: false,
    formProp: {
      required: true,
      el: 'input'
    }
  },
  {
    label: '出生日期',
    prop: 'birDate',
    align: 'center',
    search: true,
    hideInForm: true,
    formProp: {
      required: true,
      el: 'date-picker',
      type: 'daterange',
      'value-format': 'YYYY-MM-DD'
    }
  },
  {
    label: '出生日期',
    prop: 'birDate',
    align: 'center',
    search: false,
    hideInTable: true,
    formProp: {
      required: true,
      el: 'date-picker',
      'value-format': 'YYYY-MM-DD'
    }
  },
  {
    label: '状态',
    prop: 'statusStr',
    align: 'center',
    search: true,
    formProp: {
      required: true,
      el: 'select',
      key: 'status',
      childEl: 'option',
      source: sourceData,
      clearable: true
    }
  },
  {
    label: '操作',
    prop: 'action',
    align: 'center'
  }
]);

const state = reactive({
  dialogModel: {
    dialogVisiable: false,
    title: ''
  },
  formModel: {} as User,
  proFormRef: {} as any
});

let { dialogModel, formModel, proFormRef } = toRefs(state);

// 新增表单的配置项 与 校验规则
let formColumns = ref(columns.value.filter((item) => item.formProp && !item.hideInForm));
const rules = ref({} as any);
formColumns.value.forEach((item: any) => {
  rules.value[item.formProp.key || item.prop] = [
    {
      required: item.formProp.required,
      message: item.formProp.el === 'input' ? `请输入${item.label}` : `请选择${item.label}`,
      trigger: 'blur'
    }
  ];
});

const handleEdit = (user: User) => {};
const handleDelete = (user: User) => {};
const handleAdd = () => {
  dialogModel.value.title = '新增';
  dialogModel.value.dialogVisiable = true;
};
const dialogConfirm = () => {
  let form = proFormRef.value.form || proFormRef.value;
  form.validate(async (res: boolean | any) => {
    if (res) {
      console.log('proform res ===', res, formModel.value);
    }
  });
};

onMounted(() => {
  setTimeout(() => {
    // select 数据 测试
    sourceData.value = [
      { label: '在线', value: 1 },
      { label: '离线', value: 0 }
    ];
  }, 2000);
});
</script>

<template>
  <div class="Page-container">
    <pro-table stripe border :columns="columns" :request-func="getUserList" :params="{}">
      <!-- 头部按钮 -->
      <template #tableHeader>
        <el-button @click="handleAdd" type="primary">新增</el-button>
      </template>

      <!-- 自定义单元格 -->
      <template #phone="scope: { row: User | any }">
        <el-tag>{{ scope.row.phone }}</el-tag>
      </template>

      <template #statusStr="scope: { row: User | any }">
        <el-tag :type="scope.row.status === 1 ? 'success' : 'danger'">{{
          scope.row.statusStr
        }}</el-tag>
      </template>
      <!-- 操作 -->
      <template #action="scope: { row: User | any }">
        <el-button @click="() => handleEdit(scope.row)">编辑</el-button>
        <el-button @click="() => handleDelete(scope.row)">删除</el-button>
      </template>
    </pro-table>
    <el-dialog v-model="dialogModel.dialogVisiable" :width="500" :title="dialogModel.title">
      <pro-form
        ref="proFormRef"
        :columns="formColumns"
        :form-data="formModel"
        :vertical="true"
        :rules="rules"
        :label-width="'110px'"
      >
      </pro-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogModel.dialogVisiable = false">取消</el-button>
          <el-button type="primary" @click="dialogConfirm"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.Page-container {
  width: 100vw;
  height: 100vh;
  box-sizing: border-box;
  padding: 40px;
}
</style>
