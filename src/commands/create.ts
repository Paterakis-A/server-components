import { spawn } from "child_process";
import { dataSourceContent } from "../file-contents/data-source";
import { appContent } from "../file-contents/app";
import { routingServiceContent } from "../file-contents/services/routing";
import { loggerServiceContent } from "../file-contents/services/logger";
import { jwtServiceContent } from "../file-contents/services/jwt";
import { userServiceContent } from "../file-contents/services/user";
import { userControllerContent } from "../file-contents/controllers/user";
import { baseEntityContent } from "../file-contents/entities/base";
import { roleEntityContent } from "../file-contents/entities/role";
import { userEntityContent } from "../file-contents/entities/user";
import { authorizationMiddlewareContent } from "../file-contents/middleware/authorization";
import { userRouterContent } from "../file-contents/routes/user";
import { userSchemaContent } from "../file-contents/schemas/user";
import { rolesEnumContent } from "../file-contents/enums/roles";
import { envContent } from "../file-contents/env";
import { gitignoreContent } from "../file-contents/gitignore";
import { dockerIgnoreContent } from "../file-contents/docker/dickerignore";
import { dockerComposeContent } from "../file-contents/docker/docker-compose";
import { dockerFileContent } from "../file-contents/docker/dockerfileContent";
import { initSqlContent } from "../file-contents/initScripts/initSql";

const fs = require("fs");
const path = require("path");

const fileContentsPath = path.join(__dirname, "file-contents");

export const createApiServer = async (args: any) => {
  try {
    const appName: string = args.name || "app";
    if (!args.force && fs.existsSync(appName)) {
      console.log(
        `The folder ${appName} already exists. Use the --force flag to overwrite it.`,
      );
      process.exit(1);
    }
    fs.mkdirSync(appName, { recursive: args.force });

    fs.mkdirSync(path.join(appName, "src"), { recursive: args.force });
    fs.mkdirSync(path.join(appName, "init-scripts"), { recursive: args.force });

    fs.mkdirSync(path.join(appName, "src", "controllers"), {
      recursive: args.force,
    });
    fs.mkdirSync(path.join(appName, "src", "entities"), {
      recursive: args.force,
    });
    fs.mkdirSync(path.join(appName, "src", "enums"), { recursive: args.force });
    fs.mkdirSync(path.join(appName, "src", "middleware"), {
      recursive: args.force,
    });
    fs.mkdirSync(path.join(appName, "src", "routes"), {
      recursive: args.force,
    });
    fs.mkdirSync(path.join(appName, "src", "services"), {
      recursive: args.force,
    });
    fs.mkdirSync(path.join(appName, "src", "schemas"), {
      recursive: args.force,
    });

    fs.writeFileSync(path.join(appName, "src", "app.ts"), appContent);
    fs.writeFileSync(
      path.join(appName, "src", "app-data-source.ts"),
      dataSourceContent,
    );
    fs.writeFileSync(path.join(appName, ".env.development"), envContent);
    fs.writeFileSync(path.join(appName, ".gitignore"), gitignoreContent);

    //docker
    fs.writeFileSync(path.join(appName, ".dockerignore"), dockerIgnoreContent);
    fs.writeFileSync(
      path.join(appName, "docker-compose.yml"),
      dockerComposeContent,
    );
    fs.writeFileSync(path.join(appName, "Dockerfile"), dockerFileContent);

    await createPackage(appName, args);
    await createTsConfigs(appName);
    await createServices(path.join(appName, "src", "services"));
    await createControllers(path.join(appName, "src", "controllers"));
    await createEntities(path.join(appName, "src", "entities"));
    await createMiddleware(path.join(appName, "src", "middleware"));
    await createRoutes(path.join(appName, "src", "routes"));
    await createSchemas(path.join(appName, "src", "schemas"));
    await createEnums(path.join(appName, "src", "enums"));
    await createInitScripts(appName);
    await runNpmInstall(appName);

    console.log(`\nProject '${args.name}' created successfully at ${appName}`);
  } catch (error: any) {
    console.error(`\nError during project creation: ${error.message}`);
    process.exit(1);
  }
};

