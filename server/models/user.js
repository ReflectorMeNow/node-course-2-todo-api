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
		let token = jwt.sign({ _id: user._id.toHexString(), access }, 'abc123').toString();

		user.tokens.push({ access, token });
		return user.save().then((data) => {
			return { user: data, token };
		});
	},
	toJSON() {
		let user = this;
		let userObject = user.toObject();

		return _.pick(userObject, ['_id', 'email']);
	}
};

UserSchema.statics = {
	findByToken(token) {
		let User = this;
		let decoded;

		try {
			decoded = jwt.verify(token, 'abc123');
		}
		catch (e) {
			return Promise.reject({ statusCode: 401, message: 'Users token is not valid' });
		}

		return User.findOne({
			_id: decoded._id,
			'tokens.token': token,
			'tokens.access': 'auth'
		});
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