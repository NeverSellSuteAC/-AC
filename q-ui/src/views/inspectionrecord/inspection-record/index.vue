<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchInspectionRecordForm"
          ref="searchInspectionRecordForm"
          v-show="searchFilterVisible"
        >
          <el-form-item label="执行人员" prop="execute">
            <!-- <CrudSelect v-model="searchInspectionRecordForm.execute" :dic="executeOptions"></CrudSelect> -->
            <el-select
              v-model="searchInspectionRecordForm.execute"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteUserMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="(item,index) in executeOptions"
                :key="index"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="巡线id" prop="line">
            <!-- <CrudSelect v-model="searchInspectionRecordForm.line" :dic="lineOptions"></CrudSelect> -->
            <el-select
              v-model="searchInspectionRecordForm.line"
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
          <el-form-item label="状态" prop="status">
            <CrudSelect v-model="searchInspectionRecordForm.status" :dic="statusOptions"></CrudSelect>
          </el-form-item>
          <el-form-item label="编号" prop="code">
            <el-input class="filter-item input-normal" v-model="searchInspectionRecordForm.code"></el-input>
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
              v-if="inspectionrecord_inspectionRecord_edit"
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
        <el-table-column align="center" label="执行人员">
          <template slot-scope="scope">
            <!-- <span>{{scope.row.execute}}</span> -->
            <span>{{getUserName(scope.row.execute)}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="巡线id">
          <template slot-scope="scope">
            <!-- <span>{{scope.row.line}}</span> -->
            <span>{{getLineName(scope.row.line)}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <span>{{getStatusStr(scope.row.status)}}</span>
          </template>
        </el-table-column>
        <!-- <el-table-column align="center" label="编号">
          <template slot-scope="scope">
            <span>{{scope.row.code}}</span>
          </template>
        </el-table-column> -->
        <el-table-column align="center" label="进度">
          <template slot-scope="scope">
            <!-- <span>{{scope.row.data==null?getTaskCompletion(scope.row,scope.$index):scope.row.data}}</span> -->
            <span>{{scope.row.taskCompletion}}</span>
            <!-- <span>{{scope.row.data=="null"?getTaskCompletion(scope.row):scope.row.data}}</span> -->
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="inspectionrecord_inspectionRecord_edit || inspectionrecord_inspectionRecord_del"
        >
          <template slot-scope="scope">
            <el-button
              v-if="inspectionrecord_inspectionRecord_edit"
              icon="icon-edit"
              title="编辑"
              type="text"
              @click="handleEdit(scope.row)"
            ></el-button>
            <el-button
              v-if="inspectionrecord_inspectionRecord_del"
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
            label="巡线id"
            prop="line"
            :rules="[{required: true,message: '请输入巡线id'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <!-- <CrudSelect v-model="form.line" :dic="lineOptions"></CrudSelect> -->
            <el-col :span="12">
              <el-select
                v-model="form.line"
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
            </el-col>
          </el-form-item>
          <!-- ================= -->
          <el-form-item label="执行人员" prop="execute" :rules="[{required: true,message: '请选择执行人员'}]">
            <el-col :span="12">
              <el-select
                v-model="form.execute"
                clearable
                filterable
                remote
                reserve-keyword
                placeholder="请输入关键词"
                :remote-method="remoteUserMethod"
                :loading="selectLoading"
              >
                <el-option
                  v-for="(item,index) in executeOptions"
                  :key="index"
                  :label="item.name"
                  :value="item.id"
                ></el-option>
              </el-select>
            </el-col>
          </el-form-item>
          <!-- ================= -->
          <el-form-item label="周期(天)" prop="time" :rules="[{required: true,message: '请输入周期'}]">
            <!-- <el-input v-model="form.time"></el-input> -->
            <el-input-number v-model="form.time" :min="1" :max="366" label="天"></el-input-number>
          </el-form-item>
          <el-form-item
            label="开始时间"
            prop="startTime"
            :rules="[{required: true,message: '请选择开始时间'}]"
          >
            <!-- <el-col :span="10">
              <el-date-picker
                v-model="startDate"
                type="date"
                placeholder="选择日期"
                value-format="yyyy-MM-dd "
                :picker-options="pickerOptions0"
              ></el-date-picker>
            </el-col>
            <el-col :span="6">
              <el-time-select
                v-model="date"
                :picker-options="{start: '00:00',step: '00:15',end: '23:45'}"
                placeholder="选择时间"
              ></el-time-select>
            </el-col>-->
            <el-col :span="10">
              <el-date-picker
                v-model="form.startTime"
                value-format="yyyy-MM-dd HH:mm:ss"
                type="datetime"
                placeholder="选择日期时间"
                :picker-options="pickerOptions0"
              ></el-date-picker>
            </el-col>
          </el-form-item>
          <!-- ================================ -->
          <!-- <el-form-item
            label="状态"
            prop="status"
            :rules="[{required: true,message: '请输入状态'},{validator:validateDigits},]"
          >
            <CrudSelect v-model="form.status" :dic="statusOptions"></CrudSelect>
          </el-form-item>-->
          <!-- ================================ -->
          <!-- <el-form-item
            label="编号"
            prop="code"
            :rules="[{required: true,message: '请输入编号'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <el-input v-model="form.code"></el-input>
          </el-form-item>-->
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
    </basic-container>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import inspectionRecordService from "./inspection-record-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_inspectionrecord_inspectionRecord",
  components: { CrudSelect, CrudCheckbox, CrudRadio },
  data() {
    return {
      pickerOptions0: {
        disabledDate(time) {
          return time.getTime() < Date.now(); // - 8.64e7; //如果没有后面的-8.64e7就是不可以选择今天的
        }
      },
      startDate: new Date(),
      date: new Date(),
      lineOptions: [],
      executeOptions: [],
      statusOptions: [],
      selectLoading: false,
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchInspectionRecordForm: {
        execute:"",
        line:"",
        status:"",
        code:"",
      },
      listQuery: {
        page: 1,
        size: 20
      },
      isNull: undefined,
      form: {
        startDate: undefined,
        date: undefined,
        execute: undefined,
        line: undefined,
        status: undefined,
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
        update: "编辑检查记录管理",
        create: "创建检查记录管理"
      },
      tableKey: 0
    };
  },
  computed: {
    ...mapGetters(["permissions", "dicts"])
  },
  filters: {},
  created() {
    this.remoteUserMethod("");
    this.remoteMethod("");
    this.getList();
    this.inspectionrecord_inspectionRecord_edit = this.permissions[
      "inspectionrecord_inspectionRecord_edit"
    ];
    this.inspectionrecord_inspectionRecord_del = this.permissions[
      "inspectionrecord_inspectionRecord_del"
    ];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.statusOptions = this.dicts["execute_status"];
  },
  methods: {
    getStatusStr(value) {
      return util.getStr(this.statusOptions, value, "value", "label");
    },
    getTaskCompletion(row, index) {
      if (row.data != null) {
        console.log("++++");
        return;
      }
      inspectionRecordService.getTaskCompletion(row.id).then(res => {
        this.list[index].data = res.data;
        this.$set(this.list, index, this.list[index]);
        // this.list = JSON.parse(JSON.stringify(this.list));

        // let list = this.list;
        // this.list = [];
        // this.list = list;
      });
    },
    getUserName(id) {
      return util.getStr(this.executeOptions, id, "id", "name");
    },
    getLineName(id) {
      return util.getStr(this.lineOptions, id, "id", "name");
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
      inspectionRecordService.linePage(listQuery).then(response => {
        // this.lineOptions = this.getMapOptions(response.data.records);
        // this.lineOptions = [
        //   { label: "场站1", value: "1" },
        //   { label: "场站2", value: "2" }
        // ];
        this.lineOptions = response.data.records;
        console.log(this.lineOptions);
        this.selectLoading = false;
      });
    },
    getMapOptions(data) {
      let list = [];
      data.forEach(element => {
        list.push({ lable: element.name, value: element.id, data: element });
      });
      return list;
    },
    //==================
    remoteUserMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "a.name",
          value: query,
          operate: "like"
        }
      ]);
      inspectionRecordService.userPage(listQuery).then(response => {
        // this.executeOptions = this.getUserOptions(response.data.records);
        this.executeOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    getUserOptions(data) {
      let list = [];
      data.forEach(element => {
        list.push({ lable: element.name, value: element.id });
      });
      return list;
    },
    // ====================
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "execute",
          value: this.searchInspectionRecordForm.execute,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "line",
          value: this.searchInspectionRecordForm.line,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "status",
          value: this.searchInspectionRecordForm.status,
          operate: "eq",
          attrType: "Integer"
        },
        {
          fieldName: "code",
          value: this.searchInspectionRecordForm.code,
          operate: "eq",
          attrType: "String"
        }
      ]);
      inspectionRecordService.page(this.listQuery).then(response => {
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
      this.$refs["searchInspectionRecordForm"].resetFields();
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
    ccc() {},
    handleEdit(row) {
      this.resetForm();
      this.dialogStatus =
        row && !validate.checkNull(row.id) ? "update" : "create";
      if (this.dialogStatus == "create") {
        this.dialogFormVisible = true;
      } else {
        inspectionRecordService.find(row.id).then(response => {
          this.form = response.data;
          this.form.delFlag = validate.toString(this.form.delFlag);
          this.dialogFormVisible = true;

          // let arr = this.form.startTime.split(" ");
          // this.startDate = arr[0];
          // // this.dvalue = new Date();
          // this.date = arr[1];
        });
      }
    },
    cancel() {
      this.dialogFormVisible = false;
      this.$refs["form"].resetFields();
    },
    save() {
      this.form.code = "1";
      this.form.status = "1";
      // this.form.startTime = this.form.startDate + this.form.date + ":00";
      // this.form.startTime = this.form.startDate + this.form.date;
      const set = this.$refs;
      set["form"].validate(valid => {
        if (valid) {
          inspectionRecordService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该检查记录管理, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        inspectionRecordService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.startDate = new Date();
      this.date = "09:00";
      this.form = {
        execute: "",
        startTime: "",
        line: "",
        status: "",
        code: "",
        description: ""
      };
      this.$refs["form"] && this.$refs["form"].resetFields();
    }
  }
};
</script>