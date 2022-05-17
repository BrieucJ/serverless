import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { BaseEntity } from 'typeorm'
import { User } from '../entities'

export function IsEmailUnique(validationOptions?: ValidationOptions) {
  return function (object: BaseEntity, propertyName: string) {
    registerDecorator({
      name: 'IsEmailUnique',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        async validate(email: string, args: ValidationArguments): Promise<boolean> {
          return User.findOneBy({ email: email }).then((user) => {
            if (user && (args.object as User)._id?.toString() !== user._id?.toString()) return false
            return true
          })
        },
      },
    })
  }
}
