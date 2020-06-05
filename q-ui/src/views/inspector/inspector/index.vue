<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-form
          :inline="true"
          :model="searchInspectorForm"
          ref="searchInspectorForm"
          v-show="searchFilterVisible"
        >
          <el-form-item label="用户id" prop="user">
            <!-- <CrudSelect v-model="searchInspectorForm.user" :dic="userOptions"></CrudSelect> -->
            <el-select
              v-model="searchInspectorForm.user"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item label="状态" prop="status">
            <CrudSelect v-model="searchInspectorForm.status" :dic="statusOptions"></CrudSelect>
          </el-form-item>
          <el-form-item label="编号" prop="code">
            <el-input class="filter-item input-normal" v-model="searchInspectorForm.code"></el-input>
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
              v-if="inspector_inspector_edit"
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
        <el-table-column align="center" label="用户名">
          <template slot-scope="scope">
            <span>{{scope.row.username}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="姓名">
          <template slot-scope="scope">
            <span>{{scope.row.name}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="联系方式">
          <template slot-scope="scope">
            <span>{{scope.row.phone}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="所属公司">
          <template slot-scope="scope">
            <span>{{scope.row.company}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="所属场站">
          <template slot-scope="scope">
            <span>{{scope.row.station}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="邮箱">
          <template slot-scope="scope">
            <span>{{scope.row.email}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="状态">
          <template slot-scope="scope">
            <span>{{scope.row.status}}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" label="备注">
          <template slot-scope="scope">
            <span>{{scope.row.description}}</span>
          </template>
        </el-table-column>
        <el-table-column
          align="center"
          fixed="right"
          label="操作"
          v-if="inspector_inspector_edit || inspector_inspector_del"
        >
          <template slot-scope="scope">
            <el-button
              v-if="inspector_inspector_edit"
              icon="icon-edit"
              title="编辑"
              type="text"
              @click="handleEdit(scope.row)"
            ></el-button>
            <el-button
              :icon="scope.row.status == '2' ? 'icon-lock' : 'icon-unlock'"
              :title="scope.row.available == '2' ? '锁定' : '解锁'"
              @click="handleLock(scope.row)"
              type="text"
            ></el-button>
            <el-button
              v-if="inspector_inspector_del"
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
            label="用户id"
            prop="user"
            :rules="[{required: true,message: '请输入用户id'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]"
          >
            <!-- <CrudSelect v-model="form.user" :dic="userOptions"></CrudSelect> -->
            <el-select
              v-model="form.user"
              clearable
              filterable
              remote
              reserve-keyword
              placeholder="请输入关键词"
              :remote-method="remoteMethod"
              :loading="selectLoading"
            >
              <el-option
                v-for="item in userOptions"
                :key="item.id"
                :label="item.name"
                :value="item.id"
              ></el-option>
            </el-select>
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
          <el-form-item
            label="状态"
            prop="status"
            :rules="[{required: true,message: '请输入状态'},{min: 0,max: 1,message: '长度在 0 到 1 个字符'},]"
          >
            <CrudSelect v-model="form.status" :dic="statusOptions"></CrudSelect>
          </el-form-item>
          <!-- <el-form-item label="编号" prop="code" :rules="[{required: true,message: '请输入编号'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
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
import inspectorService from "./inspector-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_inspector_inspector",
  components: { CrudSelect, CrudCheckbox, CrudRadio },
  data() {
    return {
      stationOptions: [],
      userOptions: [],
      statusOptions: [],
      selectLoading: false,
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchInspectorForm: {},
      listQuery: {
        page: 1,
        size: 10
      },
      form: {
        user: undefined,
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
        update: "编辑巡线人员管理",
        create: "创建巡线人员管理"
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
    this.remoteMethod("");
    this.remoteStationMethod("");
    this.inspector_inspector_edit = this.permissions[
      "inspector_inspector_edit"
    ];
    this.inspector_inspector_del = this.permissions["inspector_inspector_del"];
    this.delFlagOptions = this.dicts["sys_flag"];
    this.statusOptions = this.dicts["inspector_status"];
  },
  methods: {
    handleLock(row) {
      // row.status == "1" ? (row.status = "2") : (row.status = "1");
      if (row.status == "1") {
        row.status = "2";
      } else {
        row.status = "1";
      }
      inspectorService.save(row).then(res => {
        this.getList();
      });
    },
    //=======================
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
      inspectorService.stationPage(listQuery).then(response => {
        // this.stationOptions = this.getStationOptions(response.data.records);
        this.stationOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    // =======================
    remoteMethod(query) {
      this.selectLoading = true;
      let listQuery = { page: 1, size: 10 };
      listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "a.name",
          value: query,
          operate: "like"
        }
      ]);
      inspectorService.userPage(listQuery).then(response => {
        // this.userOptions = this.getUserOptions(response.data.records);
        this.userOptions = response.data.records;
        this.selectLoading = false;
      });
    },
    getUserOptions(data) {
      let list = [];
      data.forEach(element => {
        list.push({ lable: element.id, value: element.name });
      });
      return list;
    },
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
        {
          fieldName: "user",
          value: this.searchInspectorForm.user,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "status",
          value: this.searchInspectorForm.status,
          operate: "eq",
          attrType: "String"
        },
        {
          fieldName: "code",
          value: this.searchInspectorForm.code,
          operate: "eq",
          attrType: "String"
        }
      ]);
      inspectorService.page(this.listQuery).then(response => {
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
      this.$refs["searchInspectorForm"].resetFields();
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
        inspectorService.find(row.id).then(response => {
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
      //
      this.form.code = "1";
      //
      const set = this.$refs;
      set["form"].validate(valid => {
        if (valid) {
          inspectorService.save(this.form).then(data => {
            this.getList();
            this.cancel();
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm("此操作将永久删除该巡线人员管理, 是否继续?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(() => {
        inspectorService.remove(row.id).then(data => {
          this.getList();
        });
      });
    },
    resetForm() {
      this.form = {
        user: "",
        status: "",
        code: "",
        description: ""
      };
      this.$refs["form"] && this.$refs["form"].resetFields();
    }
  }
};
</script>