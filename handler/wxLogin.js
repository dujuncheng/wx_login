const base64            = require('js-base64');
// const errCode           = require('../config/errCode.js');
const axios             = require('axios');

const BaseClass = require('./baseClass.js');


class wxLogin extends BaseClass{
    constructor() {
        super();
    }
    async run(ctx, next) {
        try {
        	debugger
            // 检查params
            let paramsOk = this.checkParams(['code']);
            if (!paramsOk) {
	            throw new Error('参数格式不正确')
                return next();
            }

            if (typeof this.param.code !== 'string') {
                throw new Error('参数格式不正确')
                return;
            }

            // 获取openid
            let {openid, session_key} = await this.getOpenid({
	            code: this.param.code
            })
	        
	        // err_code 1 该用户没有注册
	        let hasUser = await this.checkHasUser({openid})
	        if (!hasUser) {
	        	this.responseFail('该用户没有注册，去注册', 1)
	        }
	        // 存入redis缓存的 session3rd: {openid, session_key}
	        let session3rd = await this.setSession({session_key, openid});
	        
	        ctx.body = {
		        success: true,
		        data: {
			        session: session3rd,
		        },
		        message: '恭喜你，登录成功'
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


module.exports = wxLogin;

