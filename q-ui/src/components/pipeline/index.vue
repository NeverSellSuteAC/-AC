<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchPipelineForm"
          ref="searchPipelineForm"
          v-show="searchFilterVisible"
        >
          <el-form-item label="名称" prop="name">
            <el-input class="filter-item input-normal" v-model="searchPipelineForm.name"></el-input>
          </el-form-item>
          <el-form-item label="编号" prop="code">
            <el-input class="filter-item input-normal" v-model="searchPipelineForm.code"></el-input>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <CrudSelect v-model="searchPipelineForm.status" :dic="statusOptions"></CrudSelect>
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
      >
        <el-table-column align="center" label="所属场站">
          <template slot-scope="scope">
            <span>{{scope.row.site}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="地图数据">
          <template slot-scope="scope">
            <span>{{scope.row.data}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="名称">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="编号">
          <template slot-scope="scope">
            <span>{{scope.row.code}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="pipeline_pipeline_edit || pipeline_pipeline_del"
        >
          <template slot-scope="scope">
            <el-button icon="icon-plus-circle" title="编辑" type="text" @click="add(scope.row)"></el-button>
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
import pipelineService from "./pipeline-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_pipeline_pipeline",
  components: { CrudSelect, CrudCheckbox, CrudRadio },
  props: {
    station: {
      default: undefined
    }
  },
  data() {
    return {
      showList: [],
      //-----------------------------
      siteOptions: [],
      statusOptions: [],
      fileList: [],
      isUpload: 1,
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchPipelineForm: {
        site: "",
        name: "",
        code: "",
        status: ""
      },
      listQuery: {
        page: 1,
        size: 20
      },
      form: {
        description: undefined,
        site: undefined,
        data: undefined,
        name: undefined,
        code: undefined,
        status: undefined
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
      dialogStatus: "create",
      textMap: {
        update: "编辑管线",
        create: "创建管线"
      },
      tableKey: 0
    };
  },
  computed: {
    ...mapGetters(["permissions", "dicts"])
  },
  watch: {
    station() {
      this.getList();
    }
  },
  filters: {},
  created() {
    this.getList();
    this.pipeline_pipeline_edit = this.permissions["pipeline_pipeline_edit"];
    this.pipeline_pipeline_del = this.permissions["pipeline_pipeline_del"];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.statusOptions = this.dicts["line_status"];
    this.getSiteOptions();
  },
  methods: {
    setData() {
      this.$emit("setPipelineData", this.showList);
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
    getSiteOptions() {
      this.siteOptions = [
        { label: "场站1", value: "1" },
        { label: "场站2", value: "2" }
      ];
    },
    typeChange(data) {
      this.isUpload = data;
      this.form.data = "";
      this.fileList = [];
    },
    handleSuccess(res) {
      this.form.data = JSON.stringify(res.data);
    },
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "site",
          value: this.station,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "name",
          value: this.searchPipelineForm.name,
          operate: "like",
          attrType: "String"
        },
        {
          fieldName: "code",
          value: this.searchPipelineForm.code,
          operate: "like",
          attrType: "String"
        },
        {
          fieldName: "status",
          value: this.searchPipelineForm.status,
          operate: "eq",
          attrType: "String"
        }
      ]);
      pipelineService.page(this.listQuery).then(response => {
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
      this.$refs["searchPipelineForm"].resetFields();
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
        pipelineService.find(row.id).then(response => {
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
          pipelineService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该管线, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        pipelineService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.form = {
        description: "",
        site: "",
        data: "",
        name: "",
        code: "",
        status: ""
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