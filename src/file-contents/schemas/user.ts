export const userSchemaContent = `
import joi from 'joi';

import { Roles } from '../enums/roles';

export const passwordPattern =
    '(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[!@#$%^&*()_+])[A-Za-z\\d!@#$%^&*()_+]{12,}';

export const userSchema = joi.object({
    email: joi.string().email().required(),
    password: joi.string().pattern(new RegExp(passwordPattern)).required(),
    role: joi
        .string()
        .valid(...Object.values(Roles))
        .required(),
    height: joi.number().required(),
});

`;
