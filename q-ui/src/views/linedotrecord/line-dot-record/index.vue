<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchLineDotRecordForm"
          ref="searchLineDotRecordForm"
          v-show="searchFilterVisible"
        >
          <!-- <el-form-item label="检查记录id" prop="inspectionRecord">
            <el-select
              v-model="searchLineDotRecordForm.inspectionRecord"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteRecordMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in inspectionRecordOptions"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>            
          </el-form-item>-->
          <el-form-item label="巡线" prop="line">
            <el-select
              v-model="searchLineDotRecordForm.line"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in lineOptions"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="管线" prop="dot">
            <el-select
              v-model="searchLineDotRecordForm.dot"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remotePipelineMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in pipelineOptions"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>-->
          <el-form-item label="标记点" prop="dot">
            <!-- <el-input class="filter-item input-normal" v-model="searchLineDotRecordForm.dot"></el-input> -->
            <el-select
              v-model="searchLineDotRecordForm.dot"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteDotMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in dotOptions"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <!-- <el-form-item label="创建时间" prop="createdDate">
            <el-date-picker
              v-model="searchNewsForm.createdDate"
              value-format="yyyy-MM-dd HH:mm:ss"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
            ></el-date-picker>
          </el-form-item>-->
          <!-- <el-form-item label="记录类型" prop="type">
            <CrudSelect v-model="searchLineDotRecordForm.type" :dic="typeOptions"></CrudSelect>
          </el-form-item>-->

          <el-form-item label="级别" prop="level">
            <CrudSelect v-model="searchLineDotRecordForm.level" :dic="levelOptions"></CrudSelect>
          </el-form-item>
          <el-form-item label="是否是故障点" prop="isBad">
            <CrudSelect v-model="searchLineDotRecordForm.isBad" :dic="isBadOptions"></CrudSelect>
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
          <!-- <el-button-group>
            <el-button
              size="mini"
              v-if="linedotrecord_lineDotRecord_edit"
              class="filter-item"
              @click="handleEdit"
              type="primary"
              icon="edit"
            >添加</el-button>
          </el-button-group>-->
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
        <el-table-column align="center" label="巡线名称">
          <template slot-scope="scope">
            <!-- <span>{{getLineName(scope.row.line)}}</span> -->
            <span>{{(scope.row.lineName)}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="记录类型">
          <template slot-scope="scope">
            <span>{{scope.row.type}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="标记点">
          <template slot-scope="scope">
            <!-- <span>{{getDotName(scope.row.dot)}}</span> -->
            <span>{{(scope.row.dotName)}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="级别">
          <template slot-scope="scope">
            <span>{{scope.row.level}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="附件">
          <template slot-scope="scope">
            <span>{{scope.row.enclosure}}</span>
          </template>
        </el-table-column>-->
        <el-table-column align="center" label="故障点">
          <template slot-scope="scope">
            <el-tag>{{scope.row.isBadText}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注">
          <template slot-scope="scope">
            <span class="text-span">{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="linedotrecord_lineDotRecord_edit || linedotrecord_lineDotRecord_del"
        >
          <template slot-scope="scope">
            <!-- <el-button
              v-if="linedotrecord_lineDotRecord_edit"
              icon="icon-edit"
              title="编辑"
              type="text"
              @click="handleEdit(scope.row)"
            ></el-button>-->
            <el-button icon="icon-eye" title="查看" type="text" @click="viewOpen(scope.row)"></el-button>
            <el-button
              v-if="linedotrecord_lineDotRecord_del"
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
            label="备注"
            prop="description"
            :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]"
          >
            <el-input type="textarea" v-model="form.description"></el-input>
          </el-form-item>
          <el-form-item
            label="检查记录id"
            prop="inspectionRecord"
            :rules="[{required: true,message: '请输入检查记录id'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <CrudSelect v-model="form.inspectionRecord" :dic="inspectionRecordOptions"></CrudSelect>
          </el-form-item>
          <!-- <el-form-item
            label="记录类型"
            prop="type"
            :rules="[{required: true,message: '请输入记录类型'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <CrudSelect v-model="form.type" :dic="typeOptions"></CrudSelect>
          </el-form-item>-->
          <el-form-item
            label="标记点"
            prop="dot"
            :rules="[{required: true,message: '请输入标记点'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'},]"
          >
            <el-input v-model="form.dot"></el-input>
          </el-form-item>
          <el-form-item label="级别" prop="level" :rules="[{validator:validateDigits},]">
            <CrudSelect v-model="form.level" :dic="levelOptions"></CrudSelect>
          </el-form-item>
          <el-form-item
            label="附件"
            prop="enclosure"
            :rules="[{min: 0,max: 3072,message: '长度在 0 到 3072 个字符'},]"
          >
            <el-input v-model="form.enclosure"></el-input>
          </el-form-item>
          <el-form-item
            label="故障点"
            prop="isBad"
            :rules="[{required: true,message: '请选择'},{min: 0,max: 1,message: '长度在 0 到 1 个字符'},]"
          >
            <CrudSelect v-model="form.isBad" :dic="isBadOptions"></CrudSelect>
          </el-form-item>
        </el-form>
        <div slot="footer" class="dialog-footer">
          <el-button @click="cancel()">取 消</el-button>
          <el-button type="primary" @click="save()">保 存</el-button>
        </div>
      </el-dialog>

      <el-dialog :visible.sync="dialogViewVisible" width="700px">
        <el-form label-width="100px">
          <el-row>
            <el-col>
              <el-form-item label="巡线:">{{view.lineName}}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="标记点:">{{view.dotName||"--"}}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="故障点:">{{view.isBadText}}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="级别:">{{view.level||"--"}}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="描述:">{{view.description}}</el-form-item>
            </el-col>
          </el-row>
          <el-row>
            <el-col>
              <el-form-item label="附件:">
                <div v-for="(file,index) in view.enclosure" :key="index">
                  <a :href="file.url">{{file.name}}</a>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form>
      </el-dialog>
    </basic-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import lineDotRecordService from "./line-dot-record-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_linedotrecord_lineDotRecord",
  components: { CrudSelect, CrudCheckbox, CrudRadio },
  data() {
    return {
      view: {},
      lineOptions: [],
      pipelineOptions: [],
      inspectionRecordOptions: [],
      dotOptions: [],
      //==================
      searchFilterVisible: true,

      dialogViewVisible: false,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchLineDotRecordForm: {
        line:"",
        dot:"",
        level:"",
        isBad:"",
      },
      listQuery: {
        page: 1,
        size: 20
      },
      form: {
        description: undefined,
        inspectionRecord: undefined,
        type: undefined,
        dot: undefined,
        level: undefined,
        enclosure: undefined,
        isBad: undefined
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
      isBadOptions: undefined,
      dialogStatus: "create",
      textMap: {
        update: "编辑巡线记录点管理",
        create: "创建巡线记录点管理"
      },
      tableKey: 0
    };
  },
  computed: {
    ...mapGetters(["permissions", "dicts"])
  },
  filters: {},
  created() {
    this.remoteMethod("");
    this.remoteDotMethod("");
    this.remoteRecordMethod("");
    this.remotePipelineMethod("");
    this.getAllStr();
    this.getList();
    this.linedotrecord_lineDotRecord_edit = this.permissions[
      "linedotrecord_lineDotRecord_edit"
    ];
    this.linedotrecord_lineDotRecord_del = this.permissions[
      "linedotrecord_lineDotRecord_del"
    ];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.isBadOptions = this.dicts["sys_flag"];
    this.levelOptions = this.dicts["level_options"];
  },
  methods: {
    getAllStr() {
      lineDotRecordService.getLineAllStr(this.listQuery).then(res => {
        this.lineAllStr = res.data;
      });
      lineDotRecordService.getDotAllStr(this.listQuery).then(res => {
        this.dotAllStr = res.data;
      });
    },
    getDotName(id) {
      return util.getStr(this.lineOptions, id, "id", "name");
    },
    getLineName(id) {
      return util.getStr(this.dotOptions, id, "id", "name");
    },
    // ====================
    remotePipelineMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: query,
          operate: "like"
        }
      ]);
      lineDotRecordService.pipelinePage(listQuery).then(response => {
        this.pipelineOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    // ====================
    remoteDotMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: query,
          operate: "like"
        }
      ]);
      lineDotRecordService.dotPage(listQuery).then(response => {
        this.dotOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    // ====================
    remoteRecordMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "name",
          value: query,
          operate: "like"
        }
      ]);
      lineDotRecordService.recordPage(listQuery).then(response => {
        this.inspectionRecordOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    // ====================
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
          value: "0",
          operate: "eq"
        }
      ]);
      lineDotRecordService.linePage(listQuery).then(response => {
        this.lineOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    //===================================
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "inspectionRecord",
          value: this.searchLineDotRecordForm.inspectionRecord,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "type",
          value: this.searchLineDotRecordForm.type,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "line",
          value: this.searchLineDotRecordForm.line,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "dot",
          value: this.searchLineDotRecordForm.dot,
          operate: "like",
          attrType: "String"
        },
        {
          fieldName: "level",
          value: this.searchLineDotRecordForm.level,
          operate: "eq",
          attrType: "Integer"
        },
        {
          fieldName: "isBad",
          value: this.searchLineDotRecordForm.isBad,
          operate: "eq",
          attrType: "String"
        }
      ]);
      lineDotRecordService.page(this.listQuery).then(response => {
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
      this.$refs["searchLineDotRecordForm"].resetFields();
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
        lineDotRecordService.find(row.id).then(response => {
          this.form = response.data;
          // this.form.delFlag = validate.toString(this.form.delFlag);
          // this.form.isBad = validate.toString(this.form.isBad);
          this.dialogFormVisible = true;
        });
      }
    },
    viewOpen(row) {
      this.view = {};
      let enclosure = JSON.parse(row.enclosure);

      this.view = JSON.parse(JSON.stringify(row));
      this.view.enclosure = enclosure;
      this.dialogViewVisible = true;
    },
    cancel() {
      this.dialogFormVisible = false;
      this.dialogViewVisible = false;
      this.$refs["form"].resetFields();
    },
    save() {
      const set = this.$refs;
      set["form"].validate(valid => {
        if (valid) {
          lineDotRecordService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该巡线记录点管理, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        lineDotRecordService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.form = {
        description: "",
        inspectionRecord: "",
        type: "",
        dot: "",
        level: "",
        enclosure: "",
        isBad: ""
      };
      this.$refs["form"] && this.$refs["form"].resetFields();
    }
  }
};
</script>