import { config } from "dotenv";
import { cleanEnv, str, port } from "envalid";
config();

function validateEnv(){
    return cleanEnv(process.env, {
        NODE_ENV: str({choices: ['development', 'production', 'test']}),
        DB_HOST: str(),
        DB_PORT: port({default: 5432}),
        DB_USER: str(),
        DB_PASSWORD: str(),
        DB_NAME: str(),
        PORT: port({default: 3000}),
        SECRET: str()
    })
}

export const env = validateEnv();