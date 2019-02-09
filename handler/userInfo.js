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
			debugger
			// 检查是否登录态是否有效
			let clientSession = ctx.headers['x-session'];
			if (!clientSession || typeof clientSession !== 'string') {
				ctx.body = {
					success: false,
					err_code: 0,
					message: '没有登录态哦，请重新登录'
				}
				return next();
			}
			
			// 尝试解码
			// err_code 1 无法解析登录态
			let payload = ''
			try {
				payload = Token.decode(clientSession)
				if (!payload || !payload.sessionKey || !payload.openid) {
					throw new Error('登录态无法解析')
				}
			} catch (e) {
				this.responseFail('登录态无法解析', 1)
				return next();
			}
			
			// 从redis中捞取session
			// 如果过了有效期，返回err_code 2
			let sessionString = await this.redis.get(clientSession);
			let session = '';
			if (!sessionString || typeof sessionString !== 'string') {
				this.responseFail('登录态失效', 2);
				return next();
			}
			// 如果解析错误
			try {
				session = JSON.parse(sessionString)
			} catch (e) {
				this.responseFail(e.message || '登录态失效', 2);
				return next();
			}
			
			let openid = session.openid;
			
			// 从数据库中查找openid
			// 如果没有注册，返回err_code 3
			let userArr = await this.UserModel.getUserByOpenid(openid);
			if (!userArr || userArr.length === 0) {
				this.responseFail('该用户没有登录', 3)
				return next();
			}
			
			let user = userArr[0]
			let data = {
				id: user.id,
				avater: user.avater,
				nickname: user.nickname,
				address: user.address,
				email: user.email,
				openid: user.openid,
			}
			ctx.body = {
				success: true,
				data,
				message: ''
			}
		} catch (e) {
			ctx.body = {
				success: false,
				message: e.message || '请求失败'
			}
			return next();
		}
	}
}


module.exports = userInfo;

