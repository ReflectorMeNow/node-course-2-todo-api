require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');
const _ = require('lodash');

const { mongoose, getConnectedDb } = require('./db/moongose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');
const { authenticate } = require('./middleware/authenticate');

const port = process.env.PORT;

let app = express();
app.use(bodyParser.json());


app.post('/todos', (req, res) => {
	let todo = new Todo({
		text: req.body.text
	});

	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				todo
					.save()
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});

			});
		})
		.then((result) => {
			mongoose.disconnect();
			res
				.status(200)
				.send(result);
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(400)
				.send(err);
		});
});

app.get('/todos', (req, res) => {
	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				Todo
					.find()
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then((result) => {
			mongoose.disconnect();
			let todos = result.map((item) => ({
				text: item.text,
				completedAt: item.completedAt,
				completed: item.completed,
				id: item._id
			}));
			res
				.status(200)
				.send({ todos });
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(400)
				.send(err);
		});
});

app.get('/todos/:id', (req, res) => {
	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				if (!ObjectID.isValid(req.params.id)) {
					reject({
						statusCode: 404,
						message: 'Todo not found'
					})
				}
				Todo
					.findById(req.params.id)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then((todo) => {
			mongoose.disconnect();
			if (todo) {
				let result = {
					id: todo._id,
					text: todo.text,
					completed: todo.completed,
					completedAt: todo.completedAt
				};

				res
					.status(200)
					.send({ todo: result });
			} else {
				res
					.status(404)
					.send({ message: 'Todo not found' });
			}
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(err.statusCode || 400)
				.send({ message: err.message } || err);
		});
});

app.delete('/todos/:id', (req, res) => {
	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				if (!ObjectID.isValid(req.params.id)) {
					reject({
						statusCode: 404,
						message: 'Todo not found'
					})
				}
				Todo
					.findByIdAndRemove(req.params.id)
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then((todo) => {
			mongoose.disconnect();
			if (todo) {
				let result = {
					id: todo._id,
					text: todo.text,
					completed: todo.completed,
					completedAt: todo.completedAt
				};

				res
					.status(200)
					.send({ todo: result });
			} else {
				res
					.status(404)
					.send({ message: 'Todo not found' });
			}
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(err.statusCode || 400)
				.send({ message: err.message } || err);
		});
});

app.patch('/todos/:id', (req, res) => {
	let id = req.params.id;
	let body = _.pick(req.body, ['text', 'completed']);

	if (!ObjectID.isValid(id)) {
		return res
			.status(404)
			.send({
				statusCode: 404,
				message: 'Todo not found'
			});
	}

	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				if (_.isBoolean(body.completed) && body.completed) {
					body.completedAt = new Date().getTime();
				} else {
					body.completed = false;
					body.completedAt = null;
				}

				Todo
					.findByIdAndUpdate(id,
						{
							$set: body
						},
						{
							new: true
						})
					.then((result) => {
						resolve(result);
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then((todo) => {
			mongoose.disconnect();
			if (todo) {
				let result = {
					id: todo._id,
					text: todo.text,
					completed: todo.completed,
					completedAt: todo.completedAt
				};

				res
					.status(200)
					.send({ todo: result });
			} else {
				res
					.status(404)
					.send({ message: 'Todo not found' });
			}
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(err.statusCode || 400)
				.send({ message: err.message } || err);
		});
});


app.post('/users', (req, res) => {
	let body = _.pick(req.body, ['email', 'password']);
	let user = new User({
		email: body.email,
		password: body.password
	});

	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				user
					.save()
					.then((result) => {
						user.generateAuthToken().then((data) => {
							resolve({ user: data.user, token: data.token });
						});
					})
					.catch((err) => {
						reject(err);
					});

			});
		})
		.then((result) => {
			mongoose.disconnect();
			res
				.status(200)
				.header('x-auth', result.token)
				.send({ id: result.user._id, email: result.user.email });
		})
		.catch((err) => {
			mongoose.disconnect();
			res
				.status(400)
				.send(err);
		});
});

app.get('/users/me', authenticate, (req, res) => {
	res.send({ id: req.user._id, email: req.user.email });
});

app.post('/users/login', (req, responce) => {
	let body = _.pick(req.body, ['email', 'password']);
	getConnectedDb()
		.then(() => {
			return User
				.findByCredentials(body.email, body.password)
				.then((user) => {
					return new Promise((resolve, reject) => {
						user.generateAuthToken()
							.then((data) => {
								resolve({
									id: user._id,
									email: user.email,
									token: data.token
								});
							})
							.catch((err) => {
								reject(err);
							})
					});
				});
		})
		.then((user) => {
			mongoose.disconnect();
			responce
				.status(200)
				.header('x-auth', user.token)
				.send({ id: user.id, email: user.email })

		})
		.catch((err) => {
			mongoose.disconnect();
			let message = err.message || err;
			responce
				.status(err.statusCode || 400)
				.send({ message: message });
		})
});

app.delete('/users/me/token', authenticate, (req, res) => {
	let { token, user } = req;
	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				user
					.removeToken(token)
					.then(() => {
						resolve();
					})
					.catch((err) => {
						reject(err);
					});
			});
		})
		.then(() => {
			res
				.status(200)
				.send({ message: 'A token was deleted' });
		})
		.catch((err) => {
			res
				.status(400)
				.send({ message: err })
		})

});

app.listen(port, () => {
	console.log(`Started on port ${port}...`);
});

module.exports = {
	app
};