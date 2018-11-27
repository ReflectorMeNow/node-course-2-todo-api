const expect = require('expect');
const request = require('supertest');
const { ObjectID } = require('mongodb');

const { Todo } = require('../models/todo');
const { User } = require('../models/user');
const { app } = require('../server');
const { mongoose, getConnectedDb } = require('../db/moongose');
const { todos, populateTodos, users, populateUsers } = require('./seed/seed');

const text = 'Test todo text';

beforeEach(populateUsers);
beforeEach(populateTodos);


describe('POST /todos', () => {
	console.log(this);
	it('should create a new todo', (done) => {
		request(app)
			.post('/todos')
			.set('x-auth', users[0].tokens[0].token)
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
			.set('x-auth', users[0].tokens[0].token)
			.send({})
			.expect(400)
			.end(() => done());
	});
});

describe('GET /todos', () => {
	it('should get all todos', (done) => {
		request(app)
			.get('/todos')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todos.length).toBe(1);
			})
			.end(done);
	});
});

describe('GET /todos/:id', () => {
	it('should get by id', (done) => {
		request(app)
			.get(`/todos/${todos[0]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.todo.text).toBe(todos[0].text);
			})
			.end(done);
	});

	it('should return 404 if ID is not valid', (done) => {
		request(app)
			.get(`/todos/123`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should return 404 if ID is valid, but not exists in the db', (done) => {
		request(app)
			.get(`/todos/${new ObjectID().toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should not return a todo doc created by other user', (done) => {
		request(app)
			.get(`/todos/${todos[1]._id.toHexString()}`)
			.set('x-auth', users[0].tokens[0].token)
			.expect(404)
			.end(done);
	});
});

describe('DELETE /todos:id', () => {
	it('should remove a todo', (done) => {
		let hexId = todos[1]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
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
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should return 404 if object is invalid', (done) => {
		request(app)
			.delete(`/todos/123`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
			.expect((res) => {
				expect(res.body.message).toBe('Todo not found');
			})
			.end(done);
	});

	it('should not remove a todo created by another user', (done) => {
		let hexId = todos[0]._id.toHexString();
		request(app)
			.delete(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.expect(404)
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
						expect(todo).toBeTruthy();
						done();
					})
					.catch((err) => {
						done(err);
					})
			});
	});
});

describe('PATCH /todos/:id', () => {
	it('should update the todo', (done) => {
		let hexId = todos[0]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[0].tokens[0].token)
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
			.set('x-auth', users[1].tokens[0].token)
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

	it('should not update a todo created by another user', (done) => {
		let hexId = todos[0]._id.toHexString();
		request(app)
			.patch(`/todos/${hexId}`)
			.set('x-auth', users[1].tokens[0].token)
			.send({
				text: "The are a new text",
				completed: true
			})
			.expect(404)
			.end(done);
	});
});

describe('GET /users/me', () => {

	it('should return a user if authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', users[0].tokens[0].token)
			.expect(200)
			.expect((res) => {
				expect(res.body.id).toBe(users[0]._id.toHexString());
				expect(res.body.email).toBe(users[0].email);
			})
			.end(done);
	});

	it('should return 401 if not authenticated', (done) => {
		request(app)
			.get('/users/me')
			.set('x-auth', '123321')
			.expect(401)
			.expect((res) => {
				expect(res.body.message).toBe('Users token is not valid');
			})
			.end(done);
	});
});

describe('POST /users', () => {
	it('should create a user', (done) => {
		let email = 'example@exampl.com';
		let password = '123mnb!';

		request(app)
			.post('/users')
			.send({ email, password })
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
				expect(res.body.id).toBeTruthy();
				expect(res.body.email).toBe(email);
			})
			.end((err) => {
				if (err) {
					return done(err);
				}

				getConnectedDb()
					.then(() => {
						return User.findOne({ email });
					})
					.then((user) => {
						expect(user).toBeTruthy();
						expect(user.password).not.toBe(password);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
	});

	it('should return validation errors if request invalid', (done) => {
		let email = '';
		let password = '1';

		request(app)
			.post('/users')
			.send({ email, password })
			.expect(400)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
				expect(res.body.message).toBeTruthy();
			})
			.end(done);
	});

	it('should not create user if email in use', (done) => {
		let email = users[0].email;
		let password = '123abc!';
		request(app)
			.post('/users')
			.send({ email, password })
			.expect(400)
			.expect((res) => {
				console.log(res.body.message);
				expect(res.headers['x-auth']).toBeFalsy();
				expect(res.body.name).toBe('MongoError');

			})
			.end(done);
	});
});

describe('POST /users/login', () => {
	it('should login user and return a token', (done) => {
		const { email, password } = users[1];
		request(app)
			.post('/users/login')
			.send({ email, password })
			.expect(200)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeTruthy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				getConnectedDb()
					.then(() => {
						User
							.findById(users[1]._id)
							.then((user) => {
								expect(user.tokens[user.tokens.length - 1]).toHaveProperty('access', 'auth');
								expect(user.tokens[user.tokens.length - 1]).toHaveProperty('token', res.headers['x-auth']);
								done();
							})
							.catch((err) => {
								done(err);
							})
					})
					.catch((err) => {
						done(err);
					})
			});
	});

	it('should reject invalid login', (done) => {
		request(app)
			.post('/users/login')
			.send({ email: users[1].email, password: '321' })
			.expect(401)
			.expect((res) => {
				expect(res.headers['x-auth']).toBeFalsy();
			})
			.end((err, res) => {
				if (err) {
					return done(err);
				}

				getConnectedDb()
					.then(() => {
						User
							.findById(users[1]._id)
							.then((user) => {
								expect(user.tokens.length).toBe(1);
								done();
							})
							.catch((err) => {
								done(err);
							})
					})
					.catch((err) => {
						done(err);
					})
			});
	});
});

describe('DELETE /users/me/token', () => {
	it('should remove auth token on logout', (done) => {
		let token = users[0].tokens[0].token;
		request(app)
			.delete('/users/me/token')
			.set('x-auth', token)
			.expect(200)
			.end((err, res) => {
				if (err) {
					done(err);
				}

				getConnectedDb()
					.then(() => {
						return User.findById(users[0]._id);
					})
					.then((user) => {
						expect(user.tokens.length).toBe(0);
						done();
					})
					.catch((err) => {
						done(err);
					});
			});
	});
});