import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { validate } from "class-validator";
import { BadRequestError, NotFoundError } from "../utils/errors";

export class UserService {
    private userRepository = AppDataSource.getRepository(User);

    async createUser(userData: Partial<User>): Promise<User> {
        const user = this.userRepository.create(userData);
        
        const errors = await validate(user);
        if (errors.length > 0) {
            throw new BadRequestError(`Validation failed: ${errors.toString()}`);
        }

        return this.userRepository.save(user);
    }

    async findUserByEmail(email: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { email } });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }

    async findUserById(id: string): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user) {
            throw new NotFoundError("User not found");
        }
        return user;
    }

    async updateUser(id: string, userData: Partial<User>): Promise<User> {
        const user = await this.findUserById(id);

        Object.assign(user, userData);

        const errors = await validate(user);
        if (errors.length > 0) {
            throw new BadRequestError(`Validation failed: ${errors.toString()}`);
        }

        return this.userRepository.save(user);
    }

    async deleteUser(id: string): Promise<void> {
        const result = await this.userRepository.delete(id);
        if (result.affected === 0) {
            throw new NotFoundError("User not found");
        }
    }

    async verifyEmail(id: string): Promise<User> {
        const user = await this.findUserById(id);
        user.isEmailVerified = true;
        return this.userRepository.save(user);
    }

    async updateLastLogin(id: string): Promise<User> {
        const user = await this.findUserById(id);
        user.lastLoginAt = new Date();
        return this.userRepository.save(user);
    }
}