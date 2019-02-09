const wxLogin              = require('../handler/wxLogin.js');
const Register              = require('../handler/register.js');
const userInfo              = require('../handler/userInfo.js');

const routeMap = {
	'wx_login': wxLogin,
	'wx_register': Register,
	'wx_userinfo': userInfo,
}


const route = async (ctx, next) => {
	let method = ctx.request.query.method || ctx.request.body.method;
	
	if (routeMap[method] && typeof routeMap[method] === 'function') {
		return await (new routeMap[method]()).handler(ctx, next);
	}
}

module.exports = route;
