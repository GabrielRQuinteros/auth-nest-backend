import { BadRequestException, Injectable, InternalServerErrorException, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';

import { model, Model } from 'mongoose';
import * as bcryptjs from 'bcryptjs';

import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { JwtPayload } from './interfaces/jwt-payload';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';

@Injectable()
export class AuthService {
  
  constructor(@InjectModel(User.name) private userModel: Model<User>,
              private jwtService: JwtService
            ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {

    try {
      const { password, ...userData} = createUserDto;
      const user = new this.userModel(  { password: bcryptjs.hashSync(password, 10), ...userData }   );
      const newUser = await user.save()
      const { password:_, ...returnedUser } = newUser.toJSON();
      return returnedUser;

    }catch ( error ) {
      if( error.code === 11000 ) {
        throw new BadRequestException(`Ya existe un usuario con email ${createUserDto.email}. Utilize otro email.` );
      } else {
        throw new InternalServerErrorException("Ha ocurrido un error desconocido, por favor contacte a los administradores.")
      }
    }
     
  }

  findAll(): Promise<User[]>{
    return this.userModel.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateAuthDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;
    const user = await this.userModel.findOne( { email });

    if( !user )
      throw new UnauthorizedException('Credenciales no son validas');

    if( ! bcryptjs.compareSync(  password, user.password ) )
      throw new UnauthorizedException( 'Credenciales no son validas' );

    const { password:_, ...rest } = user.toJSON();

    return{
            user: rest,
            token: this.getJwt( { userId: user.id } ),
            }
  }

  getJwt( payload: JwtPayload  ): string {
      return this.jwtService.sign( payload );
  }

  async register(registerUserDto :RegisterUserDto): Promise<LoginResponse>{
    let { email, name, password } = registerUserDto;
    let createUserDto: CreateUserDto = { email, name, password };
    await this.create(createUserDto);
    let loginDto: LoginDto ={ email, password };
    return this.login( loginDto );
  }

  async findUserById( id: string ) {
    const user = await this.userModel.findById(id);
    const {  password, ...rest} = user.toJSON();
    return rest;
  }


  async checkToken(req: Request): Promise<LoginResponse> {
    const user = req['user'] as User;
    return { user: user, token: this.getJwt( { userId: (user as any)._id } ) };
  }


}
