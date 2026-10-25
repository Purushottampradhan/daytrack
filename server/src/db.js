import mongoose from 'mongoose';

function mongoUri() {
  let uri = String(process.env.MONGODB_URI || '').trim();
  if (uri.startsWith('MONGODB_URI=')) uri = uri.slice('MONGODB_URI='.length).trim();
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1).trim();
  }
  return uri;
}

export async function connectDb() {
  const uri = mongoUri();
  if (!uri) throw new Error('MONGODB_URI is missing. Set it on the Render API service.');
  if (!uri.startsWith('mongodb://') && !uri.startsWith('mongodb+srv://')) {
    throw new Error('MONGODB_URI must start with mongodb:// or mongodb+srv://');
  }
  // Same Atlas cluster as quiz97; separate DB name avoids clashing with quiz collections.
  const dbName = process.env.MONGODB_DB_NAME || 'daytrack';
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName });
  console.log(`MongoDB: ${dbName} database connected`);
}
