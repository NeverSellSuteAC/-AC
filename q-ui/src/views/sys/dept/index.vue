`<!--
  -    Copyright (c) 2018-2025, lengleng All rights reserved.
  -
  - Redistribution and use in source and binary forms, with or without
  - modification, are permitted provided that the following conditions are met:
  -
  - Redistributions of source code must retain the above copyright notice,
  - this list of conditions and the following disclaimer.
  - Redistributions in binary form must reproduce the above copyright
  - notice, this list of conditions and the following disclaimer in the
  - documentation and/or other materials provided with the distribution.
  - Neither the name of the pig4cloud.com developer nor the names of its
  - contributors may be used to endorse or promote products derived from
  - this software without specific prior written permission.
  - Author: lengleng (wangiegie@gmail.com)
  -->

<template>
  <div class="app-container calendar-list-container">
    <basic-container>
      <div class="filter-container">
        <el-button-group>
          <el-button
            @click="handlerAdd"
            icon="plus"
            size="small"
            type="primary"
            v-if="sys_dept_edit"
          >添加
          </el-button>
          <el-button
            @click="handlerEdit"
            icon="edit"
            size="small"
            type="primary"
            v-if="sys_dept_edit"
          >编辑
          </el-button>
          <el-button
            @click="handleDelete"
            icon="delete"
            size="small"
            type="primary"
            v-if="sys_dept_del"
          >删除
          </el-button>
        </el-button-group>
      </div>

      <el-row>
        <el-col :span="4" style="margin-top:15px;">
          <el-tree
            :data="treeDeptData"
            :expand-on-click-node="false"
            :filter-node-method="filterNode"
            @node-click="getNodeData"
            class="filter-tree"
            default-expand-all
            highlight-current
            node-key="id"
          ></el-tree>
        </el-col>
        <el-dialog :visible.sync="dialogDeptVisible" title="选择父级节点">
          <el-tree
            :data="treeDeptSelectData"
            @node-click="clickNodeSelectData"
            check-strictly
            class="filter-tree"
            default-expand-all
            highlight-current
            node-key="id"
            ref="selectParentDeptTree"
          ></el-tree>
        </el-dialog>
        <el-col :span="20" style="margin-top:15px;">
          <el-card class="box-card">
            <el-form
              :label-position="labelPosition"
              :model="form"
              :rules="rules"
              label-width="80px"
              ref="form"
            >
              <el-form-item label="父级节点" prop="parentName" v-if="showParentName">
                <el-input
                  :disabled="formEdit"
                  @focus="handleParentDeptTree()"
                  placeholder="选择父级节点"
                  v-model="form.parentName"
                ></el-input>
                <input type="hidden" v-model="form.parentId"/>
              </el-form-item>

              <!-- <el-form-item label="节点编号" prop="deptId" v-if="formEdit">
                <el-input :disabled="formEdit" placeholder="节点编号" v-model="form.deptId"></el-input>
              </el-form-item>-->
              <el-form-item label="部门名称" prop="name">
                <el-input :disabled="formEdit" placeholder="请输入名称" v-model="form.name"></el-input>
              </el-form-item>
              <el-form-item label="排序" prop="orderNum">
                <el-input
                  :disabled="formEdit"
                  placeholder="请输入排序"
                  type="number"
                  v-model="form.sort"
                ></el-input>
              </el-form-item>
              <el-form-item label="描述" prop="description">
                <el-input
                  :disabled="formEdit"
                  placeholder
                  type="textarea"
                  v-model="form.description"
                ></el-input>
              </el-form-item>
              <el-button @click="save" size="small" type="primary" v-show="dialog_visible">保存</el-button>
              <el-button @click="onCancel" size="small" v-show="dialog_visible">取消</el-button>
            </el-form>
          </el-card>
        </el-col>
      </el-row>
    </basic-container>
  </div>
</template>

<script>
    import deptService from "./dept-service";
    import {mapGetters} from "vuex";
    import util from "@/util/util";

    export default {
        name: "dept",
        data() {
            return {
                dialogDeptVisible: false,
                list: null,
                total: null,
                formEdit: true,
                formAdd: true,
                formStatus: "",
                showElement: false,
                treeDeptData: [],
                treeDeptSelectData: [],
                dialog_visible: false,
                now: null,
                rules: {
                    parentName: [
                        {required: true, message: "请输入父级节点", trigger: "change"}
                    ],
                    deptId: [
                        {required: true, message: "请输入节点编号", trigger: "blur"}
                    ],
                    name: [
                        {required: true, message: "请输入部门名称", trigger: "blur"},
                        {min: 0, max: 50, message: "长度在 0 到 50 个字符"}
                    ],
                    description: [
                        {required: false},
                        {min: 0, max: 100, message: "长度在 0 到 100 个字符"}
                    ]
                },
                labelPosition: "right",
                form: {
                    name: undefined,
                    parentName: undefined,
                    orderNum: undefined,
                    parentId: undefined,
                    deptId: undefined,
                    description: undefined
                },
                currentId: 0,
                sys_dept_edit: false,
                sys_dept_del: false,
                showParentName: undefined
            };
        },
        created() {
            this.getList(true);
            this.sys_dept_edit = this.permissions["sys_dept_edit"];
            this.sys_dept_del = this.permissions["sys_dept_del"];
            this.dialogDeptVisible = false;
            this.showParentName = false;
        },
        computed: {
            ...mapGetters(["elements", "permissions"])
        },
        methods: {
            getList(first) {
                deptService.fetchTreeUser().then(response => {
                    this.treeDeptData = response.data;
                });
            },
            filterNode(value, data) {
                if (!value) return true;
                return data.label.indexOf(value) !== -1;
            },
            getNodeData(data) {
                this.now = data;
                if (!this.formEdit) {
                    this.formStatus = "update";
                }
                deptService.get(data.id).then(response => {
                    this.showParentName = data.id != "1";
                    this.form = response.data;
                });

                this.currentId = data.id;
                this.showElement = true;
            },
            clickNodeSelectData(data) {
                this.form.parentId = data.id;
                this.form.parentName = data.label;
                this.dialogDeptVisible = false;
            },
            handleParentDeptTree() {
                deptService.fetchTreeUser({extId: this.form.id}).then(response => {
                    this.treeDeptSelectData = util.parseTreeData(response.data);
                    this.dialogDeptVisible = true;
                    setTimeout(() => {
                        this.$refs["selectParentDeptTree"].setCurrentKey(
                            this.form.parentId ? this.form.parentId : null
                        );
                    }, 100);
                });
            },
            handlerEdit() {
                if (!this.now) {
                    this.$message.error('请先选择被编辑的部门');
                    return;
                }
                this.dialog_visible = true;
                if (this.form.id) {
                    this.formEdit = false;
                    this.formStatus = "update";
                }
            },
            handlerAdd() {
                this.showParentName = true;
                this.dialog_visible = true;
                this.resetForm();
                this.formEdit = false;
                this.formStatus = "create";
            },
            handleDelete() {
                if (!this.now) {
                    this.$message.error('请先选择被删除的部门');
                    return;
                }
                this.$confirm("此操作将永久删除, 是否继续?", "提示", {
                    confirmButtonText: "确定",
                    cancelButtonText: "取消",
                    type: "warning"
                }).then(() => {
                    deptService.remove(this.currentId).then(response => {
                        this.getList(true);
                        this.resetForm();
                        this.onCancel();
                        this.$notify({
                            title: "成功",
                            message: "删除成功",
                            type: "success",
                            duration: 2000
                        });
                    });
                });
            },
            save() {
                this.$refs.form.validate(valid => {
                    if (!valid) return;
                    deptService.save(this.form).then(response => {
                        this.getList(false);
                        this.dialog_visible = false;
                        this.onCancel();
                    });
                });
            },
            onCancel() {
                var data = JSON.stringify(this.form);
                this.$refs.form.resetFields();
                this.form = JSON.parse(data);
                this.formEdit = true;
                this.formStatus = "";
                this.dialog_visible = false;
            },
            resetForm() {
                this.form = {
                    parentName: undefined,
                    name: undefined,
                    orderNum: undefined,
                    parentId: undefined,
                    deptId: undefined,
                    description: undefined
                };
            }
        }
    };
</script>

