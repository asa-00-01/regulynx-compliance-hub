
import { useMediaQuery } from './use-mobile';

export function useIsMobile() {
  return useMediaQuery('(max-width: 768px)');
}
