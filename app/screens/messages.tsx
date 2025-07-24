import ChatSnippet from "@/components/ChatSnippet";
import MySearchBar from "@/components/mySearchBar";
import ProfileBubble from "@/components/ProfileBubble";
import Sidebar from "@/components/Sidebar";
import { router } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

const MessageScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <Text style={styles.header}>Messages</Text>
        <View style={{ flexGrow: 0 }}>
          <MySearchBar placeholder="Search Parent" />
        </View>
        <View style={styles.profileCarousel}>
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
          <ProfileBubble />
        </View>
        <View style={styles.messageContainer}>
          <ChatSnippet
            chatName="John Carlo Servidad"
            message="Hello, World!"
            time="11:30 pm"
          />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", gap: 10 },
  pageContainer: {
    flex: 1,
    gap: 15,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: 500,
  },
  messageContainer: { flex: 1, gap: 10 },
  profileCarousel: { gap: 10, flexDirection: "row", overflow: "hidden" },
});

export default MessageScreen;
