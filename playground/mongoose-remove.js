const { MongoClient, ObjectID } = require('mongodb');

const { mongoose, getConnectedDb } = require('../server/db/moongose');
const { Todo } = require('../server/models/todo');
const { User } = require('../server/models/user');


getConnectedDb()
	.then(() => {
		return Todo.remove({});
	})
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.log(err);
		mongoose.disconnect();
	});

getConnectedDb()
	.then(() => {
		return Todo.findOneAndRemove({ _id: '123' });
	})
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.log(err);
		mongoose.disconnect();
	});

getConnectedDb()
	.then(() => {
		return Todo.findByIdAndRemove(new ObjectID('123'));
	})
	.then((result) => {
		console.log(result);
	})
	.catch((err) => {
		console.log(err);
		mongoose.disconnect();
	});