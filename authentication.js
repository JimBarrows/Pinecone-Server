module.exports = function (req, res, next) {
	console.log('req.cookies: ', req.cookies)
	console.log('req headers: ', req.headers)
	console.log('req: ', req.isAuthenticated())
	if (req.isAuthenticated())
		return next();
	res.status(401).end();
};
