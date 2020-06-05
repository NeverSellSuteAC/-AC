import request from '@/router/axios';
import validate from "@/util/validate";
const inspectionRecordService = {
	page(query) {
		return request({
			url: '/inspectionrecord/inspection-record/',
			method: 'get',
			params: query
		})
	},
	userPage(query) {
		return request({
			// url: '/sys/user/',
			url: '/inspector/inspector/getUserPage',
			method: 'get',
			params: query
		})
	},
	linePage(query) {
		return request({
			url: '/patrolline/patrol-line/',
			method: 'get',
			params: query
		})
	},
	save(obj) {
		return request({
			url: '/inspectionrecord/inspection-record/',
			method: 'post',
			data: obj
		})
	},
	
	find(id) {
		return request({
			url: '/inspectionrecord/inspection-record/' + id,
			method: 'get'
		})
	},
	getTaskCompletion(id) {
		return request({
			url: '/inspectionrecord/inspection-record/getTaskCompletion/' + id,
			method: 'get'
		})
	},

	remove(id) {
		return request({
			url: '/inspectionrecord/inspection-record/' + id,
			method: 'delete'
		})
	},

	validateUnique(rule, value, callback, id) {
		validate.isUnique(rule, value, callback, '/inspectionrecord/inspection-record/checkByProperty?id=' + validate.toStr(id))
	}
}
export default inspectionRecordService