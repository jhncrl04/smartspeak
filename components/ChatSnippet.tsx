import COLORS from "@/constants/Colors";
import { Image, StyleSheet, Text, View } from "react-native";

type messageProps = { chatName: string; message: string; time: string };

const ChatSnippet = (props: messageProps) => {
  return (
    <View style={styles.container}>
      <Image
        source={require("../assets/images/creeper.png")}
        style={styles.profile}
      />
      <View style={styles.chatInfoContainer}>
        <Text style={styles.chatName}>{props.chatName}</Text>
        <View style={styles.chatSnippet}>
          <Text style={styles.message} numberOfLines={2} ellipsizeMode="clip">
            {props.message}
          </Text>
          <Text style={styles.time}>{props.time}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 100,

    flexGrow: 0,
    flexDirection: "row",
  },
  profile: {
    width: 90,
    height: 90,
    borderRadius: 90,
  },
  chatInfoContainer: {
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 5,

    width: "100%",
  },
  chatSnippet: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    width: "100%",
  },
  chatName: {
    fontSize: 20,
    color: COLORS.black,
    fontFamily: "Poppins",
    fontWeight: 500,
  },
  message: { fontSize: 16, width: "auto", maxWidth: "70%" },
  time: { fontSize: 16 },
});

export default ChatSnippet;
