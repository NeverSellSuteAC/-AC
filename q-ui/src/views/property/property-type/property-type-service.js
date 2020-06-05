import request from '@/router/axios';
import validate from "@/util/validate";
const propertyTypeService = {
	page(query) {
	  return request({
		url: '/property/property-type/',
		method: 'get',
		params: query
	  })
	},

	save(obj) {
	  return request({
		url: '/property/property-type/',
		method: 'post',
		data: obj
	  })
	},

	find(id) {
	  return request({
		url: '/property/property-type/' + id,
		method: 'get'
	  })
	},

	remove(id) {
	  return request({
		url: '/property/property-type/' + id,
		method: 'delete'
	  })
	},

	validateUnique(rule, value, callback, id) {
	  validate.isUnique(rule, value, callback, '/property/property-type/checkByProperty?id='+validate.toStr(id))
	},

  getAll() {
    return request({
      url: '/property/property-type/getAll/-1',
      method: 'get'
    })
  },
}
export default propertyTypeService
