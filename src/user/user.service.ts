import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {}

  async create(dto: CreateUserDto) {
    const users = this.userRepository.create(dto)

    return await this.userRepository.save(users)
  }

  findMany() {
    return this.userRepository.find();
  }

  async update(id: number, dto: CreateUserDto) {
    const users = await this.userRepository.findOne({
      where: {
        id
      }
    })

    Object.assign(users, dto)

    return await this.userRepository.save(users);
  }

  async delete(id: number) {
    const user = await this.userRepository.findOne({where: {id}})

    return this.userRepository.remove(user)
  }
}
