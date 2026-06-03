import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/ieslacocha')
  .then(async () => {
    const db = mongoose.connection.db;
    const stats = await db.collection('carreras').aggregate([
      { $group: { _id: "$tipo", count: { $sum: 1 } } }
    ]).toArray();
    console.log("CARRERAS STUFF:", stats);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
