<template>
    <div class="app-container calendar-list-container">
        <basic-container>
            <div class="filter-container">
                <el-form :inline="true" :model="searchPropertyTypeForm" ref="searchPropertyTypeForm"
                         v-show="searchFilterVisible">
                    <el-form-item label="类型名称" prop="name">
                        <el-input class="filter-item input-normal" v-model="searchPropertyTypeForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="" prop="status">
                        <CrudSelect class="filter-item input-normal" v-model="searchPropertyTypeForm.status"
                                    :dic="statusOptions"/>
                    </el-form-item>
                    <el-form-item label="" prop="createdDate">
                        <el-date-picker
                                v-model="searchPropertyTypeForm.createdDate"
                                value-format="yyyy-MM-dd HH:mm:ss"
                                type="daterange"
                                range-separator="至"
                                start-placeholder="开始日期"
                                end-placeholder="结束日期">
                        </el-date-picker>
                    </el-form-item>
                    <el-form-item>
                        <el-button size="small" type="primary" icon="el-icon-search" @click="handleFilter">查询
                        </el-button>
                        <el-button size="small" @click="searchReset" icon="icon-rest">重置</el-button>
                    </el-form-item>
                </el-form>
            </div>

            <!-- 表格功能列 -->
            <div class="table-menu">
                <div class="table-menu-left">
                    <el-button-group>
                        <el-button size="mini" v-if="property_propertyType_edit" class="filter-item" @click="handleEdit"
                                   type="primary" icon="edit">添加
                        </el-button>
                    </el-button-group>
                </div>
                <div class="table-menu-right">
                    <el-button icon="el-icon-search" circle size="mini"
                               @click="searchFilterVisible= !searchFilterVisible"></el-button>
                </div>
            </div>
            <el-table :key='tableKey' @sort-change="sortChange" :data="list" v-loading="listLoading"
                      element-loading-text="加载中..." fit highlight-current-row :row-class-name="tableRowClassName">
                <el-table-column
                        align="center"
                        :formatter="formatter"
                        label="序号">
                </el-table-column>
                <el-table-column align="center" label="类型名称">
                    <template slot-scope="scope">
                        <span>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="类型编号">
                    <template slot-scope="scope">
                        <span>{{scope.row.code}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="类型描述">
                    <template slot-scope="scope">
                        <span>{{scope.row.description}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="所属上级">
                    <template slot-scope="scope">
                        <span>{{getNameByPid(scope.row.pid)}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="创建者">
                    <template slot-scope="scope">
                        <span>{{scope.row.createName}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope">
                        <span>{{scope.row.createdDate}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="是否可用">
                    <template slot-scope="scope">
                        <el-tag>{{isFlag(scope.row.status)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" fixed="right" label="操作"
                                 v-if="property_propertyType_edit || property_propertyType_del">
                    <template slot-scope="scope">
                        <el-button v-if="property_propertyType_edit" icon="icon-edit" title="编辑" type="text"
                                   @click="handleEdit(scope.row)">
                        </el-button>
                        <el-button v-if="property_propertyType_del" icon="icon-delete" title="删除" type="text"
                                   @click="handleDelete(scope.row)">
                        </el-button>
                    </template>
                </el-table-column>

            </el-table>

            <div v-show="!listLoading" class="pagination-container">
                <el-pagination @size-change="handleSizeChange" @current-change="handleCurrentChange"
                               :current-page.sync="listQuery.page" :page-sizes="[10,20,30, 50]"
                               :page-size="listQuery.size"
                               layout="total, sizes, prev, pager, next, jumper" :total="total">
                </el-pagination>
            </div>
            <el-dialog :title="textMap[dialogStatus]" :visible.sync="dialogFormVisible">
                <el-form :model="form" ref="form" label-width="100px">
                    <el-form-item label="类型名称" prop="name"
                                  :rules="[{required: true,message: '请输入名称'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-input v-model="form.name"></el-input>

                    </el-form-item>
                    <el-form-item label="类型编号" prop="code"
                                  :rules="[{required: true,message: '请输入编号'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-input v-model="form.code"></el-input>

                    </el-form-item>
                    <el-form-item label="所属上级" prop="pid"
                                  :rules="[{required: false,message: '请输入所属上级'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <!--            <CrudSelect v-model="form.pid" :dic="pidOptions"></CrudSelect>-->
                        <el-select v-model="form.pid" placeholder="请选择">
                            <el-option
                                    v-for="item in pidOptions"
                                    v-if="item.status == 1 && item.delFlag == 0"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="类型备注" prop="description"
                                  :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
                        <el-input type="textarea" v-model="form.description"></el-input>

                    </el-form-item>

                    <el-form-item label="是否停用" prop="status">
                        <el-switch active-value="0" inactive-value="1" v-model="form.status"></el-switch>

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
    import {mapGetters} from "vuex";
    import propertyTypeService from "./property-type-service";
    import validate from "@/util/validate";
    import util from "@/util/util";
    import CrudSelect from "@/components/avue/crud-select";
    import CrudCheckbox from "@/components/avue/crud-checkbox";
    import CrudRadio from "@/components/avue/crud-radio";

    export default {
        name: "table_property_propertyType",
        components: {CrudSelect, CrudCheckbox, CrudRadio},
        data() {
            return {
                searchFilterVisible: true,
                dialogFormVisible: false,
                list: null,
                total: null,
                listLoading: true,
                searchPropertyTypeForm: {},
                listQuery: {
                    page: 1,
                    size: 20
                },
                form: {
                    description: undefined,
                    name: undefined,
                    code: undefined,
                    pid: undefined,
                },
                pidOptions: [{value: 1, label: '测试'}, {value: 2, label: '123ces'}],
                statusOptions: [{value: "", label: '全部状态'}, {value: 1, label: '启用'}, {value: 0, label: '停用'}],
                pidOptionsMap: {},
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
                    update: '编辑资产类型',
                    create: '创建资产类型'
                },
                tableKey: 0
            };
        },
        computed: {
            ...mapGetters(["permissions", "dicts"])
        },
        filters: {},
        created() {
            this.getAll()
            this.getList();
            this.property_propertyType_edit = this.permissions["property_propertyType_edit"];
            this.property_propertyType_del = this.permissions["property_propertyType_del"];
            this.delFlagOptions = this.dicts["sys_flag"];
        },
        methods: {
            isFlag(flag) {
                for (let i = 0; i < this.delFlagOptions.length; i++) {
                    if (flag == this.delFlagOptions[i].value) {
                        return this.delFlagOptions[i].label
                    }
                }
            },
            getAll() {
                propertyTypeService.getAll().then(res => {
                    this.pidOptions = res.data
                    this.pidOptionsMap = new Map(this.pidOptions.map(i => [i.value, i]))
                    console.log(this.pidOptionsMap)
                })
            },
            getNameByPid(pid) {
                let obj = this.pidOptionsMap.get(pid)
                if (obj) {
                    return obj.label
                }
            },
            tableRowClassName({row, rowIndex}) {
                // 把每一行的索引放进row
                row.rowIndex = rowIndex
            },
            formatter(row, column, cellValue, index) {
                //放回索引值
                return this.listQuery.size * (this.listQuery.page - 1) + 1 + row.rowIndex;
            },
            getList() {
                this.listLoading = true;
                this.listQuery.queryConditionJson = util.parseJsonItemForm([
                    {fieldName: 'name', value: this.searchPropertyTypeForm.name, operate: 'like', attrType: 'String'},
                    {
                        fieldName: 'status',
                        value: this.searchPropertyTypeForm.status,
                        operate: 'eq',
                        attrType: 'Integer'
                    },
                    {
                        fieldName: 'createdDate',
                        value: this.searchPropertyTypeForm.createdDate,
                        operate: 'between',
                        attrType: 'java.util.Date'
                    },
                ])
                propertyTypeService.page(this.listQuery).then(response => {
                    this.list = response.data.records;
                    this.total = response.data.total;
                    this.listLoading = false;
                });
            },
            sortChange(column) {
                if (column.order == "ascending") {
                    this.listQuery.ascs = column.prop
                    this.listQuery.descs = undefined;
                } else {
                    this.listQuery.descs = column.prop
                    this.listQuery.ascs = undefined;
                }
                this.getList()
            },
            searchReset() {
                this.$refs['searchPropertyTypeForm'].resetFields();
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
                this.dialogStatus = row && !validate.checkNull(row.id) ? "update" : "create";
                if (this.dialogStatus == "create") {
                    this.dialogFormVisible = true;
                } else {
                    propertyTypeService.find(row.id).then(response => {
                        this.form = response.data;
                        this.form.delFlag = validate.toString(this.form.delFlag);
                        this.form.status = this.form.status + ""
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
                        this.form.status = parseInt(this.form.status)
                        propertyTypeService.save(this.form).then((data) => {
                            this.getAll()
                            this.getList()
                            this.cancel()
                        });
                    } else {
                        return false;
                    }
                });
            },
            handleDelete(row) {
                this.$confirm(
                    "此操作将永久删除该资产类型, 是否继续?",
                    "提示",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }
                ).then(() => {
                    propertyTypeService.remove(row.id).then((data) => {
                        this.getList();
                    });
                });
            },
            resetForm() {
                this.form = {
                    description: "",
                    name: "",
                    code: "",
                    pid: "",
                };
                this.$refs['form'] && this.$refs['form'].resetFields();
            }
        }
    };
</script>
