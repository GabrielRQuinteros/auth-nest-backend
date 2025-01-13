import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";


@Schema()
export class User {

    /// NOTA OJO!!!: Nest le agrega a todas las entidades un --> _id: string  , no hace falta agregarlo. 

    @Prop({ unique: true, required: true})
    email: string;
    
    @Prop({  required: true})
    name: string;

    @Prop({ minlength: 6, required: true})
    password?: string;
    
    @Prop({ default: true })
    isActive: boolean;
    
    @Prop({ type: [String], default: ['user'] }) // ['user', 'admin']
    roles: string [];

}

export const UserSchema = SchemaFactory.createForClass( User )
