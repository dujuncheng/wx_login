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
		debugger
		if (
			_.isUndefined(openid) ||
			_.isUndefined(email) ||
			_.isUndefined(password)
		
		) {
			throw new Error('写入数据库参数缺失');
			return
		}
		debugger
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
	 *
	 * @param note_id
	 * @param content
	 * @returns {Promise<*>}
	 */
	async updateNoteContent(noteIds, obj) {
		if(_.isUndefined(noteIds)) {
			return false;
		}
		let ids = `(${noteIds.join(',')})`
		
		let contentStr = ''
		let keyArr = Object.keys(obj)
		for (let i = 0; i < keyArr.length; i++) {
			let str = ` WHEN ${keyArr[i]} THEN '${obj[keyArr[i]].content}'`
			contentStr = contentStr + str
		}
		
		let titleStr = ''
		for (let i = 0; i < keyArr.length; i++) {
			let str = ` WHEN ${keyArr[i]} THEN '${obj[keyArr[i]].title}'`
			titleStr = titleStr + str
		}
		
		let sql =  `UPDATE note_table
            SET content = CASE note_id
                ${contentStr}
            END,
            title = CASE note_id
                ${titleStr}
            END,
            gmt_modify = '${new Date().getTime() / 1000}'
        WHERE note_id IN ${ids}`
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 更新note的状态
	 * @param note_id
	 * @param state
	 * @returns {Promise<*>}
	 */
	async updateNoteState(note_id, state) {
		if(_.isUndefined(note_id) || _.isUndefined(state)) {
			return false;
		}
		let sql = `UPDATE note_table
                SET
                state = '${state}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE note_id = '${note_id}'`;
		
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
		debugger
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 根据note_id 来查找数据
	 * @param birthTime
	 * @returns {Promise<T>}
	 */
	async getArrByNoteId(note_id) {
		if (_.isUndefined(note_id)) {
			throw new Error('读取数据库参数缺失');
			return
		}
		let sql = `SELECT * FROM note_table WHERE note_id = '${note_id}' AND state = 1`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 根据note_ids 来查找数据
	 * @param birthTime
	 * @returns {Promise<T>}
	 */
	async getArrByNoteIds(noteIds) {
		if (_.isUndefined(noteIds)) {
			throw new Error('读取数据库参数缺失');
			return
		}
		let str = `(${noteIds.join(',')})`
		let sql = `SELECT * FROM note_table WHERE note_id IN ${str} AND state = 1`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 修改复习数据
	 * @param note_id    笔记id
	 * @param nextNotifyTime  下次的复习时间
	 * @param reviewNum       已经复习的次数
	 * @returns {Promise<*>}
	 */
	async updateBlogReviewNotice({note_id, nextNotifyTime, reviewNum, needReview, frequency}) {
		if(_.isUndefined(note_id) || _.isUndefined(nextNotifyTime) || _.isUndefined(reviewNum)) {
			return false;
		}
		let sql = `UPDATE note_table
                SET
                notify_time = '${nextNotifyTime}',
                review_num = '${reviewNum}',
                need_review = '${needReview}',
                frequency = '${frequency}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE note_id = '${note_id}'`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	/**
	 * 设置笔记的复习因子，1，2，3，4，5 共5个等级
	 * @param note_id 笔记id
	 * @param frequency 复习因子
	 * @returns {Promise<*>}
	 */
	async updateBlogReviewFrequecy({note_id, frequency}) {
		if(_.isUndefined(note_id) || _.isUndefined(frequency)) {
			return false;
		}
		let sql = `UPDATE note_table
                SET
                frequency = '${frequency}',
                gmt_modify = '${new Date().getTime() / 1000}'
                WHERE note_id = '${note_id}'`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
	
	async getReviewList () {
		let sql = `SELECT * FROM note_table WHERE state = 1 AND need_review = 1 AND LENGTH(content) > 0 ORDER BY notify_time`;
		
		let res = await mysql.runSql(sql, dbConf.dbName)
			.catch((err) => {
				console.log(err);
			});
		return res;
	}
}

UserModel.instances = {};

module.exports = UserModel;
