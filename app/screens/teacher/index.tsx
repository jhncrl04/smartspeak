// ManageLearnersScreen.tsx
import CardContainer from "@/components/CardContainer";
import { useRef } from "react";
import { Button, StyleSheet, Text, View } from "react-native";
import {
  DrawerLayoutAndroid,
  GestureHandlerRootView,
} from "react-native-gesture-handler";

const ManageLearnersScreen = () => {
  const drawer = useRef<DrawerLayoutAndroid>(null);

  const sidebar = () => (
    <View style={styles.sidebar}>
      <Text>This is a test</Text>
      <Button
        title="Close Sidebar"
        onPress={() => drawer.current?.closeDrawer()}
      />
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <DrawerLayoutAndroid
        ref={drawer}
        drawerWidth={300}
        drawerPosition="left"
        renderNavigationView={sidebar}
      >
        <View style={styles.container}>
          <Button
            title="Open Drawer"
            onPress={() => drawer.current?.openDrawer()}
          />
          <CardContainer />
        </View>
      </DrawerLayoutAndroid>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",
  },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
});

export default ManageLearnersScreen;
