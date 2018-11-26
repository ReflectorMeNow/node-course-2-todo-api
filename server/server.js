const express = require('express');
const bodyParser = require('body-parser');
const { ObjectID } = require('mongodb');

const { mongoose, getConnectedDb } = require('./db/moongose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

const port = process.env.PORT || 3000;

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

app.listen(port, () => {
	console.log(`Started on port ${port}...`);
});

module.exports = {
	app
};