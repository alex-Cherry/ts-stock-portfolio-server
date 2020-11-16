import { Router, Request, Response } from 'express';
import { Error, Types } from 'mongoose';
// model
import StockModel, { IStockPopulated } from '../models/Stock';
import EconomicSectorModel from '../models/EconomicSector';

const router = Router();

/*
  route - /api/stocks/sectors
*/
router.get('/sectors', async (request: Request, response: Response) => {
  try {
    // get raw data from mongo
    const sectorsFromDB = await EconomicSectorModel.find();
    // convert to a required format
    const sectors = sectorsFromDB.map(item => ({ id: item._id, name: item.name }));
    // return a result
    response.status(200).json({ sectors });
  } catch {
    response.status(500).json({ message: 'Server Internal Error' });
  }
});

/*
  route - /api/stocks/stocks
*/
router.get('/stocks', async (request: Request, response: Response) => {
  try {
    const bluetip = request.query.bluetip || false;
    // contains raw data from mongo
    let rawData: IStockPopulated[];
    if (bluetip) {
      rawData = await StockModel.fetchPreBluetipStocks();
    } else {
      rawData = await StockModel.fetchPreStocks();
    }
    // convert to a required format
    const stocks = rawData.map(item => ({
      id: item._id,
      ticker: item.ticker,
      shortName: item.shortName,
      price: item.price,
      sector: { id: item.sector._id, name: item.sector.name },
      bluetip: item.bluetip
    }));
    // return a result
    response.status(200).json({ stocks });
  } catch {
    response.status(500).json({ message: 'Server Internal Error' });
  }
})

/*
  route - /api/stocks/stocks/?id
*/
router.get('/stocks/:id', async (request: Request, response: Response) => {
  try {
    // get the "ID" parameter from a request
    const id = request.params.id;
    Types.ObjectId.isValid(id)
    // get data from mongo
    const stockFromDB = await StockModel.getStockById(id);
    // create a stock in a required format
    const stock = {
      id: stockFromDB._id,
      ticker: stockFromDB.ticker,
      shortName: stockFromDB.shortName,
      price: stockFromDB.price,
      sector: {
        id: stockFromDB.sector._id,
        name: stockFromDB.sector.name
      },
      bluetip: stockFromDB.bluetip
    };
    // return the stock as a http-response
    response.status(200).json({ stock });
  } catch (err) {
    if (err instanceof Error.CastError) {
      response.status(404).json({ message: `The stock isn't found` });
    } else {
      response.status(500).json({ message: 'Server Internal Error' });
    }
  }
})


/*
  route - /api/stocks/savestock
*/
router.post('/savestock', async (request: Request, response: Response) => {
  try {
    // get stock from the request
    const { stock } = request.body;
    // 
    const stockExpression = {
      ticker: stock.ticker,
      shortName: stock.shortName,
      price: stock.price,
      bluetip: stock.bluetip,
      sector: stock.sector.id
    };

    // id that we return in a response
    let id = stock.id;
    // the status of a response
    let status = 200;
    // if there is "id",
    //  update the stock
    if (stock.id) {
      await StockModel.findOneAndUpdate({ _id: stock.id }, stockExpression);
    } else {
      // otherwise create a new stock
      const newStock = new StockModel(stockExpression);
      // set id of a new stock
      id = await newStock.save();
      // status = created
      status = 201;
    }
    response.status(status).json(id);
  } catch {
    response.status(500).json({ message: 'Server Internal Error' });
  }
});


export {
  router
};
