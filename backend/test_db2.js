import mongoose from 'mongoose';

mongoose.connect('mongodb://127.0.0.1:27017/ieslacocha')
  .then(async () => {
    const db = mongoose.connection.db;
    const carreras = await db.collection('carreras').find({}).toArray();
    console.log("isArray?", Array.isArray(carreras[0].habilidades));
    console.log("type:", typeof carreras[0].habilidades);
    console.log("val:", carreras[0].habilidades);
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
