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
            let paramsOk = this.checkParams(['email', 'password', 'code', 'type']);
            if (!paramsOk) {
                return next();
            }
            
            // type 1 是不带头像昵称的注册，type 2是带头像昵称的注册
	        if (Number(this.param.type) === 2) {
	        	let avater = this.getRequestParam('avater');
	        	let nickname = this.getRequestParam('nickname');
	        	let address = this.getRequestParam('address');
	        	if (!avater || !nickname || !address) {
	        		throw new Error('参数缺失哦~');
	        	    return
		        }
	            this.param.avater = avater;
	            this.param.nickname = nickname;
	            this.param.address = address;
	        }

            if (typeof this.param.code !== 'string' ||
	            typeof this.param.email !== 'string' ||
	            typeof this.param.code !== 'string'
            ) {
                throw new Error('参数格式不正确')
                return;
            }
            
	        // 换取微信的openid, session_key
            let {openid, session_key} = await this.getOpenid({code: this.param.code})
	        if (!openid || !session_key) {
	        	throw new Error('获取微信openId失败')
		        return
	        }
	        // 检查该用户是否已经被注册过
            let params = {
            	openid,
	            email: this.param.email
            }
            let hasUser = await this.checkHasUser(params);
            if (hasUser) {
                throw new Error('数据库中已经存在该数据')
	            return
            }
            // 没有被注册，在用户表增加一条记录
            let result = await this.UserModel.addNewUser({
	            openid,
	            email: this.param.email,
	            password: this.param.password,
	            avater: this.param.avater || '0',
	            nickname: this.param.nickname || '0',
	            address: this.param.address || '0'
            })
	
	        // 存入redis缓存的 session3rd: {openid, session_key}
	        let session3rd = await this.setSession({session_key, openid});
         
            // 从数据库中获取该用户的信息
	        let userArr = await this.UserModel.getUserByOpenid(openid);
	        if (!userArr || !Array.isArray(userArr) || userArr.length !== 1) {
	        	throw new Error('数据库发生错误');
		        return;
	        }
	        let userInfo = userArr[0];

	        if (result) {
		        ctx.body = {
			        success: true,
			        data: {
			        	session: session3rd,
				        avater: userInfo.avater,
				        nickname: userInfo.address,
				        adderss: userInfo.address,
				        uid: userInfo.id,
			        },
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

