const base64            = require('js-base64');
// const errCode           = require('../config/errCode.js');
const axios             = require('axios');

const BaseClass = require('./baseClass.js');


class Register extends BaseClass{
    constructor() {
        super();
    }
    async run(ctx, next) {
        try {
            // 检查params
            let paramsOk = this.checkParams(['email', 'password', 'code']);
            if (!paramsOk) {
                return next();
            }

            if (typeof this.param.code !== 'string' ||
	            typeof this.param.email !== 'string' ||
	            typeof this.param.code !== 'string'
            ) {
                throw new Error('参数格式不正确')
                return;
            }

            let params = {
            	openid: this.param.openid,
            }
            let hasUser = this.checkHasUser(params);
            if (hasUser) {
                throw new Error('数据库中已经存在该数据')
	            return
            }
            
            this.addNewUser();
            
	        
            if (result.status !== 200 ||
                !result.data ||
                !result.data.openid ||
                !result.session_key) {
                throw new Error( result.data || '使用code向微信换openid失败')
            }



        } catch (e) {
            ctx.body = {
                success: false,
                message: e.message || '请求失败'
            }
            return next();
        }
    }
    askWx () {
        if (!this.appid || !this.appsecret || this.param.code) {
            return false;
        }
        let url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appid}&secret=${this.appsecret}&js_code=${this.param.code}`;
        return axios({
            method: 'get',
            url,
        })
    }
}


module.exports = Register;

