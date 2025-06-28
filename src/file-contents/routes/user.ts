export const userRouterContent = `
    import express from 'express';
    import userController from '../controllers/user';
    import authorizationMiddleware from '../middleware/authorization';

    const router = express.Router();
    router.get(
        '/me',
        authorizationMiddleware.userAuthorization,
        userController.getMe,
    );

    router.post('/login', userController.loginUser);

    router.post(
        '/logout',
        authorizationMiddleware.userAuthorization,
        userController.logout,
    );

    router.post(
        '/',
        authorizationMiddleware.userAuthorization,
        userController.insertUser,
    );

    router.post('/forgot_password', userController.forgotPassword);

    router.patch(
        '/validate_two_factor_authentication',
        authorizationMiddleware.twoFactorAuthorization,
        userController.validateTwoFactorAuthentication,
    );

    router.patch(
        '/forgot_password_verify/:token',
        userController.forgotPasswordVerify,
    );

    router.patch(
        '/change_password',
        authorizationMiddleware.userAuthorization,
        userController.changePassword,
    );

    export default router;

`;
