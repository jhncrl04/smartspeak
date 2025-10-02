import COLORS from "@/constants/Colors";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

type messageProps = {
  chatName: string;
  message: string;
  time: string;
  profilePic?: string;
  onPress?: () => void;
};

const ChatSnippet = (props: messageProps) => {
  // truncate message to max 10 chars
  const truncatedMessage =
    props.message && props.message.length > 10
      ? props.message.substring(0, 20) + "..."
      : props.message;

  return (
    <TouchableOpacity style={styles.container} onPress={props.onPress}>
      <Image
        source={
          props.profilePic
            ? { uri: props.profilePic }
            : require("./default.jpg") // ✅ fallback image
        }
        style={styles.profile}
      />

      <View style={styles.chatInfoContainer}>
        <Text style={styles.chatName}>{props.chatName}</Text>
        <View style={styles.chatSnippet}>
          <Text style={styles.message}>{truncatedMessage}</Text>
          <Text style={styles.time}>• {props.time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 75,
    flexGrow: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    width: 50,
    height: 50,
    borderRadius: 100,
    backgroundColor: "#eee", // placeholder while loading
  },
  chatInfoContainer: {
    flexDirection: "column",
    justifyContent: "flex-start",
    paddingHorizontal: 15,
    flex: 1,
  },
  chatSnippet: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  chatName: {
    fontSize: 16,
    color: COLORS.black,
    fontFamily: "Poppins",
    fontWeight: "500",
    lineHeight: 20,
  },
  message: {
    fontSize: 14,
    lineHeight: 16,
    maxWidth: "70%",
    color: COLORS.gray,
  },
  time: { fontSize: 14, color: COLORS.gray },
});

export default ChatSnippet;
