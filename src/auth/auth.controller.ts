import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { LoginResponse } from './interfaces/login-response';
import { RegisterUserDto } from './dto/register-user.dto';
import { AuthGuard } from './guards/auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.authService.create(createUserDto);
  }

  @UseGuards( AuthGuard )
  @Get()
  findAll( @Request() req: Request ) {
    return this.authService.findAll();
  }

  
  @Post('/login')
  login (@Body() loginDto: LoginDto ): Promise<LoginResponse> {
    return this.authService.login(loginDto);
  }
  
  @Post('/register')
  register (@Body() registerUserDto: RegisterUserDto ): Promise<LoginResponse> {
    return this.authService.register(registerUserDto);
  }

  @UseGuards( AuthGuard )
  @Get('/check-token')
  checkToken(@Request() req: Request): Promise<LoginResponse>{
    return this.authService.checkToken(req);
  }
  
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.authService.findOne(+id);
  // }

  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
  //   return this.authService.update(+id, updateUserDto);
  // }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.authService.remove(+id);
  // }
  
  
}
