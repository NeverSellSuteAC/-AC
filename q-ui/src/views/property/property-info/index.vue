<template>
    <div class="app-container calendar-list-container">
        <basic-container>
            <div class="filter-container">
                <el-form :inline="true" :model="searchPropertyInfoForm" ref="searchPropertyInfoForm"
                         v-show="searchFilterVisible">
                    <el-form-item label="名称" prop="name">
                        <el-input class="filter-item input-normal" v-model="searchPropertyInfoForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="" prop="status">
                        <CrudSelect class="filter-item input-normal" v-model="searchPropertyInfoForm.status"
                                    :dic="statusOptions"/>
                    </el-form-item>
                    <el-form-item label="" prop="createdDate">
                        <el-date-picker
                                v-model="searchPropertyInfoForm.createdDate"
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
                        <el-button size="mini" v-if="property_propertyInfo_edit" class="filter-item" @click="handleEdit"
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
                <el-table-column align="center" label="资产名称">
                    <template slot-scope="scope">
                        <span>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="资产编号">
                    <template slot-scope="scope">
                        <span>{{scope.row.code}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="资产类型">
                    <template slot-scope="scope">
                        <span>{{getNameByPid(scope.row.type)}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="资产备注">
                    <template slot-scope="scope">
                        <span>{{scope.row.remark}}</span>
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
                <el-table-column align="center" label="状态">
                    <template slot-scope="scope">
                        <el-tag>{{isFlag(scope.row.status)}}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column align="center" fixed="right" label="操作"
                                 v-if="property_propertyInfo_edit || property_propertyInfo_del">
                    <template slot-scope="scope">
                        <el-button v-if="property_propertyInfo_edit" icon="icon-edit" title="编辑" type="text"
                                   @click="handleEdit(scope.row)">
                        </el-button>
                        <el-button v-if="property_propertyInfo_del" icon="icon-delete" title="删除" type="text"
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
                    <!--<el-form-item label="备注" prop="description" :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
                            <el-input type="textarea" v-model="form.description"></el-input>

                    </el-form-item>-->
                    <el-form-item label="资产编号" prop="code"
                                  :rules="[{required: true,message: '请输入资产编号'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-input v-model="form.code"></el-input>

                    </el-form-item>
                    <el-form-item label="资产名称" prop="name"
                                  :rules="[{required: true,message: '请输入资产名称'},{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
                        <el-input v-model="form.name"></el-input>

                    </el-form-item>
                    <el-form-item label="资产类型" prop="type" :rules="[{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-select v-model="form.type" placeholder="请选择">
                            <el-option
                                    v-for="item in typeOptions"
                                    v-if="item.status == 1 && item.delFlag == 0"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="场站" prop="sid" :rules="[{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-select v-model="form.sid" placeholder="请选择">
                            <el-option
                                    v-for="item in sidOptions"
                                    v-if="item.status == 1 && item.delFlag == 0"
                                    :key="item.value"
                                    :label="item.label"
                                    :value="item.value">
                            </el-option>
                        </el-select>
                    </el-form-item>
                    <el-form-item label="资产备注" prop="remark" :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
                        <el-input type="textarea" v-model="form.remark"></el-input>

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
    import propertyInfoService from "./property-info-service";
    import validate from "@/util/validate";
    import util from "@/util/util";
    import CrudSelect from "@/components/avue/crud-select";
    import CrudCheckbox from "@/components/avue/crud-checkbox";
    import CrudRadio from "@/components/avue/crud-radio";

    export default {
        name: "table_property_propertyInfo",
        components: {CrudSelect, CrudCheckbox, CrudRadio},
        data() {
            return {
                searchFilterVisible: true,
                dialogFormVisible: false,
                list: null,
                total: null,
                listLoading: true,
                searchPropertyInfoForm: {},
                listQuery: {
                    page: 1,
                    size: 20
                },
                form: {
                    description: undefined,
                    name: undefined,
                    code: undefined,
                    type: undefined,
                    lng: undefined,
                    lat: undefined,
                    sid: undefined,
                    remark: undefined,
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
                delFlagOptions: [],
                typeOptions: [],
                typeOptionsMap: undefined,
                sidOptions: [],
                dialogStatus: 'create',
                statusOptions: [{value: "", label: '全部状态'}, {value: 1, label: '启用'}, {value: 0, label: '停用'}],
                textMap: {
                    update: '编辑资产信息',
                    create: '创建资产信息'
                },
                tableKey: 0
            };
        },
        computed: {
            ...mapGetters(["permissions", "dicts"])
        },
        filters: {},
        created() {
            this.getPropertyTypeAll()
            this.getList();
            this.getStationAll()
            this.property_propertyInfo_edit = this.permissions["property_propertyInfo_edit"];
            this.property_propertyInfo_del = this.permissions["property_propertyInfo_del"];
            this.delFlagOptions = this.dicts["sys_flag"];
        },
        methods: {
            isFlag(flag) {
                if (flag == 0) {
                    return '停用'
                }
                return '启用'
            },
            getPropertyTypeAll() {
                propertyInfoService.getPropertyTypeAll().then(res => {
                    this.typeOptions = res.data
                    this.typeOptionsMap = new Map(this.typeOptions.map(i => [i.value, i]))
                })
            },
            getStationAll() {
                propertyInfoService.getAllStation().then(res => {
                    console.log(res)
                    this.sidOptions = res.data
                })
            },
            getNameByPid(pid) {
                let obj = this.typeOptionsMap.get(pid)
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
                    {fieldName: 'name', value: this.searchPropertyInfoForm.name, operate: 'like', attrType: 'String'},
                    {
                        fieldName: 'status',
                        value: this.searchPropertyInfoForm.status,
                        operate: 'eq',
                        attrType: 'Integer'
                    },
                    {
                        fieldName: 'createdDate',
                        value: this.searchPropertyInfoForm.createdDate,
                        operate: 'between',
                        attrType: 'java.util.Date'
                    },
                ])
                propertyInfoService.page(this.listQuery).then(response => {
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
                this.$refs['searchPropertyInfoForm'].resetFields();
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
                this.getPropertyTypeAll()
                this.getStationAll()
                this.dialogStatus = row && !validate.checkNull(row.id) ? "update" : "create";
                if (this.dialogStatus == "create") {
                    this.dialogFormVisible = true;
                } else {
                    propertyInfoService.find(row.id).then(response => {
                        this.form = response.data;
                        this.form.delFlag = validate.toString(this.form.delFlag);
                        this.form.status = this.form.status + ''
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
                        propertyInfoService.save(this.form).then((data) => {
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
                    "此操作将永久删除该资产信息, 是否继续?",
                    "提示",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }
                ).then(() => {
                    propertyInfoService.remove(row.id).then((data) => {
                        this.getList();
                    });
                });
            },
            resetForm() {
                this.form = {
                    description: "",
                    name: "",
                    code: "",
                    type: "",
                    lng: "",
                    lat: "",
                    sid: "",
                    remark: "",
                };
                this.$refs['form'] && this.$refs['form'].resetFields();
            }
        }
    };
</script>
