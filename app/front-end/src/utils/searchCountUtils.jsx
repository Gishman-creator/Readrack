import axiosUtils from './axiosUtils';
import toast from 'react-hot-toast';

export const incrementSearchCount = async (type, id) => {
  try {
    await axiosUtils(`/api/incrementSearchCount`, 'POST', { type, id });
    // toast.success(`Search for ${type} count incremented`);
  } catch (error) {
    console.error(`Failed to increment search count for ${type} with ID ${id}:`, error);
  }
};
