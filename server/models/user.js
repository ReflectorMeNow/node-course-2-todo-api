const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');

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
	toJSON(){
		let user = this;
		let userObject = user.toObject();

		return _.pick(userObject, ['_id','email']);
	}
};

let User = mongoose.model('User', UserSchema);

module.exports = {
	User
};