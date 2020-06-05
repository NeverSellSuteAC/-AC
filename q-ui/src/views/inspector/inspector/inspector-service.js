import request from '@/router/axios';
import validate from "@/util/validate";
const inspectorService = {
	page(query) {
		return request({
			url: '/inspector/inspector/',
			method: 'get',
			params: query
		})
	},
	stationPage(query) {
		return request({
			url: '/station/station/',
			method: 'get',
			params: query
		  })
	},
	userPage(query) {
		return request({
			url: '/sys/user/',
			method: 'get',
			params: query
		})
	},

	save(obj) {
		return request({
			url: '/inspector/inspector/',
			method: 'post',
			data: obj
		})
	},

	find(id) {
		return request({
			url: '/inspector/inspector/' + id,
			method: 'get'
		})
	},

	remove(id) {
		return request({
			url: '/inspector/inspector/' + id,
			method: 'delete'
		})
	},

	validateUnique(rule, value, callback, id) {
		validate.isUnique(rule, value, callback, '/inspector/inspector/checkByProperty?id=' + validate.toStr(id))
	}
}
export default inspectorService