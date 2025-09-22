export const formatTimestamp = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    const time = date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const day = date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    return `${time} - ${day}`;
  } catch (error) {
    return 'Invalid Date';
  }
};
