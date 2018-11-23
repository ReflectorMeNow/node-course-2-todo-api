const { ObjectID } = require('mongodb');
const { mongoose, getConnectedDb } = require('../server/db/moongose');
const { Todo } = require('../server/models/todo');

let id = '5bf7ce5126e4fab604184eb7';

console.log('ID is valid:', ObjectID.isValid(id));

getConnectedDb()
	.then(() => {
		return Todo
			.find({
				_id: id
			})
	})
	.then((todos) => {
		console.log('Todos', todos);
		mongoose.disconnect();
	})
	.catch((err) => {
		console.log(err);
	});


getConnectedDb()
	.then(() => {
		return Todo
			.findOne({
				_id: id
			})
	})
	.then((todo) => {
		console.log('Todo by filter', todo);
		mongoose.disconnect();
	})
	.catch((err) => {
		console.log(err);
	});


getConnectedDb()
	.then(() => {
		return Todo
			.findById(id)
	})
	.then((todo) => {
		console.log('Todo by ID:', todo);
		mongoose.disconnect();
	})
	.catch((err) => {
		console.log(err);
	});