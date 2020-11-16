import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import config from 'config';
import { body, validationResult } from 'express-validator';
// model
import UserModel from '../models/User';

const router = Router();

/*
  route - /api/auth/register
*/
router.post(
  '/register',
  [
    // describe validators for express-validator
    body('email', `Поле 'Email' некорректно`).isEmail(),
    body('username', `Поле 'Username' не заполнено`).notEmpty(),
    body('password', `Поле 'Password' долно содержать не менее 6 символов`).isLength({ min: 6 })
    // ** END - describe validators for express-validator
  ],
  async (request: Request, response: Response) => {
    try {
      // validate fields in a request with the provided options
      const errorMessage = checkRequest(request);
      if (errorMessage) {
        return response.status(400).json({ message: errorMessage });
      }

      // get data from a body of a request
      const { email = '', password = '', username = '' } = request.body;

      // try to find a user via email
      let user = await UserModel.findOne({ email });
      // if the user exists, return an error
      if (user) {
        return response.status(400).json({ message: 'Пользователь с таким Email уже зарегистрирован' });  
      }

      // try to find a user via username
      user = await UserModel.findOne({ username });
      // if the user exists, return an error
      if (user) {
        return response.status(400).json({ message: 'Пользователь с таким ником уже зарегистрирован' });  
      }

      // hash a password
      const hashedPassword = await bcrypt.hash(password, 10);
      // create an user from a model
      const newUser = new UserModel({
        email,
        username,
        password: hashedPassword,
        isAdmin: false
      });
      // save the new user in mongo
      await newUser.save();

      // return a successful result
      response.status(201).json({ message: 'Пользователь зарегистрирован' });
    } catch {
      response.status(500).json({ message: 'Server Internal Error' });
    }
  }
);

/*
  route - /api/auth/login
*/
router.post(
  '/login',
  [
    // describe validators for express-validator
    body('email', `Поле 'Email' некорректно`).isEmail(),
    body('password', `Поле 'Password' долно содержать не менее 6 символов`).isLength({ min: 6 })
    // ** END - describe validators for express-validator
  ],
  async (request: Request, response: Response) => {
    try {

      // validate fields in a request with the provided options
      const errorMessage = checkRequest(request);
      if (errorMessage) {
        return response.status(400).json({ message: errorMessage });
      }

      // get data from a body of a request
      const { email = '', password = '' } = request.body;

      // try to find a user in DB via email
      let user = await UserModel.findOne({ email });
      // if the user doesn't exist, return an error
      if (!user) {
        return response.status(400).json({ message: 'Ошибка при входе в систему' });
      }

      // if the user exists,
      // then compare his password with entered one
      const isMatched = await bcrypt.compare(password, user.password);
      // if pwasswords don't match, return an error
      if (!isMatched) {
        return response.status(400).json({ message: 'Ошибка при входе в систему' });
      }

      // create a token
      const token = jwt.sign({ data: `${user.id}-${user.email}` }, config.get('secretKey'), { expiresIn: '2h' });
      // form data for http-response
      const { id, username, isAdmin } = user;
      const data = { token, user: { id, username, isAdmin } };

      // return a successful result
      return response.status(200).json(data);  
    } catch {
      response.status(500).json({ message: 'Server Internal Error' });
    }
  }
);

/**
 * Validate fields in a request with validators provided in routes.
 * If fields are OK, returns an empty string.
 * If fields aren't OK, returns a string with messages splitted with a semicolon.
 * It's used the function from express-validator lib
 * 
 * @param { Request } request - request, which fields are being checked in
*/
const checkRequest = (request: Request): string => {
  
  let result = '';

  // get errors from a request
  const errors = validationResult(request);
  // if there are errors, add an error message to result
  if (!errors.isEmpty()) {
    result = errors.array().reduce((acc, curr) => {
      acc += `${curr.msg};`;
      return acc
    }, '');
  }

  return result;
}


export {
  router
};
