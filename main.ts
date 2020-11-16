import express from 'express';
import config from 'config';
import mongoose from 'mongoose';
// middleware
import { corsMiddleare } from './middleware/cors.middleware';
// routes
import { router as authRouter } from './routes/auth.routes';
import { router as stockRouter } from './routes/stock.routes';

const app = express();
const PORT = config.get('port') || 5000;

app.use(express.json());
app.use(corsMiddleare);
// register routes
app.use('/api/auth', authRouter);
app.use('/api/stocks', stockRouter);


const start = async () => {
  try {
    await mongoose.connect(config.get('mongo'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false
    });
    app.listen(PORT, () => {
      console.log(`App has been started on port ${PORT}`);
    });

  } catch (err) {
    console.log('Server error', err.message);
    process.exit(1);
  }
}

start();



// mongodb+srv://sa:<password>@cluster0-0fln7.azure.mongodb.net/<dbname>?retryWrites=true&w=majority