import { Request, Response, NextFunction } from 'express';

const corsMiddleare = (
  request: Request, response: Response, next: NextFunction
) => {

  response.header('Access-Control-Allow-Origin', 'http://localhost:3000');
  response.header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');
  response.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, authorization-token, authorization-userid");

  next();
}

export {
  corsMiddleare
};
