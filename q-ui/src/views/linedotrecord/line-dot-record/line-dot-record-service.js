import request from '@/router/axios';
import validate from "@/util/validate";
const lineDotRecordService = {
	page(query) {
		return request({
			url: '/linedotrecord/line-dot-record/',
			method: 'get',
			params: query
		})
	},
	getLineAllStr(query) {
		return request({
			url: '/patrolline/patrol-line/getLineAllStr',
			method: 'get',
			params: query
		})
	},
	getDotAllStr(query) {
		return request({
			url: '/patrolline/patrol-line/getDotAllStr',
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
	recordPage(query) {
		return request({
			url: '/inspectionrecord/inspection-record/',
			method: 'get',
			params: query
		})
	},
	dotPage(query) {
		return request({
			url: '/property/property-info/',
			method: 'get',
			params: query
		})
	},
	pipelinePage(query) {
		return request({
			url: '/pipeline/pipeline/',
			method: 'get',
			params: query
		})
	},
	save(obj) {
		return request({
			url: '/linedotrecord/line-dot-record/',
			method: 'post',
			data: obj
		})
	},

	find(id) {
		return request({
			url: '/linedotrecord/line-dot-record/' + id,
			method: 'get'
		})
	},

	remove(id) {
		return request({
			url: '/linedotrecord/line-dot-record/' + id,
			method: 'delete'
		})
	},

	validateUnique(rule, value, callback, id) {
		validate.isUnique(rule, value, callback, '/linedotrecord/line-dot-record/checkByProperty?id=' + validate.toStr(id))
	}
}
export default lineDotRecordService