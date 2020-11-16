import mongoose from 'mongoose';
// 
import { IEconomicSectorSchema } from './EconomicSector';

const StockSchema = new mongoose.Schema({
  ticker: { type: String, required: true, unique: true },
  shortName: { type: String, required: true },
  price: { type: Number, required: true },
  bluetip: { type: Boolean },
  sector: { type: mongoose.Schema.Types.ObjectId, ref: 'EconomicSector' }
});

interface IStockSchema extends mongoose.Document {
  ticker: string,
  shortName: string,
  price: number,
  bluetip: boolean,
};

interface IStock extends IStockSchema {
  sector: IEconomicSectorSchema["_id"];
};

export interface IStockPopulated extends IStockSchema {
  sector: IEconomicSectorSchema;
}

interface IStockModel extends mongoose.Model<IStock> {
  fetchPreStocks(): Promise<IStockPopulated[]>;
  fetchPreBluetipStocks(): Promise<IStockPopulated[]>;
  getStockById(id: string): Promise<IStockPopulated>;
}

StockSchema.statics.fetchPreStocks = async function() {
  return this.find().limit(16).populate('sector').exec();
}

StockSchema.statics.fetchPreBluetipStocks = async function() {
  return this.find({ bluetip: true }).limit(16).populate('sector').exec();
}

StockSchema.statics.getStockById = async function(id: string) {
  return this.findById(id).populate('sector').exec();
}

export default mongoose.model<IStock, IStockModel>('Stock', StockSchema);
