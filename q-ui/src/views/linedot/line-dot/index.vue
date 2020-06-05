<template>
  <div class="app-container calendar-list-container">
    <basic-container>
    <div class="filter-container">
      <el-form :inline="true"  :model="searchLineDotForm" ref="searchLineDotForm" v-show="searchFilterVisible">
        <el-form-item label="关联标记点id" prop="dot">
          <CrudSelect v-model="searchLineDotForm.dot" :dic="dotOptions"></CrudSelect>
        </el-form-item>
        <el-form-item label="巡线id" prop="line">
          <CrudSelect v-model="searchLineDotForm.line" :dic="lineOptions"></CrudSelect>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <CrudSelect v-model="searchLineDotForm.status" :dic="statusOptions"></CrudSelect>
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
          <el-button size="mini" v-if="linedot_lineDot_edit" class="filter-item" @click="handleEdit" type="primary" icon="edit">添加</el-button>
        </el-button-group>
      </div>
      <div class="table-menu-right">
        <el-button icon="el-icon-search" circle size="mini" @click="searchFilterVisible= !searchFilterVisible"></el-button>
      </div>
    </div>
    <el-table :key='tableKey' @sort-change="sortChange" :data="list" v-loading="listLoading" element-loading-text="加载中..." fit highlight-current-row>
      <el-table-column align="center" label="关联标记点id">
        <template slot-scope="scope">
		  <span>{{scope.row.dot}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="巡线id">
        <template slot-scope="scope">
		  <span>{{scope.row.line}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" label="状态">
        <template slot-scope="scope">
		  <span>{{scope.row.status}}</span>
        </template>
      </el-table-column>
      <el-table-column align="center" fixed="right" label="操作" v-if="linedot_lineDot_edit || linedot_lineDot_del">
        <template slot-scope="scope">
          <el-button v-if="linedot_lineDot_edit" icon="icon-edit" title="编辑" type="text" @click="handleEdit(scope.row)">
          </el-button>
          <el-button v-if="linedot_lineDot_del" icon="icon-delete" title="删除" type="text" @click="handleDelete(scope.row)">
          </el-button>
        </template>
      </el-table-column>

    </el-table>

    <div v-show="!listLoading" class="pagination-container">
      <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange" :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]" :page-size="listQuery.size" layout="total, sizes, prev, pager, next, jumper" :total="total">
      </el-pagination>
    </div>
    <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
      <el-form :model="form" ref="form" label-width="100px">
        <el-form-item label="关联标记点id" prop="dot" :rules="[{required: true,message: '请输入关联标记点id'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
              <CrudSelect v-model="form.dot" :dic="dotOptions"></CrudSelect>
        
        </el-form-item>
        <el-form-item label="巡线id" prop="line" :rules="[{required: true,message: '请输入巡线id'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
              <CrudSelect v-model="form.line" :dic="lineOptions"></CrudSelect>
        
        </el-form-item>
        <el-form-item label="状态" prop="status" :rules="[{required: true,message: '请输入状态'},{validator:validateDigits},]">
              <CrudSelect v-model="form.status" :dic="statusOptions"></CrudSelect>
        
        </el-form-item>
        <el-form-item label="备注" prop="description" :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
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
import lineDotService from "./line-dot-service";
import validate from "@/util/validate";
import util from "@/util/util";
import CrudSelect from "@/components/avue/crud-select";
import CrudCheckbox from "@/components/avue/crud-checkbox";
import CrudRadio from "@/components/avue/crud-radio";

export default {
  name: "table_linedot_lineDot",
  components: {CrudSelect, CrudCheckbox, CrudRadio},
  data() {
    return{
      searchFilterVisible: true,
      dialogFormVisible: false,
      list: null,
      total: null,
      listLoading: true,
      searchLineDotForm:{},
      listQuery: {
        page: 1,
        size: 20
      },
      form: {
        dot: undefined,
        line: undefined,
        status: undefined,
        description: undefined,
      },
      validateUnique: (rule, value, callback) => {
          validate.isUnique(rule, value, callback, this.form.id)
        },
        validateNumber: (rule, value, callback) => {
          validate.isNumber(rule, value, callback)
        },
        validateDigits: (rule, value, callback) => {
          validate.isDigits(rule, value, callback)
        },
      delFlagOptions: undefined,
      dialogStatus: 'create',
      textMap: {
        update: '编辑巡线标记点管理',
        create: '创建巡线标记点管理'
      },
      tableKey: 0
    };
  },
  computed: {
    ...mapGetters(["permissions","dicts"])
  },
  filters: {
  },
  created() {
    this.getList();
    this.linedot_lineDot_edit = this.permissions["linedot_lineDot_edit"];
    this.linedot_lineDot_del = this.permissions["linedot_lineDot_del"];
    this.delFlagOptions = this.dicts["sys_flag"];
  },
  methods: {
    getList() {
      this.listLoading = true;
      this.listQuery.queryConditionJson = util.parseJsonItemForm([
      {fieldName: 'dot',value:this.searchLineDotForm.dot,operate:'eq',attrType:'String'},
      {fieldName: 'line',value:this.searchLineDotForm.line,operate:'eq',attrType:'String'},
      {fieldName: 'status',value:this.searchLineDotForm.status,operate:'eq',attrType:'Integer'},
      ])
      lineDotService.page(this.listQuery).then(response => {
        this.list = response.data.records;
        this.total = response.data.total;
        this.listLoading = false;
      });
    },
    sortChange(column){
      if(column.order=="ascending"){
        this.listQuery.ascs=column.prop
        this.listQuery.descs=undefined;
      }else{
        this.listQuery.descs=column.prop
        this.listQuery.ascs=undefined;
      }
      this.getList()
    },
    searchReset() {
      this.$refs['searchLineDotForm'].resetFields();
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
      this.dialogStatus = row && !validate.checkNull(row.id)? "update" : "create";
      if(this.dialogStatus == "create"){
        this.dialogFormVisible = true;
      }else{
        lineDotService.find(row.id).then(response => {
            this.form = response.data;
            this.form.delFlag=validate.toString(this.form.delFlag);
            this.dialogFormVisible = true;
          });
      }
    },
    cancel() {
      this.dialogFormVisible = false;
      this.$refs['form'].resetFields();
    },
    save() {
      const set = this.$refs;
      set['form'].validate(valid => {
        if (valid) {
          lineDotService.save(this.form).then((data) => {
            this.getList();
            this.cancel()
          });
        } else {
          return false;
        }
      });
    },
    handleDelete(row) {
      this.$confirm(
        "此操作将永久删除该巡线标记点管理, 是否继续?",
        "提示",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      ).then(() => {
        lineDotService.remove(row.id).then((data) => {
            this.getList();
          });
      });
    },
    resetForm() {
      this.form = {
        dot: "",
        line: "",
        status: "",
        description: "",
      };
      this.$refs['form']&&this.$refs['form'].resetFields();
    }
  }
};
</script>