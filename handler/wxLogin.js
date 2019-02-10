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
	        // type 1 请求参数 {type, code}
	        // type 2 请求参数 {type, code, info}
            // 检查params
            let paramsOk = this.checkParams(['code', 'type']);
            if (!paramsOk) {
	            throw new Error('参数格式不正确')
                return next();
            }

            if (typeof this.param.code !== 'string') {
                throw new Error('参数格式不正确')
                return;
            }
            
            // 如果type是2, 则一定要有info字段
	        let info = '';
            debugger
            if (Number(this.param.type) === 2) {
            	debugger
	            info = JSON.parse(this.getRequestParam("info"));
	            if (!info) {
		            throw new Error('请求参数缺失');
		            return;
	            }
            }
            

            // 获取openid
            let {openid, session_key} = await this.getOpenid({
	            code: this.param.code
            })
	        
	        if (!openid) {
		        throw new Error('获取openid失败')
		        return
	        }
	        
	        // err_code 1 该用户没有注册
	        let hasUser = await this.checkHasUser({openid})
	        if (!hasUser) {
	        	this.responseFail('该用户没有注册，去注册', 1);
	        	return next()
	        }
	        
	        // 用户已经注册，如果是type2 则需要更新用户的信息资料
	        if (Number(this.param.type) === 2) {
	        	debugger
	        	let result = await this.UserModel.updateInfo({
			        avater: info.avater,
			        nickname: info.nickname,
			        address: info.address,
			        openid,
		        })
		        if (!result) {
		        	throw new Error('更新用户信息失败');
		        	return;
		        }
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

