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
    height: 100,
    flexGrow: 0,
    flexDirection: "row",
    alignItems: "center",
  },
  profile: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#eee", // placeholder while loading
  },
  chatInfoContainer: {
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 5,
    flex: 1,
  },
  chatSnippet: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  chatName: {
    fontSize: 18,
    color: COLORS.black,
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  message: { fontSize: 14, maxWidth: "70%", color: COLORS.gray },
  time: { fontSize: 14, color: COLORS.gray  },
});

export default ChatSnippet;
