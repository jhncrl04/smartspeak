// MessageScreen (messages.tsx)
import ChatSnippet from "@/components/ChatSnippet";
import MySearchBar from "@/components/mySearchBar";
import ProfileBubble from "@/components/ProfileBubble";
import Sidebar from "@/components/Sidebar";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

interface MessageScreenProps {
  userRole?: "teacher" | "guardian"; // always lowercase
}

const MessageScreen = ({ userRole = "teacher" }: MessageScreenProps) => {
  const [profileUsers, setProfileUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);

  const currentUserId = auth().currentUser?.uid;

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  // Helper: format updatedAt (handles Firestore Timestamp, Date, epoch object, or null)
  const formatTime = (ts: any) => {
    if (!ts) return "";
    // Firestore Timestamp has toDate()
    if (typeof ts?.toDate === "function") {
      const d = ts.toDate();
      if (d instanceof Date && !isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return "";
    }
    // Plain object like { seconds, nanoseconds }
    if (ts?.seconds && typeof ts.seconds === "number") {
      const millis =
        ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
      const d = new Date(millis);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return "";
    }
    // Already a JS Date
    if (ts instanceof Date) {
      if (!isNaN(ts.getTime())) {
        return ts.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      }
      return "";
    }
    // If it's a number (epoch ms)
    if (typeof ts === "number") {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
      return "";
    }
    // If it's an ISO string
    if (typeof ts === "string") {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) {
        return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      }
    }
    return "";
  };

  // Fetch users from Firebase based on role
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);

        const currentUser = auth().currentUser;
        const currentUserId = currentUser?.uid;

        let actualUserRole = userRole; // fallback to prop

        if (currentUserId) {
          try {
            const currentUserDoc = await firestore()
              .collection("users")
              .doc(currentUserId)
              .get();

            if (currentUserDoc.exists()) {
              const currentUserData = currentUserDoc.data();
              actualUserRole = currentUserData?.role?.toLowerCase() || userRole;
            }
          } catch (error) {
            console.log(
              "Could not fetch current user role, using prop:",
              userRole
            );
          }
        }

        const targetRole =
          actualUserRole.toLowerCase() === "guardian" ? "Teacher" : "Guardian";

        const querySnapshot = await firestore()
          .collection("users")
          .where("role", "==", targetRole)
          .get();

        const fetchedUsers: any[] = [];

        querySnapshot.forEach((doc) => {
          const userData = { id: doc.id, ...doc.data() };
          if (doc.id !== currentUserId) {
            fetchedUsers.push(userData);
          }
        });

        setProfileUsers(fetchedUsers);
      } catch (error) {
        console.error("Error fetching users from Firebase:", error);
        setProfileUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [userRole]);

  // Filter users based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredUsers(profileUsers);
    } else {
      const filtered = profileUsers.filter((user) => {
        const fullName = `${user?.first_name || ""} ${
          user?.last_name || ""
        }`.toLowerCase();
        const displayName = user?.display_name?.toLowerCase() || "";
        const query = searchQuery.toLowerCase();

        return fullName.includes(query) || displayName.includes(query);
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, profileUsers]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const getSearchPlaceholder = () => {
    return userRole === "guardian" ? "Search Teachers" : "Search Guardians";
  };

  // 🔥 Fetch conversations where current user is a participant (real-time)
  useEffect(() => {
    if (!currentUserId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .where("participants", "array-contains", currentUserId)
      .onSnapshot(async (snapshot) => {
        const chatsData = await Promise.all(
          snapshot.docs.map(async (doc) => {
            const chat = doc.data() as any;
            const otherUserId = chat.participants?.find(
              (id: string) => id !== currentUserId
            );

            const otherUserDoc = otherUserId
              ? await firestore().collection("users").doc(otherUserId).get()
              : null;

            const otherUserData = otherUserDoc?.exists
              ? otherUserDoc.data()
              : null;

            return {
              id: doc.id,
              lastMessage: chat.lastMessage || chat.last_message || "",
              updatedAt: chat.updatedAt ?? chat.updated_at ?? null, // keep raw value (Timestamp/Date/null)
              otherUser: {
                id: otherUserId,
                name: otherUserData
                  ? `${otherUserData.first_name || ""} ${
                      otherUserData.last_name || ""
                    }`.trim()
                  : "Unknown",
                profilePic: otherUserData?.profile_pic || null,
              },
            };
          })
        );

        // sort by updatedAt safely (handle Timestamp, Date, number)
        chatsData.sort((a, b) => {
          const aMillis = (() => {
            const t = a.updatedAt;
            if (!t) return 0;
            if (typeof t?.toDate === "function") return t.toDate().getTime();
            if (t?.seconds)
              return t.seconds * 1000 + Math.floor((t.nanoseconds || 0) / 1e6);
            if (t instanceof Date) return t.getTime();
            if (typeof t === "number") return t;
            return 0;
          })();

          const bMillis = (() => {
            const t = b.updatedAt;
            if (!t) return 0;
            if (typeof t?.toDate === "function") return t.toDate().getTime();
            if (t?.seconds)
              return t.seconds * 1000 + Math.floor((t.nanoseconds || 0) / 1e6);
            if (t instanceof Date) return t.getTime();
            if (typeof t === "number") return t;
            return 0;
          })();

          return bMillis - aMillis;
        });

        setConversations(chatsData);
      });

    return () => unsubscribe();
  }, [currentUserId]);

  return (
    <View style={styles.container}>
      <Sidebar userRole={userRole} onNavigate={handleNavigation} />
      <View style={styles.pageContainer}>
        <Text style={styles.header}>Messages</Text>
        <View style={{ flexGrow: 0 }}>
          <MySearchBar
            placeholder={getSearchPlaceholder()}
            query="local"
            onSearch={handleSearch}
          />
        </View>

        {/* profile carousel */}
        <View style={styles.profileCarousel}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#9B72CF" />
              <Text style={styles.loadingText}>Loading users...</Text>
            </View>
          ) : (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <ProfileBubble
                    key={user.id}
                    user={user}
                    onPress={async (selectedUser: any) => {
                      const currentUserId = auth().currentUser?.uid;
                      const chatId =
                        currentUserId < selectedUser.id
                          ? `${currentUserId}_${selectedUser.id}`
                          : `${selectedUser.id}_${currentUserId}`;

                      const chatRef = firestore()
                        .collection("chats")
                        .doc(chatId);
                      const chatDoc = await chatRef.get();

                      if (!chatDoc.exists) {
                        await chatRef.set({
                          participants: [currentUserId, selectedUser.id],
                          createdAt: firestore.FieldValue.serverTimestamp(),
                          lastMessage: "",
                          updatedAt: firestore.FieldValue.serverTimestamp(),
                        });
                      }

                      router.push({
                        pathname: "/screens/chatScreen",
                        params: {
                          chatId,
                          userId: selectedUser.id,
                          name: `${selectedUser.first_name} ${selectedUser.last_name}`,
                        },
                      });
                    }}
                  />
                ))
              ) : (
                <Text style={styles.noUsersText}>
                  {searchQuery
                    ? "No users found"
                    : `No ${
                        userRole === "guardian" ? "teachers" : "guardians"
                      } available`}
                </Text>
              )}
            </ScrollView>
          )}
        </View>

        {/* Conversations list (scrollable) */}
        <ScrollView
          style={styles.messageContainer}
          showsVerticalScrollIndicator
        >
          {conversations.length > 0 ? (
            conversations.map((chat) => (
              <ChatSnippet
                key={chat.id}
                chatName={chat.otherUser.name}
                message={chat.lastMessage}
                time={formatTime(chat.updatedAt)}
                profilePic={chat.otherUser.profilePic}
                onPress={() =>
                  router.push({
                    pathname: "/screens/chatScreen",
                    params: {
                      chatId: chat.id,
                      userId: chat.otherUser.id,
                      name: chat.otherUser.name,
                    },
                  })
                }
              />
            ))
          ) : (
            <Text style={styles.noUsersText}>No conversations yet</Text>
          )}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", gap: 10 },
  pageContainer: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 30,
  },
  header: {
    fontSize: 20,
    textAlign: "center",
    fontFamily: "Poppins",
    fontWeight: "500",
  },
  messageContainer: {
    flex: 1,
  },
  profileCarousel: {
    gap: 10,
    flexDirection: "row",
    overflow: "hidden",
  },
  scrollContent: {
    gap: 5,
    paddingHorizontal: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  noUsersText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    flex: 1,
    paddingVertical: 20,
  },
});

export default MessageScreen;
