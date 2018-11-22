//const MongoClient = require('mongodb').MongoClient;
const { MongoClient, ObjectID } = require('mongodb');

// let obj = new ObjectID();
// console.log(obj);


MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable connect to database server.');
	}
	console.log('Connect to MongoDB server');
	const db = client.db('TodoApp');

	db
		.collection('Todos')
		//.find()
		//.find({ completed: false })
		.find({ _id: new ObjectID('5bf66021ec42c5c90c435621') })
		.toArray()
		.then((doc) => {
			console.log('Todos:');
			console.log(JSON.stringify(doc, undefined, 2));
		})
		.catch((err) => {
			console.log('Unable to featch todos ', err);
		});

	db
		.collection('Todos')
		.find()
		.count()
		.then((count) => {
			console.log('Todos count: ', count);
		})
		.catch((err) => {
			console.log('Unable to featch todos ', err);
		});

	db
		.collection('Users')
		.find({name: 'Vovka'})
		.toArray()
		.then((user)=>{
			console.log('Finded user: ', JSON.stringify(user, undefined, 2));
		})
		.catch((err) => {
			console.log('Unable to featch users ', err);
		});

	db
		.collection('Users')
		.find()
		.count()
		.then((count)=>{
			console.log('Total count of users: ', count);
		})
		.catch((err) => {
			console.log('Unable to featch count of users ', err);
		});

	client.close();
});