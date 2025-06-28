export const jwtServiceContent = `
import jwt from 'jsonwebtoken';
import fs from 'fs';
import { generateKeyPairSync, createPrivateKey } from 'crypto';

export default {
    verify: async function (token: string): Promise<any> {
        const publicKey = fs.readFileSync('public.pem', 'utf8');
        return await jwt.verify(token, publicKey, {
            algorithms: ['RS256'],
        });
    },

    sign: async function (payload: any): Promise<string> {
        const encryptedPrivateKey = fs.readFileSync('private.pem', 'utf8');
        const privateKey = createPrivateKey({
            key: encryptedPrivateKey,
            passphrase: process.env.JWT_ENCRYPTION,
        });
        return jwt.sign(payload, privateKey, {
            algorithm: 'RS256',
            expiresIn: '4h',
        });
    },

    checkKeys: async function () {
        const privateKeyPath = 'private.pem';
        const publicKeyPath = 'public.pem';

        const privateKeyExists = fs.existsSync(privateKeyPath);
        const publicKeyExists = fs.existsSync(publicKeyPath);

        if (!privateKeyExists || !publicKeyExists) {
            await this.createKeys();
        }
    },

    createKeys: async function () {
        const { publicKey, privateKey } = generateKeyPairSync('rsa', {
            modulusLength: 2048,
            publicKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
            },
            privateKeyEncoding: {
                type: 'pkcs1',
                format: 'pem',
                cipher: 'aes-256-cbc',
                passphrase: process.env.JWT_ENCRYPTION,
            },
        });

        fs.writeFileSync('private.pem', privateKey);
        fs.writeFileSync('public.pem', publicKey);
    },
};

`;
