const { MongoClient, ObjectID } = require('mongodb');



MongoClient.connect('mongodb://localhost:27017/TodoApp', (err, client) => {
	if (err) {
		return console.log('Unable connect to database server.');
	}
	console.log('Connect to MongoDB server');
	const db = client.db('TodoApp');

	db
		.collection('Todos')
		.findOneAndUpdate(
			{
				_id: new ObjectID('5bf66bdd1203b7dea903369d')
			},
			{
				$set: { completed: true }
			},
			{
				returnOriginal: false
			}
		)
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			return console.log('Unable to delete users: ', err);
		});

	db
		.collection('Users')
		.findOneAndUpdate(
			{
				_id: new ObjectID('5bf660bfdcf005af507c990c')
			},
			{
				$set: { name: 'Nikita' },
				$inc: { age: -1 }
			},
			{
				returnOriginal: false
			}
		)
		.then((result) => {
			console.log(result);
		})
		.catch((err) => {
			return console.log('Unable to delete users: ', err);
		});

	client.close();
});