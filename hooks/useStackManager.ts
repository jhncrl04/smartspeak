import { useRootNavigationState } from "expo-router";
import { useEffect } from "react";

export const useExpoRouterStack = () => {
  const navigationState = useRootNavigationState();

  const logStack = () => {
    if (!navigationState?.routes) {
      console.log("Navigation state not ready");
      return;
    }

    const routes = navigationState.routes.map((route, index) => ({
      index,
      name: route.name,
      path: (route as any).state?.routes?.[0]?.name || route.name,
    }));

    // console.log("=== Expo Router Stack ===");
    // console.log(`Total routes: ${routes.length}`);
    // console.log(`Current index: ${navigationState.index}`);
    // routes.forEach((route) => {
    //   const isCurrent =
    //     route.index === navigationState.index ? " [CURRENT]" : "";
    //   console.log(`  ${route.index}: ${route.name}${isCurrent}`);
    // });
    // console.log("========================");
  };

  const getStackSize = () => {
    return navigationState?.routes.length || 0;
  };

  const getStackRoutes = () => {
    return navigationState?.routes.map((r) => r.name) || [];
  };

  // Auto log on route changes
  useEffect(() => {
    logStack();
  }, [navigationState]);

  return {
    logStack,
    getStackSize,
    getStackRoutes,
    navigationState,
  };
};
