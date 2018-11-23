const expect = require('expect');
const request = require('supertest');

const { Todo } = require('../models/todo');
const { app } = require('../server');
const { mongoose, getConnectedDb } = require('../db/moongose');

const text = 'Test todo text';
beforeEach((done) => {
	console.time('Before each');
	getConnectedDb()
		.then(() => {
			console.timeLog('Before each', 'Before remove');
			Todo.remove({ text: 'Test todo text' }).then(() => {
				mongoose.disconnect();
				done();
				console.timeEnd('Before each');
			});
		})
		.catch((err) => {
			done(err);
		});
});

describe('POST /todos', () => {
	console.log(this);
	it('should create a new todo', (done) => {
		console.time('In test');
		request(app)
			.post('/todos')
			.send({ text })
			.expect(200)
			.expect((res) => {
				console.timeLog('In test', 'After result was recivied');
				expect(res.body.text)
					.toBe(text);
			})
			.end((err, res) => {

				console.timeLog('In test', 'In the end');
				if (err) {
					return done(err);
				}

				getConnectedDb()
					.then(() => {
						return Todo
							.find({ text: text })
					})
					.then((todos) => {
						console.timeLog('In test', 'After find');
						expect(todos).toBeTruthy();
						expect(todos.length).toBe(1);
						expect(todos[0].text).toBe(text);
						done();
						console.timeEnd('In test');
					})
					.catch((err) => done(err));
			});
	});

	it('should not create todo with invalid body data', (done) => {
		request(app)
			.post('/todos')
			.send({})
			.expect(400)
			.end(() => done());
	});
});