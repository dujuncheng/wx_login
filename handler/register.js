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
            	openid: '',
	            email: 'fafsdf'
            }
            let hasUser = await this.checkHasUser(params);
            if (hasUser) {
                throw new Error('数据库中已经存在该数据')
	            return
            }
            debugger
            let result = await this.UserModel.addNewUser({
	            openid: '12312',
	            email: this.param.email,
	            password: this.param.password,
            })
	        
	        console.log(result)
	        
	        if (result) {
		        ctx.body = {
			        success: true,
			        message: '恭喜你，注册成功'
		        }
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

