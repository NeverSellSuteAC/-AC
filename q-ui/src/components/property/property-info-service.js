import request from '@/router/axios';
import validate from "@/util/validate";
const propertyInfoService = {
	page(query) {
	  return request({
		url: '/property/property-info/',
		method: 'get',
		params: query
	  })
	},

	save(obj) {
	  return request({
		url: '/property/property-info/',
		method: 'post',
		data: obj
	  })
	},

	find(id) {
	  return request({
		url: '/property/property-info/' + id,
		method: 'get'
	  })
	},

	remove(id) {
	  return request({
		url: '/property/property-info/' + id,
		method: 'delete'
	  })
	},

  getPropertyTypeAll() {
    return request({
      url: '/property/property-type/getAll',
      method: 'get',
    })
  },

	validateUnique(rule, value, callback, id) {
	  validate.isUnique(rule, value, callback, '/property/property-info/checkByProperty?id='+validate.toStr(id))
	}
}
export default propertyInfoService
