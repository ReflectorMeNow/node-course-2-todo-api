const { User } = require('../models/user');
const { mongoose, getConnectedDb } = require('../db/moongose');

const authenticate = (req, res, next) => {
	let token = req.header('x-auth');

	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				User
					.findByToken(token)
					.then((user) => {
						resolve(user);
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then((user) => {
			mongoose.disconnect();

			if (!user) {
				return Promise.reject({ statusCode: 401, message: 'Require authorization' })
			}

			req.user = user;
			req.token = token;
			next();
		})
		.catch((err) => {
			mongoose.disconnect();
			let message = err.message || err
			res
				.status(err.statusCode || 400)
				.send({ message: message });
		});
};


module.exports = {
	authenticate
}