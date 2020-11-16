import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  isAdmin: { type: Boolean }
});

interface IUserSchema extends mongoose.Document {
  email: string,
  username: string,
  password: string,
  isAdmin: boolean
}

export default mongoose.model<IUserSchema>('User', UserSchema);
