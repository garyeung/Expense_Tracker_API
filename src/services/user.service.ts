import { Repository } from "typeorm";
import { DBConnected } from "./db.service";
import { User } from "../models/User.entity";


class UserService {
    private userRepository:Repository<User>| null;
    private initPromise: null | Promise<void>;

    constructor(){
        this.userRepository = null; 
        this.initPromise = null;
    }

    private async ensureInitialized(){
        if(!this.userRepository && !this.initPromise){
            this.initPromise = this.initialize();
        }
        await this.initPromise;
    }

    private async initialize() {
        this.userRepository = (await DBConnected()).getRepository(User);
    }   

    public async findUser(email: string){
        await this.ensureInitialized();
        try {
            return this.userRepository!.findOneBy({email:email});

        } catch (error) {
            throw new Error(`Error finding user in database: ${error}`);
        }
    }

    public async createUser(user: Partial<User>){
        await this.ensureInitialized();
        try{
            const userNewEntity = this.userRepository!.create(user);
            return this.userRepository!.save(userNewEntity) ;
        }
        catch(error){
            throw new Error(`Error create user in database: ${error}`)
        }
    }

    public async deleteUser(email: string) {
        await this.ensureInitialized();
        try {
            const result = await this.userRepository!.delete({email:email})

            return result.affected? true : false;
            
        } catch (error) {

            throw new Error(`Error deleting user in database: ${error}`);
        }

    }
}

export default UserService;