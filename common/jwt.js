const jwt                       = require('jsonwebtoken');

class Token {
	constructor() {
	}
	
	/**
	 * 对token进行解码
	 * @param token
	 * @returns false || { payload }
	 */
	static decode(token) {
		let result = '';
		jwt.verify(token, this.secret, (err, payload) => {
			if (err) {
				// 解析失败，认定为伪造
				result = false;
			} else {
				result = payload;
			}
		});
		return result;
	}
	
	static encode(payload) {
		if (!payload) {
			return false;
		}
		
		let token = jwt.sign(payload, this.secret);
		if (token) {
			return token;
		}
		return false;
	}
}

// salt
Token.secret = 'sdfs3pskadoij3kj2h2k3n4jk3j4hjjkjbspp1ns092xxjiwnwjaa1qw2icmfvjuejv9ej';

module.exports = Token;
