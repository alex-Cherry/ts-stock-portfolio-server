import mongoose from 'mongoose';

const EconomicSectorSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }
});

export interface IEconomicSectorSchema extends mongoose.Document {
  name: string
}

export default mongoose.model<IEconomicSectorSchema>('EconomicSector', EconomicSectorSchema);
