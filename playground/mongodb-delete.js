const { MongoClient, ObjectID } = require('mongodb');



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable connect to database server.');
	}
	console.log('Connect to MongoDB server');
	const db = client.db('TodoApp');

	//delete many
	// db
	// 	.collection('Todos')
	// 	.deleteMany({
	// 		text: 'Eat lunch'
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		return console.log('Unable to delete todos: ', err);
	// 	});

	//delete one
	// db
	// 	.collection('Todos')
	// 	.deleteOne({
	// 		text: 'Eat lunch'
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		return console.log('Unable to delete todos: ', err);
	// 	});

	// findOneAndDelete
	// db
	// 	.collection('Todos')
	// 	.findOneAndDelete({
	// 		completed: false
	// 	})
	// 	.then((result) => {
	// 		console.log(result);
	// 	})
	// 	.catch((err) => {
	// 		return console.log('Unable to delete todos: ', err);
	// 	});

	db
		.collection('Users')
		.deleteMany({ name: 'Bug' })
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			return console.log('Unable to delete users: ', err);
		});

	db
		.collection('Users')
		.findOneAndDelete({
			_id: new ObjectID('5bf66d651203b7dea90336e2')
		})
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			return console.log('Unable to delete users: ', err);
		});

	client.close();
});