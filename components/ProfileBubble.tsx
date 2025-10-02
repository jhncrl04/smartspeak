import { Image, Pressable, StyleSheet, Text, View } from "react-native";

const ProfileBubble = ({ user, onPress }: any) => {
  const profileImage =
    user?.photo_url || user?.profile_pic
      ? { uri: user?.photo_url || user?.profile_pic }
      : require("../assets/images/default.jpg");

  const displayName =
    user?.first_name || user?.last_name
      ? `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim()
      : user?.display_name || "Unknown";

  return (
    <Pressable onPress={() => onPress?.(user)}>
      <View style={styles.bubble}>
        <Image source={profileImage} style={styles.profile} />
        <Text style={styles.name} ellipsizeMode="tail" numberOfLines={1}>
          {displayName}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  bubble: {
    gap: 5,
    alignItems: "center",
    width: 75,
    padding: 10,
  },
  profile: {
    width: 40,
    height: 40,
    borderRadius: 100,
    backgroundColor: "#e0e0e0",
  },
  name: {
    fontSize: 14,
    textAlign: "center",
  },
});

export default ProfileBubble;
