import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from '../interfaces/jwt-payload';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {


  constructor( private jwtService: JwtService,
               private authService: AuthService, 
  ){}

  async canActivate( context: ExecutionContext):Promise<boolean>{
    const request = context.switchToHttp().getRequest();
    return this.validateRequest(request);
  }


  /** Valida si el usuario tenia permisos para realizar la petición. 
   * @param request  - Petición a ser validada
   * @returns - devuelve un observable de boolean que indica si la petición fue valida o no.
   */
  async validateRequest(request: Request): Promise<boolean> {
    const token = this.extractTokenFromHeader(request);
    if(!token)
      throw new UnauthorizedException('Bearer token is missing');
    
    try {
      const payload = await this.jwtService.verifyAsync<JwtPayload>( token, { secret: process.env.JWT_SEED } );
      const user = await this.authService.findUserById(payload.userId);
      if( ! user ) throw new UnauthorizedException('User does no exist');
      if( ! user.isActive ) throw new UnauthorizedException('User is not active');
      
      request['user'] = user;
      return true;
    } catch(  error ) {
        throw new UnauthorizedException();
    }
  }
  
  /** Función que extrae el token de la cabecera de la request en el campo "authorization"
   * @param request - Petición Http de la que se extrae el token.
   * @returns - Devuelve el token --> Si el campo no esta vació y es un Bearer token. Caso contrario devuelve un undefined. 
   */
  extractTokenFromHeader( request: Request): string | undefined {
    const [type, token] = request.headers['authorization']?.split(" ") ?? [];
    return type === 'Bearer'? token : undefined;
  }

  
}



