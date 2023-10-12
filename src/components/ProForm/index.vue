<script setup lang="ts">
import { FormInstance } from 'element-plus';
import { ColumnProps } from '../ProTable/index.vue';
import { Ref } from 'vue';
// 表单属性    el-form  全部属性  会传给 form
export interface ProFormProps {
  // 配置表单项数据  ColumnProps 中  formProp 可配置表单项
  columns: ColumnProps[];
  // 表单value
  formData: { [key: string]: any };
  // 是否垂直展示
  vertical?: boolean;
}

// 配置表单项属性
export interface ProFormItemProps {
  // 表单项的 组件名称
  el: string;
  // 所有选择框类似组件的 data  options
  source?: any[] | (() => Promise<any>) | Ref<any>;
  // 可取代 ColumnProps中 prop 作为 表单项的标识  如果没有key 默认用 column中的prop
  key?: string;
  // 表单项 子组件 的名称  如 select 的 option
  childEl?: string;
  // 其它所有表单项的属性  input select ..... 会透传给 表单项
  [key: string]: any;
}

let props = defineProps<ProFormProps>();

let { columns, formData } = toRefs(props);

// 表单项 data options 的 数据对象  表单标识为key
const sourceMap = ref<any>({});

// 表单Ref 可操作 表单 相关方法  导出给父组件使用
const form = ref<FormInstance>();

// 当前组件所有的slot
const slots = useSlots();

watchEffect(() => {
  columns.value.map(async (item) => {
    if (item.formProp) {
      // 判断外部提供的数据源是 对象 还是方法
      if (typeof item.formProp.source === 'object') {
        if (isRef(item.formProp.source)) {
          sourceMap.value[item.formProp.key ?? item.prop!] = item.formProp.source.value;
        } else {
          sourceMap.value[item.formProp.key ?? item.prop!] = item.formProp.source;
        }
      } else if (typeof item.formProp.source === 'function') {
        sourceMap.value[item.formProp.key ?? item.prop!] = await item.formProp?.source();
      }
    }
  });
});

onMounted(() => {});

const onInputFocus = (e: Event, column: ColumnProps) => {
  column.formProp?.clickFunc && column.formProp.clickFunc(column);
};
const onInputchange = (e: Event, column: ColumnProps) => {
  if (column.formProp?.changeData) {
    props.formData[column.formProp.key ?? column.prop!] = column.formProp.changeData(e);
  }
};
// 导出属性或方法给外部使用
defineExpose({
  form
});
</script>

<template>
  <div class="ProForm">
    <!-- 表单 -->
    <el-form ref="form" :model="formData" v-bind="$attrs">
      <div class="ProForm__container">
        <div class="ProForm__item-container" :class="[vertical && 'vertical']">
          <template v-for="column in columns" :key="column.prop">
            <!-- 表单项 -->
            <el-form-item
              class="form-item"
              v-bind="column.formProp"
              :prop="column.formProp?.key ?? column.prop"
              :label="column.label"
              :style="{
                width: (column.formProp?.width ?? 300) + 'px'
              }"
            >
              <!-- 自定义表单组件 -->
              <template #default="scope" v-if="slots[column.formProp?.key ?? column.prop!]">
                <slot :name="column.formProp?.key" :row="scope.row"></slot>
              </template>
              <!-- 动态表单组件 -->
              <component
                :is="`el-${column.formProp?.el}`"
                v-bind="column.formProp"
                :placeholder="
                  (column.formProp?.el === 'input' ? '请输入' : '请选择') + column.label
                "
                v-model="formData[column.formProp?.key ?? column.prop!]"
                start-placeholder="请选择开始时间"
                end-placeholder="请选择结束时间"
                :options="sourceMap[column.formProp?.key ?? column.prop!]"
                :data="sourceMap[column.formProp?.key ?? column.prop!]"
                @click="(e: any) => onInputFocus(e, column)"
                @change="(e: any) => onInputchange(e, column)"
              >
                <!-- 动态表单子组件 -->
                <template #default v-if="column.formProp?.childEl">
                  <component
                    :is="`el-${column.formProp.childEl}`"
                    v-for="item in sourceMap[column.formProp?.key ?? column.prop!]"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </component>
                </template>
              </component>
            </el-form-item>
          </template>
        </div>
        <!-- 表单最后按钮 -->
        <div :class="['ProForm__actions', columns.length <= 2 && 'row_actions']">
          <slot name="FormFooter"></slot>
        </div>
      </div>
    </el-form>
  </div>
</template>
<style>
.ProForm {
  .el-select {
    width: 100%;
  }
  .el-input {
    width: 100% !important;
  }
}
</style>
<style scoped lang="scss">
// ::deep .el-select {
//   width: 100% !important;
// }
.ProForm {
  &__container {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    flex-wrap: wrap;
  }

  &__item-container {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    .form-item {
      width: 300px;
      margin-left: 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
    }
  }
  .vertical {
    display: flex;
    flex-direction: column !important;
  }

  &__actions {
    width: 100%;
    display: flex;
    flex-direction: row;
    justify-content: flex-end;
  }
  .row_actions {
    width: auto;
  }
}
</style>
