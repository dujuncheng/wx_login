const UserModel = require('../model/UserModel.js');
// const CatalogModel = require('../model/catalogModel.js');
// const errCode = require("../config/errCode");
// const _         = require('underscore');


class BaseClass {
    constructor() {
        this.appid = 'wx7d3c8e9e4b19f98d';
        this.appsecret ='620cf69ea60ae9e54fd1cbcfcf29f254';
        this.ctx = '';
        this.param = {};
        this.UserModel = UserModel.instance();
        // this.CatalogModel = CatalogModel.instance();
    }
    async handler(ctx, next) {
        this.ctx = ctx;
        await this.run(ctx, next);
        ctx.set('Access-Control-Allow-Origin','*');
        ctx.set('Access-Control-Allow-Methods','get,post');
        ctx.set('Access-Control-Allow-Headers','content-type')
    }
    getRequestParam(paramName) {
        let method = this.ctx.request.method.toLowerCase();
        let result = '';

        if (method === 'get') {
            result = this.ctx.request.query[paramName];
        } else if (method === 'post') {
            result = this.ctx.request.body[paramName];
        }

        return result;
    }
    /**
     * 校验传过来的参数是否都有
     * @param arr
     * @returns {boolean}
     */
    checkParams (arr) {
        let result = true;

        for (let i = 0; i < arr.length; i++) {
            let param = arr[i];
            let value = this.getRequestParam(param);
            if ((value) === undefined) {
                result = false;
            } else {
                this.param[param] = value;
            }
        }

        if (result === false) {
            this.responseFail('参数缺失', 0);
        }
        return result;
    }
    /**
     * 设置失败的时候返回值
     * @param message
     * @param errCode
     */
    responseFail (message, errCode) {
        this.ctx.body = {
            success: false,
            err_code: errCode || 0,
            message: message || '操作失败'
        }
    }
	/**
	 * 检查是否该用户已经存在
	 * @param openid
	 * @returns {boolean}
	 */
	async checkHasUser ({openid}) {
    	let result = false;
        let userArr = await this.UserModel.getUserArr({openid});
        if (userArr.length === 1) {
	        result = true;
        } else {
        	result = false;
        }
        return result;
    }
}


module.exports = BaseClass;
