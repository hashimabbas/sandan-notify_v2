// utils/password.ts

export async function saltAndHashPassword(password: string): Promise<string> {
  var bcrypt = require('bcryptjs');
  const salt = await bcrypt.genSalt(10); // Adjust the salt rounds as needed
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}
