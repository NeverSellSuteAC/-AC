<template>
    <div class="app-container calendar-list-container">
        <basic-container>
            <div class="filter-container">
                <el-form :inline="true" :model="searchStationForm" ref="searchStationForm" v-show="searchFilterVisible">
                    <el-form-item label="名称" prop="name">
                        <el-input class="filter-item input-normal" v-model="searchStationForm.name"></el-input>
                    </el-form-item>
                    <el-form-item label="" prop="status">
                        <CrudSelect class="filter-item input-normal" v-model="searchStationForm.status"
                                    :dic="statusOptions"/>
                    </el-form-item>
                    <el-form-item label="" prop="createdDate">
                        <!--            <el-date-picker class="filter-item input-normal" value-format="yyyy-MM-dd" placeholder="创建时间"-->
                        <!--                            v-model="searchStationForm.createdDate"/>-->
                        <el-date-picker
                                v-model="searchStationForm.createdDate"
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
                        <el-button size="mini" v-if="station_station_edit" class="filter-item" @click="handleEdit"
                                   type="primary"
                                   icon="edit">添加
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
                <el-table-column align="center" label="场站名称">
                    <template slot-scope="scope">
                        <span>{{scope.row.name}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="场站编号">
                    <template slot-scope="scope">
                        <span>{{scope.row.code}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="站长">
                    <template slot-scope="scope">
                        <span>{{getLabelByVal(scope.row.staUser)}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="经纬度">
                    <template slot-scope="scope">
                        <span v-if="scope.row.lat > 0">{{scope.row.lng}}, {{scope.row.lat}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="备注信息">
                    <template slot-scope="scope">
                        <span>{{scope.row.remark}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" label="添加人">
                    <template slot-scope="scope">
                        <span>{{scope.row.createName}}</span>
                    </template>

                </el-table-column>
                <el-table-column align="center" label="创建时间">
                    <template slot-scope="scope">
                        <span>{{scope.row.createdDate}}</span>
                    </template>
                </el-table-column>
                <el-table-column align="center" fixed="right" label="操作"
                                 v-if="station_station_edit || station_station_del || station_station_stop">
                    <template slot-scope="scope">
                        <el-button v-if="station_station_edit" icon="icon-edit" title="编辑" type="text"
                                   @click="handleEdit(scope.row)"/>
                        <el-button v-if="station_station_del" icon="icon-delete" title="删除" type="text"
                                   @click="handleDelete(scope.row)"/>
                        <el-button
                                :icon="scope.row.status == 1 ? 'icon-lock' : 'icon-unlock'"
                                :title="scope.row.status == 1 ? '停用' : '启用'"
                                v-if="station_station_stop" type="text"
                                @click="handleStop(scope.row)"/>
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
                    <el-form-item label="名称" prop="name"
                                  :rules="[{required: true,message: '请输入名称'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'},]">
                        <el-input v-model="form.name"></el-input>

                    </el-form-item>
                    <el-form-item label="编号" prop="code"
                                  :rules="[{required: true,message: '请输入编号'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'},]">
                        <el-input v-model="form.code"></el-input>

                    </el-form-item>
                    <el-form-item label="站长" prop="staUser"
                                  :rules="[{required: true,message: '请选择站长'},{min: 0,max: 64,message: '长度在 0 到 64 个字符'},]">
                        <el-select v-model="form.staUser" placeholder="请选择">
                            <el-option
                                    v-for="item in users"
                                    :key="item.code"
                                    :label="item.name"
                                    :value="item.code">
                            </el-option>
                        </el-select>
                    </el-form-item>

                    <el-form-item label="备注" prop="remark" :rules="[{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                        <el-input type="textarea" v-model="form.remark"></el-input>

                    </el-form-item>
                    <!--<el-form-item label="经度" prop="lng" :rules="[{required: true,message: '请输入经度'},{min: 0,max: 32,message: '长度在 0 到 32 个字符'},]">
                            <el-input v-model="form.lng"></el-input>

                    </el-form-item>
                    <el-form-item label="纬度" prop="lat" :rules="[{required: true,message: '请输入纬度'},{ validator:validateNumber},]">
                            <el-input v-model="form.lat"></el-input>

                    </el-form-item>-->
                    <!--<el-form-item label="备注" prop="description" :rules="[{min: 0,max: 128,message: '长度在 0 到 128 个字符'},]">
                      <el-input type="textarea" v-model="form.description"></el-input>

                    </el-form-item>-->
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
    import stationService from "./station-service";
    import validate from "@/util/validate";
    import util from "@/util/util";
    import CrudSelect from "@/components/avue/crud-select";
    import CrudCheckbox from "@/components/avue/crud-checkbox";
    import CrudRadio from "@/components/avue/crud-radio";

    export default {
        name: "table_station_station",
        components: {CrudSelect, CrudCheckbox, CrudRadio},
        data() {
            return {
                searchFilterVisible: true,
                dialogFormVisible: false,
                list: null,
                total: null,
                listLoading: true,
                searchStationForm: {},
                listQuery: {
                    page: 1,
                    size: 20
                },
                form: {
                    description: undefined,
                    name: undefined,
                    code: undefined,
                    remark: undefined,
                    lng: undefined,
                    lat: undefined,
                    staUser: undefined,
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
                statusOptions: [{value: "", label: '全部状态'}, {value: 1, label: '启用'}, {value: 0, label: '停用'}],
                users: [],
                userMap: undefined,
                dialogStatus: 'create',
                textMap: {
                    update: '编辑场站',
                    create: '创建场站'
                },
                tableKey: 0
            };
        },
        computed: {
            ...mapGetters(["permissions", "dicts"])
        },
        filters: {},
        created() {
            this.getUsers()
            this.getList();
            this.station_station_edit = this.permissions["station_station_edit"];
            this.station_station_del = this.permissions["station_station_del"];
            this.station_station_stop = this.permissions["station_station_stop"];
            this.delFlagOptions = this.dicts["sys_flag"];
        },
        methods: {
            getUsers() {
                stationService.getAllUser().then(res => {
                    this.users = res.data
                    this.userMap = new Map(this.users.map(i => [i.code, i]))
                })
            },
            getLabelByVal(val) {
                let obj = this.userMap.get(val)
                if (obj) {
                    return obj.name
                }
            },
            getList() {
                this.listLoading = true;
                this.listQuery.queryConditionJson = util.parseJsonItemForm([
                    {fieldName: 'name', value: this.searchStationForm.name, operate: 'like', attrType: 'String'},
                    {
                        fieldName: 'status',
                        value: this.searchStationForm.status,
                        operate: 'eq',
                        attrType: 'Integer'
                    },
                    {
                        fieldName: 'createdDate',
                        value: this.searchStationForm.createdDate,
                        operate: 'between',
                        attrType: 'java.util.Date'
                    },
                ])
                stationService.page(this.listQuery).then(response => {
                    this.list = response.data.records;
                    this.total = response.data.total;
                    this.listLoading = false;
                });
            },
            tableRowClassName({row, rowIndex}) {
                // 把每一行的索引放进row
                row.rowIndex = rowIndex
            },
            formatter(row, column, cellValue, index) {
                //放回索引值
                return this.listQuery.size * (this.listQuery.page - 1) + 1 + row.rowIndex;
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
                this.$refs['searchStationForm'].resetFields();
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
                    stationService.find(row.id).then(response => {
                        this.form = response.data;
                        this.form.delFlag = validate.toString(this.form.delFlag);
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
                        stationService.save(this.form).then((data) => {
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
                    "此操作将永久删除该场站, 是否继续?",
                    "提示",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }
                ).then(() => {
                    stationService.remove(row.id).then((data) => {
                        this.getList();
                    });
                });
            },
            handleStop(row) {
                let msg = '停用'
                if (row.status == 0) {
                    msg = '启用'
                }
                this.$confirm(
                    "此操作将" + msg + "该场站, 是否继续?",
                    "提示",
                    {
                        confirmButtonText: "确定",
                        cancelButtonText: "取消",
                        type: "warning"
                    }
                ).then(() => {
                    if (row.status == 0) {
                        row.status = 1
                    } else {
                        row.status = 0
                    }
                    stationService.updateStatus(row).then((data) => {
                        this.getList()
                    })
                })
            },
            resetForm() {
                this.form = {
                    description: "",
                    name: "",
                    code: "",
                    remark: "",
                    lng: "",
                    lat: "",
                };
                this.$refs['form'] && this.$refs['form'].resetFields();
            }
        }
    };
</script>
