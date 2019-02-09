const Token             = require('../common/jwt.js');
// const errCode           = require('../config/errCode.js');
const axios             = require('axios');

const BaseClass = require('./baseClass.js');


class userInfo extends BaseClass{
	constructor() {
		super();
	}
	async run(ctx, next) {
		try {
			// 检查是否登录态是否有效
			let clientSession = ctx.headers['x-session'];
			if (!clientSession || typeof clientSession !== 'string') {
				throw new Error('错误')
				return
			}
			let payload = Token.decode(clientSession)
			
			
			// 如果失效，返回err_code 1
			
			
			// 如果没有注册，返回err_code 2
			
			
			// if (result) {
			// 	ctx.body = {
			// 		success: true,
			// 		data: {
			// 			session: session3rd,
			// 			avater: userInfo.avater,
			// 			nickname: userInfo.address,
			// 			adderss: userInfo.address,
			// 			uid: userInfo.id,
			// 		},
			// 		message: '恭喜你，注册成功'
			// 	}
			// }
			
			
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


module.exports = userInfo;

