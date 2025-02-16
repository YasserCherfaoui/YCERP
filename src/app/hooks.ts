import type { AppDispatch } from '@/app/store';
import { useDispatch } from 'react-redux';

// Use throughout your app instead of plain `useDispatch` and `dispatch`
export const useAppDispatch = () => useDispatch<AppDispatch>();