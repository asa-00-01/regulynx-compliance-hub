
// Generate realistic Swedish personal identity numbers
export const generatePersonalIdentityNumber = (dateOfBirth: string): string => {
  const date = new Date(dateOfBirth);
  const year = date.getFullYear().toString().slice(-2);
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const lastFour = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${year}${month}${day}${lastFour}`;
};

// Generate realistic email confirmation tokens
export const generateEmailToken = (): string => {
  return Array.from({ length: 8 }, () => Math.random().toString(36).substring(2, 4)).join('-');
};

// Generate UUID v4
export const generateUUID = (): string => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};
