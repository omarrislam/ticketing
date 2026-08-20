import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export class Password {
  static async toHash(password: string) {
    const salt = randomBytes(8).toString('hex');
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${buf.toString('hex')}.${salt}`;
  }
  static async compare(storedPassword: string, suppliedPassword: string) {
    //Extracting the hashed password and salt from the stored password. The stored password is in the format of "hashedPassword.salt"
    const [hashedPassword, salt] = storedPassword.split('.');
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return buf.toString('hex') === hashedPassword; // this returns true or false and toString is used to convert the buffer to a string so that we can compare it with the hashed password stored in the database
  }
}
