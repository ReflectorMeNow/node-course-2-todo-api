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

	db.collection('Todos').insertOne({
		text: 'Data to insert',
		completed: false
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert todo: ', err);
		}

		console.log(JSON.stringify(result.ops, undefined, 2));
	});

	db.collection('Users').insertOne({
		name: 'Nikita',
		age: 28,
		location: 'Minsk'
	}, (err, result) => {
		if (err) {
			return console.log('Unable to insert todo: ', err);
		}

		console.log(JSON.stringify(result.ops[0]._id.getTimestamp(), undefined, 2));
	});

	client.close();
});