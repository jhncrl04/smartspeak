import { router, usePathname } from "expo-router";
import { useRef } from "react";

export const useSmartNavigation = () => {
  const pathname = usePathname();
  const navigationHistoryRef = useRef<string[]>([pathname]);

  const navigateTo = (target: string) => {
    // Already on this screen, do nothing
    if (pathname === target) return;

    // Check if target exists in our navigation history
    const targetIndex = navigationHistoryRef.current.indexOf(target);

    if (
      targetIndex !== -1 &&
      targetIndex < navigationHistoryRef.current.length - 1
    ) {
      // Target exists in history and it's not the current screen
      // Pop back to it
      const stepsToPop = navigationHistoryRef.current.length - 1 - targetIndex;
      router.back();

      // For multiple steps back, call back() multiple times
      for (let i = 1; i < stepsToPop; i++) {
        router.back();
      }

      // Update history to remove everything after target
      navigationHistoryRef.current = navigationHistoryRef.current.slice(
        0,
        targetIndex + 1
      );
    } else {
      // Target not in history, push it
      router.push(target as any);
      navigationHistoryRef.current.push(target);
    }
  };

  // Update history when pathname changes (for back button presses)
  if (
    pathname !==
    navigationHistoryRef.current[navigationHistoryRef.current.length - 1]
  ) {
    navigationHistoryRef.current.push(pathname);
  }

  return { navigateTo, pathname };
};
