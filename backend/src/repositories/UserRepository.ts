import { Repository } from "typeorm";
import { User } from "../entities/User";

export class UserRepository extends Repository<User> {
    async findByEmail(email: string): Promise<User | null> {
        return this.findOne({ where: { email } });
    }

    // Buraya daha fazla özel sorgu metodu ekleyebilirsiniz
}