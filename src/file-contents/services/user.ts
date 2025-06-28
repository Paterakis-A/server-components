export const userServiceContent = `
    import jwtService from './jwt';
    import AppDataSource from '../app-data-source';
    import { User } from '../entities/user';
    const repository = AppDataSource.getRepository(User);

    export default {
        initializeAdmin: async function (): Promise<void> {},

        generateCorrectToken: async function (userData: any): Promise<string> {
            const token = jwtService.sign(userData);
            return token;
        },

        getUserByTwoFactorAuthentication: async function (
            id: number,
            twoFactorAuthenticationToken: string,
        ): Promise<any> {
            return await repository.findOne({
                where: {
                    id,
                    two_factor_authentication_token: twoFactorAuthenticationToken,
                },
            });
        },

        getUserByBothTokens: async function (
            id: number,
            twoFactorAuthenticationToken: string,
            userToken: string,
        ): Promise<any> {
            return await repository.findOne({
                where: {
                    id,
                    two_factor_authentication_token: twoFactorAuthenticationToken,
                    user_token: userToken,
                },
            });
        },
    }
`;
