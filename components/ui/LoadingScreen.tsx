import COLORS from "@/constants/Colors";
import { ActivityIndicator, Modal, StyleSheet, View } from "react-native";

type LoadingScreenProps = {
  visible: boolean;
};

const LoadingScreen = ({ visible }: LoadingScreenProps) => {
  return (
    <Modal transparent visible={visible}>
      <View style={styles.overlay}>
        <ActivityIndicator size="large" color={COLORS.accent} />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,

    width: "100%",
    height: "100%",

    flex: 1,
    backgroundColor: COLORS.shadow,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LoadingScreen;
