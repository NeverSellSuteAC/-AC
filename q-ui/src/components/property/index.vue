<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchPropertyInfoForm"
          ref="searchPropertyInfoForm"
          v-show="searchFilterVisible"
        >
          <el-form-item label="名称" prop="name">
            <el-input class="filter-item input-normal" v-model="searchPropertyInfoForm.name"></el-input>
          </el-form-item>
          <el-form-item label prop="status">
            <CrudSelect
              class="filter-item input-normal"
              v-model="searchPropertyInfoForm.status"
              :dic="statusOptions"
            />
          </el-form-item>
          <el-form-item label prop="createdDate">
            <el-date-picker
              class="filter-item input-normal"
              value-format="yyyy-MM-dd"
              placeholder="创建时间"
              v-model="searchPropertyInfoForm.createdDate"
            />
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">查询</el-button>
            <el-button size="small" @click="searchReset" icon="icon-rest">重置</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 表格功能列 -->
      <div class="table-menu">
        <el-tag
          class="pipeline-tag"
          v-for="tag in showList"
          :key="tag.name"
          closable
          :type="tag.type"
          @close="handleClose(tag)"
        >{{tag.name}}</el-tag>
      </div>
      <el-table
        :key="tableKey"
        @sort-change="sortChange"
        :data="list"
        v-loading="listLoading"
        element-loading-text="加载中..."
        fit
        highlight-current-row
        :row-class-name="tableRowClassName"
      >
        <el-table-column :formatter="formatter" label="序号"></el-table-column>
        <el-table-column align="center" label="资产名称">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="资产编号">
          <template slot-scope="scope">
            <span>{{scope.row.code}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="资产类型">
          <template slot-scope="scope">
            <span>{{scope.row.type}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="资产状态">
          <template slot-scope="scope">
            <span>{{scope.row.delFlag}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="资产备注">
          <template slot-scope="scope">
            <span>{{scope.row.remark}}</span>
          </template>
        </el-table-column>
        <!--<el-table-column align="center" label="经度">
          <template slot-scope="scope">
        <span>{{scope.row.lng}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="纬度">
          <template slot-scope="scope">
        <span>{{scope.row.lat}}</span>
          </template>
        </el-table-column>-->
        <!--<el-table-column align="center" label="场站">
          <template slot-scope="scope">
        <span>{{scope.row.sid}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="创建者">
          <template slot-scope="scope">
            <span>{{scope.row.createdBy}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="创建时间">
          <template slot-scope="scope">
            <span>{{scope.row.createdDate}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <span>{{isFlag(scope.row.status)}}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="property_propertyInfo_edit || property_propertyInfo_del"
        >
          <template slot-scope="scope">
            <el-button
              icon="icon-plus-circle"
              title="编辑"
              type="text"
              @click="add(scope.row)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>

      <div v-show="!listLoading" class="pagination-container">
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page.sync="listQuery.page"
          :page-sizes="[10,20,30, 50]"
          :page-size="listQuery.size"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
      <el-row class="add-row">
        <el-col :offset="20">
          <el-button type="primary" @click="setData">确认</el-button>
        </el-col>
      </el-row>
    </basic-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import propertyInfoService from "./property-info-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_property_propertyInfo",
  components: { CrudSelect, CrudCheckbox, CrudRadio },
  props: {
    station: {
      default: undefined
    }
  },
  watch: {
    station() {
      this.getList();
    }
  },
  data() {
    return {
      showList: [],
      //-----------------------------
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchPropertyInfoForm: {},
      listQuery: {
        page: 1,
        size: 20
      },
      form: {
        description: undefined,
        name: undefined,
        code: undefined,
        type: undefined,
        lng: undefined,
        lat: undefined,
        sid: undefined,
        remark: undefined
      },
      validateUnique: (rule, value, callback) => {
        validate.isUnique(rule, value, callback, this.form.id);
      },
      validateNumber: (rule, value, callback) => {
        validate.isNumber(rule, value, callback);
      },
      validateDigits: (rule, value, callback) => {
        validate.isDigits(rule, value, callback);
      },
      delFlagOptions: undefined,
      typeOptions: undefined,
      typeOptionsMap: undefined,
      sidOptions: undefined,
      dialogStatus: "create",
      statusOptions: [
        { value: "", label: "全部状态" },
        { value: 1, label: "启用" },
        { value: 0, label: "停用" }
      ],
      textMap: {
        update: "编辑资产信息",
        create: "创建资产信息"
      },
      tableKey: 0
    };
  },
  computed: {
    ...mapGetters(["permissions", "dicts"])
  },
  filters: {},
  created() {
    this.getPropertyTypeAll();
    this.getList();
    this.property_propertyInfo_edit = this.permissions[
      "property_propertyInfo_edit"
    ];
    this.property_propertyInfo_del = this.permissions[
      "property_propertyInfo_del"
    ];
    this.delFlagOptions = this.dicts["sys_flag"];
  },
  methods: {
    setData() {
      this.$emit("setPropertyData", this.showList);
    },
    handleClose(tag) {
      let index = this.showList.indexOf(tag);
      this.showList.splice(index, 1);
    },
    add(row) {
      let index = this.showList.indexOf(row);
      if (index >= 0) {
        this.$message.error("请勿重复添加!");
        return;
      }
      this.showList.push(row);
    },
    //--------------------------------------------
    isFlag(flag) {
      if (flag == 0) {
        return "停用";
      }
      return "启用";
    },
    getPropertyTypeAll() {
      propertyInfoService.getPropertyTypeAll().then(res => {
        this.typeOptions = res.data;
        this.typeOptionsMap = new Map(this.typeOptions.map(i => [i.value, i]));
      });
    },
    tableRowClassName({ row, rowIndex }) {
      // 把每一行的索引放进row
      row.rowIndex = rowIndex;
    },
    formatter(row, column, cellValue, index) {
      //放回索引值
      return this.listQuery.size * (this.listQuery.page - 1) + 1 + row.rowIndex;
    },
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: this.searchPropertyInfoForm.name,
          operate: "like",
          attrType: "String"
        },
        {
          fieldName: "status",
          value: this.searchPropertyInfoForm.status,
          operate: "eq",
          attrType: "Integer"
        },
        {
          fieldName: "sid",
          value: this.station,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "createdDate",
          value: this.searchPropertyInfoForm.createdDate,
          operate: "like",
          attrType: "String"
        }
      ]);
      propertyInfoService.page(this.listQuery).then(response => {
        this.list = response.data.records;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    sortChange(column) {
      if (column.order == "ascending") {
        this.listQuery.ascs = column.prop;
        this.listQuery.descs = undefined;
      } else {
        this.listQuery.descs = column.prop;
        this.listQuery.ascs = undefined;
      }
      this.getList();
    },
    searchReset() {
      this.$refs["searchPropertyInfoForm"].resetFields();
      this.getList();
    },
    handleFilter() {
      this.listQuery.page = 1;
      this.getList();
    },
    handleSizeChange(val) {
      this.listQuery.size = val;
      this.getList();
    },
    handleCurrentChange(val) {
      this.listQuery.page = val;
      this.getList();
    },
    handleEdit(row) {
      this.resetForm();
      this.dialogStatus =
        row && !validate.checkNull(row.id) ? "update" : "create";
      if (this.dialogStatus == "create") {
        this.dialogFormVisible = true;
      } else {
        propertyInfoService.find(row.id).then(response => {
          this.form = response.data;
          this.form.delFlag = validate.toString(this.form.delFlag);
          this.dialogFormVisible = true;
        });
      }
    },
    cancel() {
      this.dialogFormVisible = false;
      this.$refs["form"].resetFields();
    },
    save() {
      const set = this.$refs;
      set["form"].validate(valid => {
        if (valid) {
          propertyInfoService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该资产信息, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        propertyInfoService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.form = {
        description: "",
        name: "",
        code: "",
        type: "",
        lng: "",
        lat: "",
        sid: "",
        remark: ""
      };
      this.$refs["form"] && this.$refs["form"].resetFields();
    }
  }
};
</script>

<style scoped>
.add-row {
  margin-top: 20px;
}
</style>