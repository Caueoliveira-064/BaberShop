import bcrypt from 'bcryptjs';
import fs from 'fs';
const hash = bcrypt.hashSync('123', 10);
fs.writeFileSync('hash.txt', hash);
