import request from '@/router/axios';
import validate from "@/util/validate";
const pipelineService = {
	page(query) {
	  return request({
		url: '/pipeline/pipeline/',
		method: 'get',
		params: query
	  })
	},

	save(obj) {
	  return request({
		url: '/pipeline/pipeline/',
		method: 'post',
		data: obj
	  })
	},

	find(id) {
	  return request({
		url: '/pipeline/pipeline/' + id,
		method: 'get'
	  })
	},

	remove(id) {
	  return request({
		url: '/pipeline/pipeline/' + id,
		method: 'delete'
	  })
	},

	validateUnique(rule, value, callback, id) {
	  validate.isUnique(rule, value, callback, '/pipeline/pipeline/checkByProperty?id='+validate.toStr(id))
	}
}
export default pipelineService