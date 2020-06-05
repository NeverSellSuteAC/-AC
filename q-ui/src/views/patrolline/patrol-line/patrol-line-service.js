import request from '@/router/axios';
import validate from "@/util/validate";
const patrolLineService = {
	page(query) {
		return request({
			url: '/patrolline/patrol-line/',
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
	save(obj) {
		return request({
			url: '/patrolline/patrol-line/',
			method: 'post',
			data: obj
		})
	},

	find(id) {
		return request({
			url: '/patrolline/patrol-line/' + id,
			method: 'get'
		})
	},

	remove(id) {
		return request({
			url: '/patrolline/patrol-line/' + id,
			method: 'delete'
		})
	},

	validateUnique(rule, value, callback, id) {
		validate.isUnique(rule, value, callback, '/patrolline/patrol-line/checkByProperty?id=' + validate.toStr(id))
	}
}
export default patrolLineService