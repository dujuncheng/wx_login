const wxLogin              = require('../handler/wxLogin.js');
const Register              = require('../handler/register.js');

const routeMap = {
	'wx_login': wxLogin,
	'wx_register': Register,
}


const route = async (ctx, next) => {
	let method = ctx.request.query.method || ctx.request.body.method;
	
	debugger
	if (routeMap[method] && typeof routeMap[method] === 'function') {
		return await (new routeMap[method]()).handler(ctx, next);
	}
}

module.exports = route;
