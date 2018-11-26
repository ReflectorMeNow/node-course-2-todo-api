const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { Todo } = require('../models/todo');
const { app } = require('../server');
const { mongoose, getConnectedDb } = require('../db/moongose');

const text = 'Test todo text';

const todos = [
	{
		_id: new ObjectID(),
		text: 'First test todo'
	},
	{
		_id: new ObjectID(),
		text: 'Second test todo',
		completed: true,
		completedAt: 333
	}
];

beforeEach((done) => {
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
});

describe('POST /todos', () => {
	console.log(this);
	it('should create a new todo', (done) => {
		request(app)
			.post('/todos')
			.send({ text })
			.expect(200)
			.expect((res) => {
				expect(res.body.text)
					.toBe(text);
			})
			.end((err, res) => {

				if (err) {
					return done(err);
				}

				getConnectedDb()
					.then(() => {
						return Todo
							.find({ text: text })
					})
					.then((todos) => {
						expect(todos).toBeTruthy();
						expect(todos.length).toBe(1);
						expect(todos[0].text).toBe(text);
						done();
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

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(2);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should get by id', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return 404 if ID is not valid', (done) => {
		request(app)
			.get(`/todos/123`)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should return 404 if ID is valid, but not exists in the db', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});
});

describe('DELETE /todos:id', () => {
	it('should remove a todo', (done) => {
		let hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.id).toBe(hexId);
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}
				getConnectedDb()
					.then(() => {
						return Todo
							.findById(hexId);
					})
					.then((todo) => {
						expect(todo).toBeFalsy();
						done();
					})
					.catch((err) => {
						done(err);
					})
			});
	});

	it('should return 404 if todo not found', (done) => {
		request(app)
			.delete(`/todos/${new ObjectID().toHexString()}`)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should return 404 if object is invalid', (done) => {
		request(app)
			.delete(`/todos/123`)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});
});


describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		let hexId = todos[0]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				text: "The are a new text",
				completed: true
			})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe("The are a new text");
				expect(res.body.todo.completed).toBe(true);
				expect(typeof res.body.todo.completedAt).toBe('number');
			})
			.end(done);
	});

	it('should clear completedAt when a todo is not completed', (done) => {
		let hexId = todos[1]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.send({
				text: "The are a new text",
				completed: false
			})
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe("The are a new text");
				expect(res.body.todo.completed).toBe(false);
				expect(res.body.todo.completed).toBeFalsy();
			})
			.end(done);
	});
});