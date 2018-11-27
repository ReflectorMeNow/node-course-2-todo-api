const { mongoose, getConnectedDb } = require('../../db/moongose');
const { ObjectID } = require('mongodb');
const { Todo } = require('../../models/todo');
const { User } = require('../../models/user');
const jwt = require('jsonwebtoken');

const userOneId = new ObjectID();
const userTwoId = new ObjectID();
const users = [
	{
		_id: userOneId,
		email: 'andrew@example.com',
		password: 'userOnePass',
		tokens: [
			{
				access: 'auth',
				token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
			}
		]
	},
	{
		_id: userTwoId,
		email: 'andrew_second@example.com',
		password: 'userTwoPass',
		tokens: [
			{
				access: 'auth',
				token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
			}
		]
	}
];

const todos = [
	{
		_id: new ObjectID(),
		text: 'First test todo',
		_creator: userOneId
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo',
		completed: true,
		completedAt: 333,
		_creator: userTwoId
	}
];

const populateTodos = (done) => {
	getConnectedDb()
		.then(() => {
			Todo
				.remove()
				.then(() => {
					return Todo.insertMany(todos);
				})
				.then(() => {
					mongoose.disconnect();
					done();
				});
		})
		.catch((err) => {
			done(err);
		});
};

const populateUsers = (done) => {
	getConnectedDb()
		.then(() => {
			User
				.remove({})
				.then(() => {
					let userOne = new User(users[0]).save();
					let userTwo = new User(users[1]).save();
					return Promise.all([userOne, userTwo]);
				})
				.then(() => {
					mongoose.disconnect();
					done();
				});
		})
		.catch((err) => {
			done(err);
		});
};

module.exports = {
	todos,
	populateTodos,
	users,
	populateUsers
};
