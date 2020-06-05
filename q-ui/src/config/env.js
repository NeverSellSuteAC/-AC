const env = process.env;
// let serverUrl = "http://localhost:8061"
let serverUrl = "http://192.168.0.51:8061"
let baseUrl = '/a';
// 图表库为avue和pig2套地址
let iconfontVersion = ['567566_qo5lxgtishg', '667895_vf6hgm08ubf', '734853_69upnso6mha'];
let iconfontUrl = `//at.alicdn.com/t/font_$key.css`;
let codeUrl = `${window.location.origin}/a/code`;
let actUrl = `${window.location.origin}/act/modeler.html?modelId=`;
if (env.NODE_ENV == 'development') {
  baseUrl = serverUrl + baseUrl;
  codeUrl = serverUrl + '/a/code';
  actUrl = serverUrl + "/act/modeler.html?modelId=";
} else if (env.NODE_ENV == 'production') {
  baseUrl = serverUrl + baseUrl;
  codeUrl = serverUrl + '/a/code';
  actUrl = serverUrl + "/act/modeler.html?modelId=";
} else if (env.NODE_ENV == 'online') {
  serverUrl = env.VUE_APP_URL;
  baseUrl = serverUrl + baseUrl;
  codeUrl = serverUrl + '/a/code';
  actUrl = serverUrl + "/act/modeler.html?modelId=";
}
export {
  baseUrl,
  actUrl,
  iconfontUrl,
  iconfontVersion,
  codeUrl,
  env
}
