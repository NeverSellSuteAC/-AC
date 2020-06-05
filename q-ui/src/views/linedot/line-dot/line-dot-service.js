import request from '@/router/axios';
import validate from "@/util/validate";
const lineDotService = {
	page(query) {
	  return request({
		url: '/linedot/line-dot/',
		method: 'get',
		params: query
	  })
	},

	save(obj) {
	  return request({
		url: '/linedot/line-dot/',
		method: 'post',
		data: obj
	  })
	},

	find(id) {
	  return request({
		url: '/linedot/line-dot/' + id,
		method: 'get'
	  })
	},

	remove(id) {
	  return request({
		url: '/linedot/line-dot/' + id,
		method: 'delete'
	  })
	},

	validateUnique(rule, value, callback, id) {
	  validate.isUnique(rule, value, callback, '/linedot/line-dot/checkByProperty?id='+validate.toStr(id))
	}
}
export default lineDotService