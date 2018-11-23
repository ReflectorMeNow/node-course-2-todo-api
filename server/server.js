const express = require('express');
const bodyParser = require('body-parser');

const { mongoose, getConnectedDb } = require('./db/moongose');
const { Todo } = require('./models/todo');
const { User } = require('./models/user');

let app = express();
app.use(bodyParser.json());

app.post('/todos', (req, res) => {
	let todo = new Todo({
		text: req.body.text
	});

	getConnectedDb()
		.then(() => {
			return new Promise((resolve, reject) => {
				//console.time('Save a todo');
				todo
					.save()
					.then((result) => {
						resolve(result);
						//console.timeLog('Save a todo', 'After save');
					})
					.catch((err) => {
						reject(err);
						//console.timeLog('Save a todo', 'After save');
					});

			});
		})
		.then((result) => {
			mongoose.disconnect();
			//console.timeLog('Save a todo','After dicconnect');
			res
				.status(200)
				.send(result);
			//console.timeEnd('Save a todo');
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


app.listen(3000, () => {
	console.log('Started on port 3000...');
});

module.exports = {
	app
};