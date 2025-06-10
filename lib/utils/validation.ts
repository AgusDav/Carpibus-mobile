export const validation = {
  email: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  password: (password: string): { isValid: boolean; message?: string } => {
    if (password.length < 8) {
      return { isValid: false, message: 'La contraseña debe tener al menos 8 caracteres' };
    }
    return { isValid: true };
  },

  phone: (phone: string): boolean => {
    const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
    return phone.length >= 8 && phoneRegex.test(phone);
  },

  document: (document: string): boolean => {
    return document.length >= 7 && /^\d+$/.test(document);
  },

  required: (value: string): boolean => {
    return value.trim().length > 0;
  },
};