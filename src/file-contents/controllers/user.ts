export const userControllerContent = `
import { NextFunction, Request, Response } from "express";
import AppDataSource from "../app-data-source";
import { User } from "../entities/user";
import bcrypt from "bcrypt";
import userService from "../services/user";
import joi from "joi";
import speakeasy from "speakeasy";
import jwtService from "../services/jwt";

import { Role } from "../entities/role";
import { userSchema } from "../schemas/user";
import { passwordPattern } from "../schemas/user";

const userRepository = AppDataSource.getRepository(User);

export default {
  loginUser: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const { email, password } = request.body;

      const user = await userRepository.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        return response.status(404).json({ message: "errorMessage" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      let hasReachedAttempts = false;

      if (!isMatch) {
        user.login_attempts += 1;
        if (user.login_attempts >= +process.env.LOGIN_ATTEMPTS!) {
          hasReachedAttempts = true;
        } else {
          await userRepository.save(user);

          return response.status(404).json({ message: "errorMessage" });
        }
      } else {
        user.login_attempts = 0;
      }

      let token;

      token = await userService.generateCorrectToken({
        id: user.id,
        isValid: true,
      });

      await userRepository.update(
        { id: user.id },
        { two_factor_authentication_token: token },
      );

      const data: any = { token, w: hasReachedAttempts };

      return response.status(200).json(data);
    } catch (error) {
      return next(error);
    }
  },

  validateTwoFactorAuthentication: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const userSchema = joi.object({
        token: joi.string().required(),
      });
      const user = await userSchema.validateAsync(request.body);

      if (process.env.USE_2FA! == "true" && user.token !== "ignore") {
        const verified = speakeasy.totp.verify({
          encoding: "base32",
          secret: response.locals.user.two_factor_authentication_secret,
          token: user.token,
        });

        if (!verified) {
          return response.status(404).json({ message: "errorMessage" });
        }
      }
      const id = response.locals.user.id;
      const token = await jwtService.sign({
        id,
        email: response.locals.user.email,
        isValid: response.locals.isValid ? true : false,
      });

      const targetUser = await userRepository.findOne({
        where: {
          id: id,
        },
      });

      if (response.locals.isValid) {
        await userRepository.update(
          { id },
          {
            two_factor_authentication_scanned: true,
            login_attempts: 0,
            user_token: token,
          },
        );
      } else if (targetUser?.invalid_created) {
        await userRepository.update(
          { id },
          {
            two_factor_authentication_scanned: true,
            login_attempts: 0,
            user_token: token,
          },
        );
      }
      return response.status(200).json({ token });
    } catch (error) {
      return next(error);
    }
  },

  getMe: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const localUser = response.locals.user;

      const user = {
        date_created: localUser.date_created,
        date_last_modified: localUser.date_last_modified,
        email: localUser.email,
        id: localUser.id,
        role: localUser.role,
        height: localUser.height,
      };
      return response.status(200).json(user);
    } catch (error) {
      return next(error);
    }
  },

  logout: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      let result;

      result = await userRepository.update(
        {
          id: response.locals.user.id,
        },
        { two_factor_authentication_token: null, user_token: null },
      );

      if (result.affected === 1) {
        return response.status(200).json({});
      } else {
        return response.status(400).json({});
      }
    } catch (error) {
      return next(error);
    }
  },

  insertUser: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const body = await userSchema.validateAsync(request.body);

      const existingUser = await userRepository.findOne({
        where: {
          email: body.email,
        },
      });

      if (existingUser) {
        return response.status(404).json({});
      }

      const salt = await bcrypt.genSalt(10);
      const email_token = await bcrypt.hash(body.email, salt);
      const password = await bcrypt.hash(body.password, salt);
      const secret = speakeasy.generateSecret();

      const role = await AppDataSource.getRepository(Role).findOne({
        where: {
          alternate_name: body.role,
        },
      });

      if (role) {
        const user = new User();
        user.email = body.email;
        user.email_token = email_token;
        user.password = password;
        user.role = role;
        user.height = body.height;
        user.two_factor_authentication_secret = secret.base32;

        let dummyUserEmail = body.email;

        const result = await userRepository.insert(user);
      }

      //TODO: send email if needed
      return response.status(200).json();
    } catch (error) {
      return next(error);
    }
  },

  forgotPassword: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const userSchema = joi.object({
        email: joi.string().email().required(),
      });
      const body = await userSchema.validateAsync(request.body);
      const forgot_password_token = await jwtService.sign({
        email: body.email,
      });
      const result = await userRepository.update(
        { email: body.email },
        { forgot_password_token },
      );
      if (result.affected === 1) {
        return response.status(200).json({});
      } else {
        return response.status(404).json({});
      }
    } catch (error) {
      return next(error);
    }
  },

  forgotPasswordVerify: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const data = await jwtService.verify(request.params.token);
      const userSchema = joi.object({
        password: joi.string().pattern(new RegExp(passwordPattern)).required(),
      });
      const body = await userSchema.validateAsync(request.body);
      const salt = await bcrypt.genSalt(10);
      const password = await bcrypt.hash(body.password, salt);
      const result = await userRepository.update(
        {
          email: data.email,
        },
        { forgot_password_token: null, password },
      );
      if (result.affected === 1) {
        return response.status(200).json({});
      } else {
        return response.status(404).json({});
      }
    } catch (error) {
      return next(error);
    }
  },

  changePassword: async function (
    request: Request,
    response: Response,
    next: NextFunction,
  ): Promise<any> {
    try {
      const userSchema = joi.object({
        password: joi.string().pattern(new RegExp(passwordPattern)).required(),
      });
      const user = await userSchema.validateAsync(request.body);
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(user.password, salt);
      const result = await userRepository.update(
        {
          id: response.locals.user.id,
        },
        user,
      );
      if (result.affected === 1) {
        return response.status(200).json({});
      } else {
        return response.status(400).json({});
      }
    } catch (error) {
      return next(error);
    }
  },
};

`;
