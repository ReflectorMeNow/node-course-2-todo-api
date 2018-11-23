const mongoose = require('mongoose');

let User = mongoose.model('User', {
	email: {
		type: String,
		trim: true,
		minLength: 5,
		required: true
	}
});

module.exports = {
	User
};