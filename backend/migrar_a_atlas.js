import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// URI Local fija
const LOCAL_URI = 'mongodb://127.0.0.1:27017/ieslacocha';

// Si pasas la URI de Atlas por argumento: node migrar_a_atlas.js "mongodb+srv://..."
// o si la defines en la variable ATLAS_URI o MONGODB_URI
const ATLAS_URI = process.argv[2] || process.env.ATLAS_URI;

async function migrar() {
  if (!ATLAS_URI || (!ATLAS_URI.startsWith('mongodb+srv://') && !ATLAS_URI.startsWith('mongodb://'))) {
    console.error('\n❌ ERROR: Debes proporcionar tu cadena de conexión de MongoDB Atlas.');
    console.log('\n👉 Uso correcto:');
    console.log('node migrar_a_atlas.js "mongodb+srv://..." o "mongodb://..."\n');
    process.exit(1);
  }

  console.log('🔄 Iniciando migración de datos a MongoDB Atlas...\n');

  let localConn = null;
  let atlasConn = null;

  try {
    // 1. Conectar a Local
    console.log('1️⃣ Conectando a MongoDB Local (127.0.0.1:27017)...');
    localConn = await mongoose.createConnection(LOCAL_URI).asPromise();
    console.log('   ✅ Conectado a MongoDB Local');

    // 2. Conectar a Atlas
    console.log('\n2️⃣ Conectando a MongoDB Atlas en la nube...');
    atlasConn = await mongoose.createConnection(ATLAS_URI).asPromise();
    console.log('   ✅ Conectado a MongoDB Atlas');

    // 3. Obtener colecciones locales
    const localCollections = await localConn.db.listCollections().toArray();
    const systemCollections = ['system.indexes', 'system.views'];
    const coleccionesAMigrar = localCollections
      .map(c => c.name)
      .filter(name => !systemCollections.includes(name));

    console.log(`\n📦 Se encontraron ${coleccionesAMigrar.length} colecciones para migrar:`, coleccionesAMigrar);

    for (const nombreCol of coleccionesAMigrar) {
      console.log(`\n➡️ Migrando colección: "${nombreCol}"...`);

      // Obtener datos locales
      const docs = await localConn.db.collection(nombreCol).find({}).toArray();

      if (docs.length === 0) {
        console.log(`   ℹ️ Colección vacía, omitiendo inserción.`);
        continue;
      }

      // Limpiar colección en Atlas antes de insertar (para evitar duplicados si se corre varias veces)
      const atlasCol = atlasConn.db.collection(nombreCol);
      await atlasCol.deleteMany({});

      // Insertar en Atlas
      const resultado = await atlasCol.insertMany(docs);
      console.log(`   ✅ ${resultado.insertedCount} documentos migrados con éxito a Atlas.`);
    }

    console.log('\n🎉 ¡MIGRACIÓN COMPLETADA CON ÉXITO!');
    console.log('Todos tus datos locales (carreras, administradores, inscripciones, auditorías, etc.) ya están en MongoDB Atlas.\n');

  } catch (error) {
    console.error('\n❌ Error durante la migración:', error.message);
  } finally {
    if (localConn) await localConn.close();
    if (atlasConn) await atlasConn.close();
    process.exit(0);
  }
}

migrar();
