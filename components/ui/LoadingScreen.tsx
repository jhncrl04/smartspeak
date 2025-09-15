import COLORS from "@/constants/Colors";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

type LoadingScreenProps = {
  visible: boolean;
};

const LoadingScreen = ({ visible }: LoadingScreenProps) => {
  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: COLORS.shadow,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingScreen;
