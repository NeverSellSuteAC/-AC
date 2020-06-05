<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchPatrolLineForm"
          ref="searchPatrolLineForm"
          v-show="searchFilterVisible"
        >
          <el-form-item label="名称" prop="name">
            <el-input class="filter-item input-normal" v-model="searchPatrolLineForm.name"></el-input>
          </el-form-item>
          <el-form-item label="是否是模板" prop="isTemp">
            <CrudSelect v-model="searchPatrolLineForm.isTemp" :dic="isTempOptions"></CrudSelect>
          </el-form-item>
          <el-form-item label="编号" prop="code">
            <el-input class="filter-item input-normal" v-model="searchPatrolLineForm.code"></el-input>
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
              v-if="patrolline_patrolLine_edit"
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
        <!-- <el-table-column align="center" label="地图数据">
          <template slot-scope="scope">
            <span>{{scope.row.data}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="是否是模板">
          <template slot-scope="scope">
            <el-tag>{{scope.row.isTempText}}</el-tag>
          </template>
        </el-table-column>

        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="patrolline_patrolLine_edit || patrolline_patrolLine_del"
        >
          <template slot-scope="scope">
            <el-button
              v-if="patrolline_patrolLine_edit"
              icon="icon-edit"
              title="编辑"
              type="text"
              @click="handleEdit(scope.row)"
            ></el-button>
            <el-button
              v-if="patrolline_patrolLine_del"
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
            :rules="[{required: true,message: '请输入名称'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'},]"
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
          <!-- <el-form-item label="地图数据" prop="data" :rules="[{required: true,message: '请输入地图数据'},]">
            <el-input v-model="form.data"></el-input>
          </el-form-item>-->
          <!-- -------- -->
          <el-form-item
            label="地图数据"
            v-show="!form.data"
            :rules="[{required: true,message: '清添加地图数据'}]"
            prop="data"
          >
            <el-radio-group @change="typeChange" v-model="isUpload">
              <el-radio-button label="1">上传</el-radio-button>
              <el-radio-button label="2">绘制</el-radio-button>
              <el-radio-button label="3">模板</el-radio-button>
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
          <el-form-item label v-else-if="isUpload=='2'" v-show="!form.data">
            <el-input v-model="form.data"></el-input>
          </el-form-item>
          <el-form-item label v-else-if="isUpload=='3'" v-show="!form.data">
            <el-select
              v-model="test"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="selectLoading"
              @change="mapDataChange"
            >
              <el-option
                v-for="item in mapOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              ></el-option>
            </el-select>
          </el-form-item>

          <el-form-item :label="form.data?'地图数据':''" v-if="form.data">
            <el-button type="primary">地图数据预览</el-button>
            <el-button type="primary" @click="form.data='';fileList=[]">清除数据</el-button>
          </el-form-item>
          <!--  -->
          <el-form-item label="场站">
            <el-select
              v-model="form.station"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteStationMethod"
              :loading="selectLoading"
              @change="stationChange"
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
          <el-form-item label v-if="form.station">
            <el-button @click="pipelineDialogOpen" type="primary">关联管线</el-button>
          </el-form-item>
          <el-form-item label="管线" v-if="form.pipelineData">
            <el-tag
              class="pipeline-tag"
              v-for="tag in form.pipelineData"
              :key="tag.name"
              :type="tag.type"
            >{{tag.name}}</el-tag>
          </el-form-item>
          <!--  -->
          <el-form-item label v-if="form.station">
            <el-button @click="propertyDialogOpen" type="primary">关联资产</el-button>
          </el-form-item>
          <el-form-item label="资产" v-if="form.propertyData">
            <el-tag
              class="pipeline-tag"
              v-for="tag in form.propertyData"
              :key="tag.name"
              :type="tag.type"
            >{{tag.name}}</el-tag>
          </el-form-item>
          <!--  -->
          <el-form-item
            label="是否是模板"
            prop="isTemp"
            :rules="[{required: true,message: '请输入是否是模板'},{min: 0,max: 1,message: '长度在 0 到 1 个字符'},]"
          >
            <CrudSelect v-model="form.isTemp" :dic="isTempOptions"></CrudSelect>
          </el-form-item>

          <el-form-item
            label="备注"
            prop="description"
            :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]"
          >
            <el-input type="textarea" v-model="form.description"></el-input>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancel()">取 消</el-button>
          <el-button type="primary" @click="save()">保 存</el-button>
        </div>
      </el-dialog>

      <el-dialog width="1400px" :visible.sync="pipelineDialog">
        <pipeline ref="pipelineDialog" :station="form.station" @setPipelineData="setPipelineData"></pipeline>
      </el-dialog>
      <el-dialog width="1400px" :visible.sync="propertyDialog">
        <property ref="propertyDialog" :station="form.station" @setPropertyData="setPropertyData"></property>
      </el-dialog>
    </basic-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import patrolLineService from "./patrol-line-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";
