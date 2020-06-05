import request from '@/router/axios';
import validate from "@/util/validate";
const stationService = {
	page(query) {
	  return request({
		url: '/station/station/',
		method: 'get',
		params: query
	  })
	},

	save(obj) {
	  return request({
		url: '/station/station/',
		method: 'post',
		data: obj
	  })
	},

  updateStatus(obj) {
    return request({
      url: '/station/station/updateStatus',
      method: 'post',
      data: obj
    })
  },

	find(id) {
	  return request({
		url: '/station/station/' + id,
		method: 'get'
	  })
	},

	remove(id) {
	  return request({
		url: '/station/station/' + id,
		method: 'delete'
	  })
	},

  getAllUser() {
    return request({
      url: '/sys/user/getAll',
      method: 'get'
    })
  },

	validateUnique(rule, value, callback, id) {
	  validate.isUnique(rule, value, callback, '/station/station/checkByProperty?id='+validate.toStr(id))
	}
}
export default stationService