const createInitScripts = async (appName: string): Promise<void> => {
  fs.writeFileSync(
    path.join(appName, "init-scripts", "init.sql"),
    initSqlContent,
  );
};

const runNpmInstall = async (targetDirectory: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    console.log(`\nRunning 'npm install' in ${targetDirectory}...`);
    if (
      !fs.existsSync(targetDirectory) ||
      !fs.statSync(targetDirectory).isDirectory()
    ) {
      console.error(
        `[Debug] Error: cwd "${targetDirectory}" is not a valid directory before spawn!`,
      );
      return reject(
        new Error(`Target directory "${targetDirectory}" is invalid.`),
      );
    }
    // Determine npm command based on OS
    // (Needed for Windows compatibility where 'npm' might be 'npm.cmd')
    const command = process.platform === "win32" ? "npm.cmd" : "npm";
    const args = ["install --legacy-peer-deps"];

    const child = spawn(command, args, {
      // *** CRUCIAL OPTIONS ***
      cwd: targetDirectory, // Run the command in the target folder
      stdio: "inherit", // Pipe output/input/error directly to the console
      shell: true, // Recommended for security and cross-platform compatibility
    });
    // Handle potential errors (e.g., 'npm' command not found)
    child.on("error", (error) => {
      console.error(`Failed to start subprocess: ${error.message}`);
      reject(error);
    });

    // Handle process exit
    child.on("close", (code) => {
      if (code === 0) {
        console.log(
          `\n'npm install' completed successfully in ${targetDirectory}.`,
        );
        resolve(); // Success
      } else {
        const errorMsg = `'npm install' failed with exit code ${code}.`;
        console.error(`\n${errorMsg}`);
        reject(new Error(errorMsg));
      }
    });
  });
};

const createPackage = async (
  targetDirectory: string,
  args: any,
): Promise<void> => {
  const packageJsonPath = path.join(targetDirectory, "package.json");

  const packageJsonContent = {
    name: args.name, // Use the provided app name
    version: "1.0.0",
    description: `Generated API server: ${args.name}`,
    main: "index.js", // Or src/index.js, etc.
    scripts: {
      start: "node dist/app.js",
      "start:dev": "nodemon --config nodemon.json src/app.ts",
      "dev:debug": "nodemon --config nodemon.json --inspect src/app.ts",
      "build:dev": "tsc -p tsconfig.staging.json",
      "build:staging": "rm -rf staging && tsc -p tsconfig.staging.json",
      "build:production":
        "rm -rf production && tsc -p tsconfig.production.json",
    },
    keywords: ["api", "generated"],
    author: "",
    license: "ISC",
    devDependencies: {
      "@eslint/js": "latest",
      "@types/bcrypt": "latest",
      "@types/cors": "latest",
      "@types/geoip-lite": "latest",
      "@types/jsonwebtoken": "latest",
      "@types/morgan": "latest",
      "@types/multer": "latest",
      "@types/nodemailer": "latest",
      "@types/request-ip": "latest",
      "@types/speakeasy": "latest",
      "@typescript-eslint/eslint-plugin": "latest",
      "@typescript-eslint/parser": "latest",
      eslint: "latest",
      "eslint-config-prettier": "latest",
      "eslint-plugin-prettier": "latest",
      globals: "latest",
      "lint-staged": "latest",
      prettier: "latest",
      "ts-node": "latest",
      typescript: "latest",
      "typescript-eslint": "latest",
    },
    dependencies: {
      "@faker-js/faker": "latest",
      "@sentry/node": "latest",
      "@types/express": "latest",
      "@types/node": "latest",
      bcrypt: "latest",
      cors: "latest",
      dotenv: "latest",
      express: "latest",
      "express-rate-limit": "latest",
      "file-type": "latest",
      "fix-esm": "latest",
      "geoip-lite": "latest",
      handlebars: "latest",
      helmet: "latest",
      joi: "latest",
      jsonwebtoken: "latest",
      morgan: "latest",
      multer: "latest",
      mysql: "latest",
      mysql2: "latest",
      nodemailer: "latest",
      "reflect-metadata": "latest",
      "request-ip": "latest",
      "rotating-file-stream": "latest",
      "sanitize-filename": "latest",
      sentry: "latest",
      "socket.io": "latest",
      speakeasy: "latest",
      typeorm: "latest",
      "ua-parser-js": "latest",
      winston: "latest",
    },
  };

  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageJsonContent, null, 2),
  );

  console.log(`Created package.json: ${packageJsonPath}`);
};

