const mongoose = require('mongoose');

let connectionString = 'mongodb://localhost:27017/TodoApp';
mongoose.Promise = global.Promise;

function getConnectedDb() {
	let options = {
		server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
		replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
	};
	return mongoose.connect(connectionString);
};

module.exports = {
	mongoose,
	getConnectedDb
};