// Generate a unique friend code in format HABIT-XXXXXX
// where X can be alphanumeric characters or special characters
export const generateFriendCode = (): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*';
  let code = 'HABIT-';
  
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    code += characters[randomIndex];
  }
  
  return code;
};
