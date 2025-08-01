import { Image, StyleSheet, Text, View } from "react-native";

const ProfileBubble = () => {
  return (
    <View style={styles.bubble}>
      <Image
        source={require("../assets/images/creeper.png")}
        style={styles.profile}
      />
      <Text style={styles.name} ellipsizeMode="clip" numberOfLines={1}>
        Profile Name
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    gap: 10,
    alignItems: "center",
    width: 100,

    padding: 10,
  },
  profile: { width: 75, height: 75, borderRadius: 75 },
  name: {},
});

export default ProfileBubble;
