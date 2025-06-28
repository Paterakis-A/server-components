export const authorizationMiddlewareContent = `
import jwtService from '../services/jwt';

import userService from '../services/user';
import { NextFunction, Response } from 'express';

export default {
    userAuthorization: async (
        request: any,
        response: Response,
        next: NextFunction,
    ): Promise<any> => {
        try {
            let twoFactorAuthenticationToken: string;
            let userToken: string;
            if (request.originalUrl.includes('uploads')) {
                twoFactorAuthenticationToken = String(request.query.token2);
                userToken = String(request.query.token1);
            } else {
                twoFactorAuthenticationToken = request
                    .header('X-TFA')
                    .replace('Bearer ', '');
                userToken = request
                    .header('Authorization')
                    .replace('Bearer ', '');
            }
            if (twoFactorAuthenticationToken && userToken) {
                const data = await jwtService.verify(userToken);

                let user;

                user = await userService.getUserByBothTokens(
                    data.id,
                    twoFactorAuthenticationToken,
                    userToken,
                );
                
                if (!user) {
                    return response.status(401).json({
                        message: 'Not authorized to access this resource.',
                    });
                }
                response.locals.user = user;
                return next();
            } else {
                return response.status(403).json({ message: 'Invalid token.' });
            }
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return response.status(440).json({ message: 'Token expired' });
            }
            return response.status(403).json({ message: 'Invalid token.' });
        }
    },

    twoFactorAuthorization: async (
        request: any,
        response: Response,
        next: NextFunction,
    ): Promise<any> => {
        try {
            const twoFactorAuthenticationToken = request
                .header('X-TFA')
                .replace('Bearer ', '');

            if (twoFactorAuthenticationToken) {
                const data = await jwtService.verify(
                    twoFactorAuthenticationToken,
                );

                let user;

                user = await userService.getUserByTwoFactorAuthentication(
                    data.id,
                    twoFactorAuthenticationToken,
                );
               
                if (!user) {
                    return response.status(401).json({
                        message: 'Not authorized to access this resource.',
                    });
                }
                response.locals.user = user;
                return next();
            } else {
                return response.status(403).json({ message: 'Invalid token.' });
            }
        } catch (error: any) {
            if (error.name === 'TokenExpiredError') {
                return response.status(440).json({ message: 'Token expired' });
            }
            return response.status(403).json({ message: 'Invalid token.' });
        }
    },
};

`;
