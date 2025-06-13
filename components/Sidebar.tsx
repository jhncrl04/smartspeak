import { useRef, useState } from "react";
import { Button, Text, View } from "react-native";
import {
  DrawerLayoutAndroid,
  GestureHandlerRootView,
} from "react-native-gesture-handler";
const Sidebar = () => {
  const drawer = useRef<DrawerLayoutAndroid>(null);
  const [drawerPosition, setDrawerPosition] = useState<"left" | "right">(
    "left"
  );

  const sidebar = () => (
    <View>
      <Text> This is a test</Text>
      <Button
        title="Close Sidebar"
        onPress={() => drawer.current?.closeDrawer()}
      />
    </View>
  );
  return (
    <GestureHandlerRootView>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition={drawerPosition}
        renderNavigationView={sidebar}
      >
        <View>
          <Text>Drawer test</Text>
          <Button
            title="Open Drawer"
            onPress={() => drawer.current?.openDrawer()}
          />
        </View>
      </DrawerLayoutAndroid>
    </GestureHandlerRootView>
  );
};

export default Sidebar;
