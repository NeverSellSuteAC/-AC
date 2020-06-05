<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <el-row :gutter="20">
        <el-col :span="4" style="margin-top:15px;">
          <el-card class="box-card">
            <div class="clearfix" slot="header">
              <span>部门</span>

              <el-button
                @click="searchTree=(searchTree ? false:true)"
                class="card-heard-btn"
                icon="icon-filesearch"
                title="搜索"
                type="text"
              ></el-button>
              <el-button
                @click="getTreeDept()"
                class="card-heard-btn"
                icon="icon-reload"
                title="刷新"
                type="text"
              ></el-button>
            </div>
            <el-input placeholder="输入关键字进行过滤" v-model="filterText" v-show="searchTree"></el-input>
            <el-tree
              :data="treeDeptData"
              :expand-on-click-node="false"
              :filter-node-method="filterNode"
              @node-click="clickNodeTreeData"
              class="filter-tree"
              highlight-current
              node-key="id"
              ref="leftDeptTree"
            ></el-tree>
          </el-card>
        </el-col>
        <el-col :span="20">
          <div class="filter-container" v-show="searchFilterVisible">
            <el-form :inline="true" :model="searchForm" ref="searchForm">
              <el-form-item label="名称" prop="name">
                <el-input class="filter-item input-normal" size="small" v-model="searchForm.name"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button
                  @click="handleFilter"
                  icon="el-icon-search"
                  size="small"
                  type="primary"
                >查询
                </el-button>
                <el-button @click="searchReset" icon="icon-rest" size="small">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
          <!-- 表格功能列 -->

          <div class="table-menu">
            <div class="table-menu-left">
              <el-button
                @click="handleEdit"
                icon="el-icon-plus"
                size="mini"
                type="primary"
                v-if="sys_role_edit"
              >添加
              </el-button>
            </div>
            <div class="table-menu-right">
              <el-button
                @click="searchFilterVisible= !searchFilterVisible"
                circle
                icon="el-icon-search"
                size="mini"
              ></el-button>
            </div>
          </div>
          <el-table
            :data="list"
            :key="tableKey"
            @sort-change="sortChange"
            element-loading-text="加载中..."
            fit
            highlight-current-row
            v-loading="listLoading"
          >
            <!-- <el-table-column fixed="left" type="index" width="20"></el-table-column> -->
            <el-table-column align="center" label="角色名称" width="100">
              <template slot-scope="scope">
                <span>{{scope.row.name}}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="角色标识" width="140">
              <template slot-scope="scope">
                <span>{{scope.row.code}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="数据权限" width="180">
              <template slot-scope="scope">
                <span>{{scope.row.dataScopeText}}</span>
              </template>
            </el-table-column>
            <el-table-column align="center" label="角色描述">
              <template slot-scope="scope">
                <span>{{scope.row.remark}}</span>
              </template>
            </el-table-column>

            <el-table-column align="center" label="是否可用" width="80">
              <template slot-scope="scope">
                <el-tag>{{scope.row.availableText}}</el-tag>
              </template>
            </el-table-column>
            <el-table-column align="center" label="创建时间" prop="a.created_date" sortable="custom">
              <template slot-scope="scope">
                <span>{{scope.row.createdDate}}</span>
              </template>
            </el-table-column>

            <el-table-column
              align="center"
              fixed="right"
              label="操作"
              v-if="sys_role_edit || sys_role_lock || sys_role_del"
              width="130"
            >
              <template slot-scope="scope">
                <el-button
                  @click="handleEdit(scope.row)"
                  icon="icon-edit"
                  title="编辑"
                  type="text"
                  v-if="sys_role_edit"
                ></el-button>
                <el-button
                  :icon="scope.row.available == '0' ? 'icon-lock' : 'icon-unlock'"
                  :title="scope.row.available == '0' ? '锁定' : '解锁'"
                  @click="handleLock(scope.row)"
                  type="text"
                  v-if="sys_role_lock"
                ></el-button>
                <el-button
                  @click="handleDelete(scope.row)"
                  icon="icon-delete"
                  title="删除"
                  type="text"
                  v-if="sys_role_del"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
          <div class="pagination-container" v-show="!listLoading">
            <el-pagination
              :current-page.sync="listQuery.current"
              :page-size="listQuery.size"
              :page-sizes="[10,20,30, 50]"
              :total="total"
              @current-change="handleCurrentChange"
              @size-change="handleSizeChange"
              background
              class="pull-right"
              layout="total, sizes, prev, pager, next, jumper"
            ></el-pagination>
          </div>
        </el-col>
      </el-row>
      <el-dialog :visible.sync="dialogDeptVisible" title="选择部门">
        <el-tree
          :data="treeDeptData"
          :default-checked-keys="checkedKeys"
          @node-click="clickNodeSelectData"
          check-strictly
          class="filter-tree"
          default-expand-all
          highlight-current
          node-key="id"
        ></el-tree>
      </el-dialog>
      <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
        <el-form :model="form" label-width="100px" ref="form">
          <!--      <el-form-item label="头像" prop="avatar">-->
          <!--        <my-upload field="uploadFile" @crop-upload-success="cropUploadSuccess" v-model="showUpload"-->
          <!--                   :width="300" :height="300" :url="ctx+'/file/upload'" :headers="headers" img-format="png"></my-upload>-->
          <!--        <img :src="getFilePath(form.avatar)" class="header-img" />-->
          <!--        <input type="hidden" v-model="form.avatar" />-->
          <!--        <el-button type="primary" @click="showUpload = !showUpload" size="mini">选择-->
          <!--          <i class="el-icon-upload el-icon--right"></i>-->
          <!--        </el-button>-->
          <!--      </el-form-item>-->
          <el-form-item
            :rules="[{required: true,message: '请选择部门', trigger: 'change'}]"
            label="所属部门"
            prop="deptName"
          >
            <el-input
              @focus="dialogDeptVisible=true"
              placeholder="选择部门"
              readonly
              v-model="form.deptName"
            ></el-input>
            <input type="hidden" v-model="form.deptId"/>
          </el-form-item>

          <el-form-item
            :rules="[
          {required: true,message: '请输入角色名称'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'}
        ]"
            label="角色名称"
            prop="name"
          >
            <el-input placeholder="请输入角色名称" v-model="form.name"></el-input>
          </el-form-item>
          <el-form-item
            :rules="[{required: true,message: '请输入角色标识'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'}]"
            label="角色标识"
            prop="code"
          >
            <el-input placeholder="请输入角色标识" v-model="form.code"></el-input>
          </el-form-item>
          <!-- <el-form-item :rules="[{required: true,message: '请选择' }]" label="数据权限" prop="dataScope">
            <CrudSelect
              :dic="dataScopeOptions"
              @input="handleDataScopeChange"
              v-model="form.dataScope"
            ></CrudSelect>
          </el-form-item>-->

          <el-row :gutter="20" :span="24">
            <el-col :span="12">
              <el-form-item label="操作权限" prop="menuIdList">
                <el-tree
                  :data="treeMenuData"
                  @check="getNodeTreeMenuData"
                  class="filter-tree"
                  node-key="id"
                  ref="treeMenu"
                  show-checkbox
                ></el-tree>
              </el-form-item>
            </el-col>
            <el-col :span="10" v-show="formTreeDeptDataVisible">
              <el-form-item label="机构权限" prop="orgIdList" v-show="formTreeDeptDataVisible">
                <el-tree
                  :data="treeDeptData"
                  @check="getNodeTreeDeptData"
                  class="filter-tree"
                  default-expand-all
                  node-key="id"
                  ref="treeDept"
                  show-checkbox
                ></el-tree>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item
            :rules="[{required: true,message: '请选择',trigger: 'change' }]"
            label="是否可用"
            prop="available"
          >
            <CrudRadio :dic="flagOptions" v-model="form.available"></CrudRadio>
          </el-form-item>
          <el-form-item
            :rules="[{required: true, message: '请输入角色描述'},{max: 200,message: '长度在 不超过 200 个字符'}]"
            label="角色描述"
            prop="remark"
          >
            <el-input v-model="form.remark"></el-input>
          </el-form-item>
          <el-form-item
            :rules="[{required: false},{max: 200,message: '长度在 不超过 200 个字符'}]"
            label="备注"
            prop="description"
          >
            <el-input placeholder type="textarea" v-model="form.description"></el-input>
          </el-form-item>
        </el-form>
        <div class="dialog-footer" slot="footer">
          <el-button @click="cancel()" size="small">取 消</el-button>
          <el-button @click="resetForm()" size="small" v-if="showreset">重 置</el-button>
          <el-button @click="save()" size="small" type="primary">保 存</el-button>
        </div>
      </el-dialog>
    </basic-container>
  </div>
</template>

<script>
    import roleService from "./role-service";
    import menuService from "../menu/menu-service";
    import deptService from "../dept/dept-service";
    import {mapGetters} from "vuex";
    import util from "@/util/util";
    import validate from "@/util/validate";
    import CrudSelect from "@/components/avue/crud-select";
    import CrudRadio from "@/components/avue/crud-radio";

    export default {
        name: "Role",
        components: {CrudSelect, CrudRadio},
        data() {
            return {
                showreset: false,
                treeDept: [],
                treeMenuData: [],
                treeDeptData: [],
                dialogFormVisible: false,
                searchFilterVisible: true,
                checkedKeys: [],
                searchTree: false,
                filterText: "",
                list: null,
                total: null,
                listLoading: true,
                searchForm: {},
                listQuery: {
                    current: 1,
                    size: 20
                },
                formEdit: true,
                flagOptions: [],
                dataScopeOptions: [],
                form: {
                    deptId: undefined,
                    name: undefined,
                    dataScope: undefined,
                    code: undefined,
                    menuIdList: [],
                    deptIdList: [],
                    remark: undefined,
                    available: undefined,
                    description: undefined
                },
                dialogDeptVisible: false,
                formTreeDeptDataVisible: false,
                dialogStatus: "create",
                textMap: {
                    update: "编辑",
                    create: "创建"
                },
                sys_role_edit: false,
                sys_role_lock: false,
                sys_role_del: false,
                currentNode: {},
                tableKey: 0
            };
        },
        watch: {
            filterText(val) {
                this.$refs["leftDeptTree"].filter(val);
            }
        },
        created() {
            this.getTreeDept();
            this.getList();
            this.sys_role_edit = this.permissions["sys_role_edit"];
            this.sys_role_lock = this.permissions["sys_role_lock"];
            this.sys_role_del = this.permissions["sys_role_del"];
            this.flagOptions = this.dicts["sys_flag"];
            this.dataScopeOptions = this.dicts["sys_data_scope"];
            menuService.getUserPermit().then(rs => {
                this.treeMenuData = util.parseTreeData(rs.data);
            });
            deptService.fetchTreeUser().then(response => {
                this.treeDeptData = util.parseTreeData(response.data);
            });
        },
        computed: {
            ...mapGetters(["permissions", "dicts"])
        },
        methods: {
            getList() {
                this.listLoading = true;
                this.listQuery.queryConditionJson = util.parseJsonItemForm([
                    {
                        fieldName: "a.name",
                        value: this.searchForm.name
                    },
                    {
                        fieldName: "r.dept_id",
                        value: this.searchForm.deptId,
                        operate: "eq"
                    }
                ]);
                roleService.page(this.listQuery).then(response => {
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
            getTreeDept() {
                deptService.fetchTreeUser().then(response => {
                    this.treeDeptData = util.parseTreeData(response.data);
                    this.searchForm.parentId = this.treeDeptData[0].id;
                    setTimeout(() => {
                        this.$refs.leftDeptTree.setCurrentKey(this.searchForm.parentId);
                    }, 0);
                });
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            clickNodeTreeData(data) {
                this.searchForm.deptId = data.id;
                this.currentNode = data;
                this.getList();
            },
            clickNodeSelectData(data) {
                this.form.deptId = data.id;
                this.form.deptName = data.label;
                this.dialogDeptVisible = false;
            },
            //搜索清空
            searchReset() {
                this.$refs["searchForm"].resetFields();
                this.getList();
            },
            handleFilter() {
                this.listQuery.current = 1;
                this.getList();
            },
            handleSizeChange(val) {
                this.listQuery.size = val;
                this.getList();
            },
            handleCurrentChange(val) {
                this.listQuery.current = val;
                this.getList();
            },
            handleEdit(row) {
                this.getTreeDept();
                this.showreset = row.id ? false : true;
                this.resetForm();
                this.dialogStatus =
                    row && validate.checkNotNull(row.id) ? "update" : "create";
                if (this.dialogStatus == "create") {
                    this.dialogFormVisible = true;
                } else {
                    roleService.find(row.id).then(response => {
                        this.form = response.data;
                        this.dialogFormVisible = true;
                        this.formTreeDeptDataVisible = this.form.dataScope == 5;
                        if (validate.checkNull(this.form.deptIdList)) {
                            this.form.deptIdList = [];
                        }
                        this.form.dataScope = util.objToStr(this.form.dataScope);
                        let checkTree = function (tree, idList) {
                            idList.forEach(id => {
                                tree.setChecked(id, true, false);
                            });
                        };
                        if (this.$refs.treeMenu) {
                            checkTree(this.$refs.treeMenu, this.form.menuIdList);
                            checkTree(this.$refs.treeDept, this.form.deptIdList);
                        } else {
                            setTimeout(() => {
                                checkTree(this.$refs.treeMenu, this.form.menuIdList);
                                checkTree(this.$refs.treeDept, this.form.deptIdList);
                            }, 100);
                        }
                    });
                }
            },
            handleLock: function (row) {
                roleService.lock(row.id).then(response => {
                    this.getList();
                });
            },
            handleDelete(row) {
                this.$confirm("此操作将永久删除, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    roleService.remove(row.id).then(rs => {
                        this.getList();
                    });
                });
            },
            handleDataScopeChange(value) {
                this.formTreeDeptDataVisible = value == 5;
            },
            getNodeTreeMenuData(data, obj) {
                this.form.menuIdList = obj.checkedKeys;
            },
            getNodeTreeDeptData(data, obj) {
                this.form.deptIdList = obj.checkedKeys;
            },
            save() {
                this.$refs["form"].validate(valid => {
                    if (valid) {
                        roleService.save(this.form).then(() => {
                            this.getList();
                            this.dialogFormVisible = false;
                        });
                    } else {
                        return false;
                    }
                });
            },
            cancel() {
                this.dialogFormVisible = false;
                this.$refs["form"].resetFields();
            },
            resetForm() {
                this.form = {
                    name: undefined,
                    deptId: undefined,
                    deptName: undefined,
                    dataScope: undefined,
                    code: undefined,
                    menuIdList: [],
                    deptIdList: [],
                    remark: undefined,
                    available: undefined,
                    description: undefined
                };
                this.$refs["form"] && this.$refs["form"].resetFields();
                if (this.$refs["treeMenu"]) {
                    this.$refs["treeMenu"].setCheckedKeys([]);
                }
                // this.$refs.treeDept.setCheckedKeys([]);
            }
        }
    };
</script>

