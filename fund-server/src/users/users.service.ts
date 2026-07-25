import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./entities/user.entity";
import { CreateUserDto } from "./dto/create-user.dto";
import { UpdateUserDto } from "./dto/update-user.dto";
import * as bcrypt from "bcryptjs";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Ensure role defaults to "user" if not explicitly set (for admin creation only)
    const userData = {
      ...createUserDto,
      password: hashedPassword,
      role: createUserDto.role || ("user" as const),
    };

    const user = this.usersRepository.create(userData);
    return this.usersRepository.save(user);
  }

  /**
   * Create admin user - Only superadmin can create admins
   * Regular registration always creates "user" role
   */
  async createAdmin(
    createUserDto: CreateUserDto,
    role: "admin" | "superadmin"
  ): Promise<User> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error("User with this email already exists");
    }

    // Remove role from DTO if present (we set it explicitly)
    const { role: _, ...userData } = createUserDto;

    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      role: role,
    });
    return this.usersRepository.save(user);
  }

  /**
   * Update user role - Only superadmin can change roles
   */
  async updateRole(
    userId: string,
    newRole: "user" | "admin" | "superadmin"
  ): Promise<User> {
    await this.usersRepository.update(userId, { role: newRole });
    return this.findOne(userId);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ["campaigns", "fundings"],
    });
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ["campaigns", "fundings"],
    });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    // Prevent role changes through regular update - use updateRole() instead
    const { role, ...updateData } = updateUserDto;
    if (role) {
      throw new Error(
        "Cannot update role through regular update. Use updateRole() method instead."
      );
    }

    await this.usersRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }

  async updatePassword(id: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersRepository.update(id, { password: hashedPassword });
  }
}
