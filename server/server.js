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

});


app.listen(3000, () => {
	console.log('Started on port 3000...');
});