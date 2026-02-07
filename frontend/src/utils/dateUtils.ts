import { formatDistanceToNow as fdt } from 'date-fns';
import { enUS } from 'date-fns/locale';

export const formatDistanceToNow = (date: string | Date) => {
  return fdt(new Date(date), { addSuffix: true, locale: enUS });
};