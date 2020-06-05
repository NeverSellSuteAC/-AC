<!--
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
      <template>
        <el-tabs @tab-click="switchTab">
          <el-tab-pane label="信息管理" name="userManager"/>
          <el-tab-pane label="密码管理" name="passwordManager"/>
        </el-tabs>
      </template>
      <el-row>
        <el-col :span="12">
          <div class="grid-content bg-purple">
            <el-form
              :model="ruleForm1"
              :rules="rules1"
              class="demo-ruleForm"
              label-width="100px"
              ref="ruleForm1"
              v-if="switchStatus==='userManager'"
            >
              <el-form-item label="用户名" prop="username">
                <el-input disabled type="text" v-model="ruleForm1.username"></el-input>
              </el-form-item>
              <el-form-item label="手机号" prop="phone">
                <el-input placeholder="验证码登录使用" v-model="ruleForm1.phone"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="submitForm_phone('ruleForm1')" type="primary">提交</el-button>
                <el-button @click="resetForm('ruleForm1')">重置</el-button>
              </el-form-item>
            </el-form>
            <el-form
              :model="ruleForm2"
              :rules="rules2"
              class="demo-ruleForm"
              label-width="100px"
              ref="ruleForm2"
              v-if="switchStatus==='passwordManager'"
            >
              <el-form-item label="原密码" prop="oldPassword">
                <el-input auto-complete="off" type="password" v-model="ruleForm2.oldPassword"></el-input>
              </el-form-item>
              <el-form-item label="密码" prop="newPassword">
                <el-input auto-complete="off" type="password" v-model="ruleForm2.newPassword"></el-input>
              </el-form-item>
              <el-form-item label="确认密码" prop="confirmPassword">
                <el-input auto-complete="off" type="password" v-model="ruleForm2.confirmPassword"></el-input>
              </el-form-item>
              <el-form-item>
                <el-button @click="submitForm('ruleForm2')" size="small" type="primary">提交</el-button>
                <el-button @click="resetForm('ruleForm2')" size="small">重置</el-button>
              </el-form-item>
            </el-form>
          </div>
        </el-col>
      </el-row>
    </basic-container>
  </div>
</template>


<script>
    import {mapState} from "vuex";
    import store from "@/store";
    import request from "@/router/axios";

    export default {
        data() {
            let validatePass = (rule, value, callback) => {
                if (this.ruleForm2.password !== "") {
                    if (value !== this.ruleForm2.newPassword) {
                        callback(new Error("两次输入密码不一致!"));
                    } else {
                        callback();
                    }
                } else {
                    callback();
                }
            };
            return {
                switchStatus: "",
                avatarUrl: "",
                show: false,
                headers: {
                    Authorization: "Bearer " + store.getters.access_token
                },
                ruleForm1: {
                    username: undefined,
                    phone: undefined
                },
                ruleForm2: {
                    oldPassword: undefined,
                    newPassword: undefined,
                    confirmPassword: undefined
                },
                rules1: {
                    phone: [
                        {
                            required: false,
                            min: 11,
                            message: "请输入11位手机号",
                            trigger: "change"
                        },
                        {
                            required: false,
                            max: 11,
                            message: "请输入11位手机号",
                            trigger: "change"
                        }
                    ]
                },
                rules2: {
                    oldPassword: [
                        {
                            required: true,
                            min: 4,
                            message: "原密码不能为空且不少于4位",
                            trigger: "change"
                        },
                        {
                            required: true,
                            max: 64,
                            message: "原密码不超过64位",
                            trigger: "change"
                        }
                    ],
                    newPassword: [
                        {
                            required: true,
                            min: 4,
                            message: "密码不少于4位",
                            trigger: "change"
                        },
                        {
                            required: true,
                            max: 64,
                            message: "密码不超过64位",
                            trigger: "change"
                        }
                    ],
                    confirmPassword: [
                        {required: true, validator: validatePass, trigger: "blur"}
                    ]
                }
            };
        },
        created() {
            this.ruleForm1.username = this.user.username;
            this.ruleForm1.phone = this.user.phone;
            // this.ruleForm2.oldPassword = "";
            // this.ruleForm2.newPassword = "";
            // this.ruleForm2.confirmPassword = "";
            this.switchStatus = "userManager";
        },
        computed: {
            ...mapState({
                user: state => state.user.user
            })
        },
        methods: {
            switchTab(tab, event) {
                this.switchStatus = tab.name;
            },
            submitForm(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        request({
                            url: "/account/change-password",
                            method: "post",
                            data: this.ruleForm2
                        })
                            .then(response => {
                                if (response.message == "修改成功") {
                                    this.$notify({
                                        title: "成功",
                                        message: "修改成功",
                                        type: "success",
                                        duration: 2000
                                    });
                                    // 修改密码之后强制重新登录
                                    if (this.switchStatus === "passwordManager") {
                                        this.$store.dispatch("logOut").then(() => {
                                            location.reload(); // 为了重新实例化vue-router对象 避免bug
                                        });
                                    }
                                } else {
                                    this.$notify({
                                        title: "失败",
                                        message: response.data.message,
                                        type: "error",
                                        duration: 2000
                                    });
                                }
                            })
                            .catch(() => {
                            });
                    } else {
                        return false;
                    }
                });
            },
            submitForm_phone(formName) {
                this.$refs[formName].validate(valid => {
                    if (valid) {
                        request({
                            url: "/sys/user/changePhone",
                            method: "post",
                            data: this.ruleForm1
                        })
                            .then(response => {
                                if (response.message == "操作成功") {
                                    this.$notify({
                                        title: "成功",
                                        message: "操作成功",
                                        type: "success",
                                        duration: 2000
                                    });
                                    // 修改密码之后强制重新登录
                                    // if (this.switchStatus === "passwordManager") {
                                    //   this.$store.dispatch("logOut").then(() => {
                                    //     location.reload(); // 为了重新实例化vue-router对象 避免bug
                                    //   });
                                    // }
                                } else {
                                    this.$notify({
                                        title: "失败",
                                        message: response.data.message,
                                        type: "error",
                                        duration: 2000
                                    });
                                }
                            })
                            .catch(() => {
                                this.$notify({
                                    title: "失败",
                                    message: "修改失败",
                                    type: "error",
                                    duration: 2000
                                });
                            });
                    } else {
                        return false;
                    }
                });
            },
            resetForm(formName) {
                if (formName == "ruleForm1") {
                    this.ruleForm1.username = this.user.username;
                    this.ruleForm1.phone = this.user.phone;
                }
                if (formName == "ruleForm2") {
                    this.ruleForm2.oldPassword = "";
                    this.ruleForm2.newPassword = "";
                    this.ruleForm2.confirmPassword = "";
                }
            }
        }
    };
</script>
<style>
  .avatar-uploader .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }

  .avatar-uploader .el-upload:hover {
    border-color: #409eff;
  }

  .avatar-uploader-icon {
    font-size: 28px !important;
    color: #8c939d !important;
    width: 178px !important;
    height: 178px !important;
    line-height: 178px !important;
    text-align: center !important;
  }

  .avatar {
    width: 178px;
    height: 178px;
    display: block;
  }
</style>