import pipeline from "@/components/pipeline/index";
import property from "@/components/property/index";

export default {
  name: "table_patrolline_patrolLine",
  components: { CrudSelect, CrudCheckbox, CrudRadio, pipeline, property },
  data() {
    return {
      timeout: 500,
      test: "",
      stationOptions: [],
      //---
      isTempOptions: [],
      // ---
      siteOptions: [],
      statusOptions: [],
      fileList: [],
      // ----
      isUpload: 1,
      mapOptions: [],
      selectLoading: false,
      // ----
      pipelineDialog: false,
      propertyDialog: false,
      //===============================
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchPatrolLineForm: {},
      listQuery: {
        page: 1,
        size: 20
      },
      form: {
        pipelineData: undefined,
        propertyData: undefined,
        name: undefined,
        data: undefined,
        isTemp: undefined,
        code: undefined,
        description: undefined
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
        update: "编辑巡线管理",
        create: "创建巡线管理"
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
    this.getSiteOptions();
    this.remoteMethod("");
    this.remoteStationMethod("");
    this.patrolline_patrolLine_edit = this.permissions[
      "patrolline_patrolLine_edit"
    ];
    this.patrolline_patrolLine_del = this.permissions[
      "patrolline_patrolLine_del"
    ];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.isTempOptions = this.dicts["sys_flag"];
  },
  methods: {
    propertyDialogOpen() {
      this.propertyDialog = true;
      setTimeout(() => {
        if (this.form.propertyData) {
          this.$refs.propertyDialog.showList = this.form.propertyData;
        } else {
          this.$refs.propertyDialog.showList = [];
        }
      }, this.timeout);
    },
    setPropertyData(data) {
      this.form.propertyData = data;
      this.propertyDialog = false;
      console.log(this.propertyDialog);
    },
    //--------------
    pipelineDialogOpen() {
      this.pipelineDialog = true;
      setTimeout(() => {
        if (this.form.pipelineData) {
          this.$refs.pipelineDialog.showList = this.form.pipelineData;
        } else {
          this.$refs.pipelineDialog.showList = [];
        }
      }, this.timeout);
    },
    setPipelineData(data) {
      this.form.pipelineData = data;
      this.pipelineDialog = false;
      // console.log(this.pipelineData);
    },
    //--------------------
    getSiteOptions() {
      this.siteOptions = [
        { label: "场站1", value: "1" },
        { label: "场站2", value: "2" }
      ];
    },
    // -------------------

    typeChange(data) {
      this.form.data = "";
      this.isUpload = data;
      this.fileList = [];
      this.remoteMethod("");
    },
    handleSuccess(res) {
      this.form.data = JSON.stringify(res.data);
    },
    // ------------------------------------------------
    remoteMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: query,
          operate: "like"
        },
        {
          fieldName: "isTemp",
          value: "1",
          operate: "eq"
        }
      ]);
      patrolLineService.page(listQuery).then(response => {
        this.mapOptions = this.getMapOptions(response.data.records);
        this.selectLoading = false;
      });
    },
    mapDataChange(value) {
      this.form.data = util.getStr(
        this.mapOptions,
        value,
        "value",
        "data"
      ).data;
    },
    getMapOptions(data) {
      let list = [];
      data.forEach(element => {
        list.push({ lable: element.id, value: element.name, data: element });
      });
      return list;
    },
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
      patrolLineService.stationPage(listQuery).then(response => {
        // this.stationOptions = this.getStationOptions(response.data.records);
        this.stationOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    getStationOptions(data) {
      let list = [];
      data.forEach(element => {
        list.push({ lable: element.id, value: element.name, data: element });
      });
      return list;
    },
    stationChange(value) {
      this.form.pipelineData = undefined;
      this.form.propertyData = undefined;
    },
    // ---------------------------------------------
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: this.searchPatrolLineForm.name,
          operate: "like",
          attrType: "String"
        },
        {
          fieldName: "isTemp",
          value: this.searchPatrolLineForm.isTemp,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "code",
          value: this.searchPatrolLineForm.code,
          operate: "eq",
          attrType: "String"
        }
      ]);
      patrolLineService.page(this.listQuery).then(response => {
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
      this.$refs["searchPatrolLineForm"].resetFields();
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
        patrolLineService.find(row.id).then(response => {
          this.form = response.data;
          // this.form.delFlag = validate.toString(this.form.delFlag);
          // this.form.isTemp = validate.toString(this.form.isTemp);
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
          patrolLineService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该巡线管理, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        patrolLineService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.isUpload = 1;
      this.fileList = [];
      this.remoteMethod("");
      this.form = {
        pipelineData: undefined,
        propertyData: undefined,
        name: "",
        data: "",
        isTemp: "0",
        code: "",
        description: ""
      };
      this.$refs["form"] && this.$refs["form"].resetFields();
    }
  }
};
</script>

<style scoped>
.pipelineDialog {
  width: 600px;
}
</style>