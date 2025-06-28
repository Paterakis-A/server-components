export const dataSourceContent = `
import { DataSource } from "typeorm";

const dataSourceOptions: any = {
  database: process.env.TYPEORM_DATABASE,
  entities: [process.env.TYPEORM_ENTITIES],
  host: process.env.TYPEORM_HOST,
  logging: false,
  password: process.env.TYPEORM_PASSWORD,
  port: +process.env.TYPEORM_PORT!,
  synchronize: true,
  type: "mysql",
  username: process.env.TYPEORM_USERNAME,
};

const AppDataSource = new DataSource(dataSourceOptions);

export default AppDataSource;
`;
