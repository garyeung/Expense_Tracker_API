import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function passwordHashing(password: string) {
    return  bcrypt.hash(password, SALT_ROUNDS);
}

export async function passwordCompare(password: string, hashedPW: string) {

    return bcrypt.compare(password, hashedPW)
}