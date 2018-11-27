const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');

let UserSchema = new mongoose.Schema({
	email: {
		type: String,
		trim: true,
		minlength: 5,
		required: true,
		unique: true,
		validate: {
			validator: validator.isEmail,
			message: '{VALUE} is not a valid email'
		}
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	tokens: [
		{
			access: {
				type: String,
				required: true
			},
			token: {
				type: String,
				required: true
			}
		}
	]
});


UserSchema.methods = {
	generateAuthToken() {
		let user = this;
		let access = 'auth';
		let token = jwt.sign({ _id: user._id.toHexString(), access }, process.env.JWT_SECRET).toString();

		user.tokens.push({ access, token });
		return user.save().then((data) => {
			return { user: data, token };
		});
	},
	toJSON() {
		let user = this;
		let userObject = user.toObject();

		return _.pick(userObject, ['_id', 'email']);
	},
	removeToken(token) {
		let user = this;
		return user.update({
			$pull: {
				tokens: { token }
			}
		});
	}
};

UserSchema.statics = {
	findByToken(token) {
		let User = this;
		let decoded;

		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET);
		}
		catch (e) {
			return Promise.reject({ statusCode: 401, message: 'Users token is not valid' });
		}

		return User.findOne({
			_id: decoded._id,
			'tokens.token': token,
			'tokens.access': 'auth'
		});
	},
	findByCredentials(email, password) {
		let User = this;
		if (!email) {
			return Promise.reject({ statusCode: 400, message: 'Email is required' });
		}
		if (!password) {
			return Promise.reject({ statusCode: 400, message: 'Password is required' });
		}

		return User
			.findOne({ email })
			.then((user) => {
				if (!user) {
					return Promise.reject({ statusCode: 401, message: 'Wrong email or password' });
				}

				return new Promise((resolve, reject) => {
					bcrypt.compare(password, user.password, (err, res) => {
						if (err) {
							return reject({ statusCode: 400, message: err });
						}
						if (!res) {
							return reject({ statusCode: 401, message: 'Wrong email or password' });
						}

						return resolve(user);
					});
				})

			})
	}
};

UserSchema.pre('save', function (next) {
	let user = this;
	let password = user.password;

	if (user.isModified('password')) {
		bcrypt.genSalt(10, (err, salt) => {
			bcrypt.hash(password, salt, (err, hash) => {
				user.password = hash;
				next();
			})
		});
	} else {
		next();
	}
});

let User = mongoose.model('User', UserSchema);

module.exports = {
	User
};