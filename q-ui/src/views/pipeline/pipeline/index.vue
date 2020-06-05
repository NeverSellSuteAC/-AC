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
          <el-form-item label="所属场站" prop="site">
            <!-- <CrudSelect v-model="searchPipelineForm.site" :dic="siteOptions"></CrudSelect> -->
            <el-select
              v-model="searchPipelineForm.site"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteStationMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in stationOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
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
        <div class="table-menu-left">
          <el-button-group>
            <el-button
              size="mini"
              v-if="pipeline_pipeline_edit"
              class="filter-item"
              @click="handleEdit"
              type="primary"
              icon="edit"
            >添加</el-button>
          </el-button-group>
        </div>
        <div class="table-menu-right">
          <el-button
            icon="el-icon-search"
            circle
            size="mini"
            @click="searchFilterVisible= !searchFilterVisible"
          ></el-button>
        </div>
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
            <el-button
              v-if="pipeline_pipeline_edit"
              icon="icon-edit"
              title="编辑"
              type="text"
              @click="handleEdit(scope.row)"
            ></el-button>
            <el-button
              v-if="pipeline_pipeline_del"
              icon="icon-delete"
              title="删除"
              type="text"
              @click="handleDelete(scope.row)"
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
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :model="form" ref="form" label-width="100px">
          <el-form-item
            label="名称"
            prop="name"
            :rules="[{required: true,message: '请输入名称'},{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]"
          >
            <el-input v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item
            label="编号"
            prop="code"
            :rules="[{required: true,message: '请输入编号'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <el-input v-model="form.code"></el-input>
          </el-form-item>
          <!-- <el-form-item
            label="所属场站"
            prop="site"
            :rules="[{required: true,message: '请输入所属场站'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <CrudSelect v-model="form.site" :dic="siteOptions"></CrudSelect>
          </el-form-item>-->
          <!--  -->
          <el-form-item
            label="场站"
            prop="site"
            :rules="[{required: true,message: '请选择所属场站'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <el-select
              v-model="form.site"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteStationMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in stationOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!--  -->
          <!-- <el-form-item label="地图数据" prop="data" :rules="[{required: true,message: '请输入地图数据'},]"> -->
          <el-form-item label="地图数据" v-show="!form.data">
            <el-radio-group @change="typeChange" v-model="isUpload">
              <el-radio-button label="1">上传</el-radio-button>
              <el-radio-button label="2">绘制</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="导入" v-if="isUpload=='1'" v-show="!form.data">
            <el-upload
              class="upload-demo"
              :action="baseUrl+'/pipeline/pipeline/upload'"
              multiple
              :limit="1"
              :on-success="handleSuccess"
              :file-list="fileList"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传Excel文件，且不超过2MB</div>
            </el-upload>
          </el-form-item>
          <el-form-item label="地图数据" prop="name" v-else v-show="!form.data">
            <el-input v-model="form.data"></el-input>
          </el-form-item>

          <el-form-item :label="form.data?'地图数据':''" v-if="form.data">
            <el-button type="primary">地图数据预览</el-button>
            <el-button type="primary" @click="typeChange(isUpload)">清除数据</el-button>
          </el-form-item>

          <el-form-item
            label="备注"
            prop="description"
            :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]"
          >
            <el-input type="textarea" v-model="form.description"></el-input>
          </el-form-item>
          <el-form-item
            label="状态"
            prop="status"
            :rules="[{required: true,message: '请输入状态'},{min: 0,max: 1,message: '长度在 0 到 1 个字符'},]"
          >
            <CrudSelect v-model="form.status" :dic="statusOptions"></CrudSelect>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancel()">取 消</el-button>
          <el-button type="primary" @click="save()">保 存</el-button>
        </div>
      </el-dialog>
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
  data() {
    return {
      siteOptions: [],
      stationOptions: [],
      selectLoading: false,
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
  filters: {},
  created() {
    this.getList();
    this.pipeline_pipeline_edit = this.permissions["pipeline_pipeline_edit"];
    this.pipeline_pipeline_del = this.permissions["pipeline_pipeline_del"];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.statusOptions = this.dicts["line_status"];
    this.getSiteOptions();
    this.remoteStationMethod("");
  },
  methods: {
    // ---------------------------------------------
    remoteStationMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: query,
          operate: "like"
        }
      ]);
      pipelineService.stationPage(listQuery).then(response => {
        // this.stationOptions = this.getStationOptions(response.data.records);
        this.stationOptions = response.data.records;
        this.selectLoading = false;
      });
    },
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
          value: this.searchPipelineForm.site,
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
      this.typeChange(1);
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