const mongoose = require('mongoose');

let connectionString = process.env.MONGODB_URI;
mongoose.Promise = global.Promise;

function getConnectedDb() {
	let options = {
		server: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } },
		replset: { socketOptions: { keepAlive: 1, connectTimeoutMS: 30000 } }
	};
	return mongoose.connect(connectionString, { useNewUrlParser: true, poolSize: 4 });
};

module.exports = {
	mongoose,
	getConnectedDb
};