const createTsConfigs = async (targetDirectory: string) => {
  const tsconfigPath = path.join(targetDirectory, "tsconfig.json");

  const tsconfig = {
    compilerOptions: {
      target: "es5",
      lib: ["es5", "es6", "dom"],
      experimentalDecorators: true,
      emitDecoratorMetadata: true,
      module: "commonjs",
      rootDir: "./src",
      outDir: "./production",
      esModuleInterop: true,
      forceConsistentCasingInFileNames: true,
      strict: true,
      skipLibCheck: true,
    },
  };
  fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 2));
  console.log(`Created tsconfig.production.json: ${tsconfigPath}`);

  const tsconfigProdPath = path.join(
    targetDirectory,
    "tsconfig.production.json",
  );

  const tsconfigProd = {
    extends: "./tsconfig.json",
    compilerOptions: {
      outDir: "./production",
    },
  };
  fs.writeFileSync(tsconfigProdPath, JSON.stringify(tsconfigProd, null, 2));
  console.log(`Created tsconfig.production.json: ${tsconfigProdPath}`);

  const tsconfigStagingPath = path.join(
    targetDirectory,
    "tsconfig.staging.json",
  );

  const tsconfigStaging = {
    extends: "./tsconfig.json",
    compilerOptions: {
      outDir: "./staging",
    },
  };
  fs.writeFileSync(
    tsconfigStagingPath,
    JSON.stringify(tsconfigStaging, null, 2),
  );
  console.log(`Created tsconfig.staging.json: ${tsconfigStagingPath}`);
};

const createServices = async (targetDirectory: string) => {
  fs.writeFileSync(
    path.join(targetDirectory, "routing.ts"),
    routingServiceContent,
  );
  fs.writeFileSync(
    path.join(targetDirectory, "logger.ts"),
    loggerServiceContent,
  );
  fs.writeFileSync(path.join(targetDirectory, "jwt.ts"), jwtServiceContent);
  fs.writeFileSync(path.join(targetDirectory, "user.ts"), userServiceContent);
};

const createControllers = async (targetDirectory: string) => {
  fs.writeFileSync(
    path.join(targetDirectory, "user.ts"),
    userControllerContent,
  );
};

const createEntities = async (targetDirectory: string) => {
  fs.writeFileSync(path.join(targetDirectory, "base.ts"), baseEntityContent);

  fs.writeFileSync(path.join(targetDirectory, "role.ts"), roleEntityContent);

  fs.writeFileSync(path.join(targetDirectory, "user.ts"), userEntityContent);
};

const createMiddleware = async (targetDirectory: string) => {
  fs.writeFileSync(
    path.join(targetDirectory, "authorization.ts"),
    authorizationMiddlewareContent,
  );
};

const createRoutes = async (targetDirectory: string) => {
  fs.writeFileSync(path.join(targetDirectory, "user.ts"), userRouterContent);
};

const createSchemas = async (targetDirectory: string) => {
  fs.writeFileSync(path.join(targetDirectory, "user.ts"), userSchemaContent);
};

const createEnums = async (targetDirectory: string) => {
  fs.writeFileSync(path.join(targetDirectory, "roles.ts"), rolesEnumContent);
};
