const SqlString                         = require('sqlstring');
const _                                 = require('underscore');
const xss                               = require('xss');


const mysql = require('../common/mysql.js');
const dbConf = require('../config/db.js');


const filteremoji = (originText) => {
	if (_.isUndefined(originText) || typeof originText !== 'string') {
		return originText;
	}
	let ranges = [
		'\ud83c[\udf00-\udfff]',
		'\ud83d[\udc00-\ude4f]',
		'\ud83d[\ude80-\udeff]',
	];
	let newText = originText.replace(new RegExp(ranges.join('|'), 'g'), '');
	return newText;
};

class UserModel {
	constructor() {}
	
	static instance() {
		const clazz = 'UserModel';
		if (!UserModel.instances[clazz]) {
			UserModel.instances[clazz] = new this();
		}
		return UserModel.instances[clazz];
		
	}
	
	filter(str) {
		if (_.isUndefined(str)) {
			return false;
		}
		let result = str;
		
		result = filteremoji(result);
		result = SqlString.format(result);
		result = xss(result);
		
		return result;
	}
	
	/**
	 * 增加一个新用户记录
	 * @param openid
	 * @param avater
	 * @param nickname
	 * @param address
	 * @param email
	 * @param password
	 * @returns {Promise<void>}
	 */
	async addNewUser({
	     openid,
	     avater = '',
	     nickname = '',
	     address = '',
	     email,
	     password
	}) {
		if (
			_.isUndefined(openid) ||
			_.isUndefined(email) ||
			_.isUndefined(password)
		
		) {
			throw new Error('写入数据库参数缺失');
			return
		}
		let fieldStr = dbConf.UserTableField.join(',');
		
		let valueArr = [];
		valueArr.push(0);
		valueArr.push(openid);
		valueArr.push(avater || '');
		valueArr.push(nickname || '');
		valueArr.push(address || '');
		valueArr.push(email);
		valueArr.push(password);
		valueArr.push(1);
		valueArr.push(Date.now() / 1000);
		valueArr.push(Date.now() / 1000);
		
		
		const sql = `INSERT INTO user (${fieldStr}) VALUES (?,?,?,?,?,?,?,?,?,?)`;
		let result = await mysql.bindSql(sql, valueArr, dbConf.dbName);
		return result;
	}
	
	/**
	 * 更新用户记录的状态
	 * @param id
	 * @param state
	 * @returns {Promise<*>}
	 */
	async updateUserState(openid, state) {
		if(_.isUndefined(openid) || _.isUndefined(state)) {
			return false;
		}
		let sql = `UPDATE user
                SET
                state = '${state}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE openid = '${openid}' AND state = 1`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 过滤 xss
	 * @param str
	 * @returns {*}
	 */
	filter(str) {
		if (_.isUndefined(str)) {
			return false;
		}
		let result = str;
		
		result = filteremoji(result);
		result = SqlString.format(result);
		result = SqlString.escape(result);
		result = xss(result);
		
		return result;
	}
	
	/**
	 * 查找user表中的用户
	 * @param openid
	 * @returns {Promise<T>}
	 */
	async getUserArr({openid = 0, email = 0}) {
		let sql = `SELECT * FROM user WHERE
        ( openid = '${openid}' OR email = '${email}' )
        AND
        state = 1
        ORDER BY id DESC
        `;
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 通过openid来查找user
	 * @param uid
	 * @returns {Promise<T>}
	 */
	async getUserByOpenid(openid) {
		if (_.isUndefined(openid)) {
			throw new Error('读取数据库参数缺失');
			return
		}
		let sql = `SELECT * FROM user WHERE openid = '${openid}' AND state = 1`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 更新用户信息
	 * @param avater
	 * @param nickname
	 * @param address
	 * @param openid
	 * @returns {Promise<*>}
	 */
	async updateInfo({avater, nickname, address, openid}) {
		if(_.isUndefined(avater) ||
			_.isUndefined(nickname) ||
			_.isUndefined(address) ||
			_.isUndefined(openid)
		) {
			return false;
		}
		let sql = `UPDATE user
                SET
                avater = '${avater}',
                nickname = '${nickname}',
                address = '${address}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE openid = '${openid}' AND state = 1`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
}

UserModel.instances = {};

module.exports = UserModel;
