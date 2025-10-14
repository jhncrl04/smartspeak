import { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text } from "react-native";

const Notification = ({ visible, message, type = "default" }) => {
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: -100,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.notificationContainer,
        { transform: [{ translateY: slideAnim }] },
        type === "break" && styles.breakNotification,
      ]}
    >
      <Text style={styles.notificationText}>{message}</Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  notificationContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: "#4B8BFF",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    zIndex: 1000,
    elevation: 10,
  },
  notificationText: {
    color: "#fff",
    fontWeight: "600",
    textAlign: "center",
  },
  breakNotification: {
    backgroundColor: "#A38DFF", // softer color for break reminders
  },
});

export default Notification;
