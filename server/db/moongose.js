const mongoose = require('mongoose');

let connectionString = 'mongodb://localhost:27017/TodoApp';
mongoose.Promise = global.Promise;

function getConnectedDb() {
	return mongoose.connect(connectionString);
};

module.exports = {
	mongoose,
	getConnectedDb
};