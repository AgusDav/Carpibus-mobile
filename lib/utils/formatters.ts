export const formatters = {
  currency: (amount: number, currency = '$'): string => {
    return `${currency}${amount.toLocaleString('es-ES')}`;
  },

  date: (date: string | Date, format: 'short' | 'long' | 'time' = 'short'): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    switch (format) {
      case 'short':
        return dateObj.toLocaleDateString('es-ES');
      case 'long':
        return dateObj.toLocaleDateString('es-ES', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
      case 'time':
        return dateObj.toLocaleTimeString('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        });
      default:
        return dateObj.toLocaleDateString('es-ES');
    }
  },

  time: (time: string): string => {
    return time.substring(0, 5); // HH:MM
  },

  capitalize: (text: string): string => {
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  },
};