// app/chatScreen.tsx
import MessageBubble from "@/components/MessageBubble";
import Sidebar from "@/components/Sidebar";
import COLORS from "@/constants/Colors";
import auth from "@react-native-firebase/auth";
import firestore from "@react-native-firebase/firestore";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type MsgItem = {
  id: string;
  senderId: string;
  text: string;
  createdAt?: any; // Firestore Timestamp
};

export default function ChatScreen() {
  const router = useRouter();
  const { chatId, userId, name } = useLocalSearchParams(); // we’ll fetch profilePic instead
  const [messagesRaw, setMessagesRaw] = useState<MsgItem[]>([]);
  const [input, setInput] = useState("");
  const [otherProfilePic, setOtherProfilePic] = useState<string | null>(null);
  const currentUser = auth().currentUser;

  // 🔹 Fetch other user's profile_pic from Firestore
  useEffect(() => {
    if (!userId) return;
    const unsub = firestore()
      .collection("users")
      .doc(userId as string)
      .onSnapshot((doc) => {
        if (doc.exists) {
          const data = doc.data();
          setOtherProfilePic(data?.profile_pic || null);
        }
      });

    return () => unsub();
  }, [userId]);

  // 🔹 Listen to messages
  useEffect(() => {
    if (!chatId) return;

    const unsubscribe = firestore()
      .collection("chats")
      .doc(chatId as string)
      .collection("messages")
      .orderBy("createdAt", "desc") // newest first
      .onSnapshot((qs) => {
        const list: MsgItem[] = [];
        qs.forEach((d) => {
          list.push({ id: d.id, ...(d.data() as any) } as MsgItem);
        });
        setMessagesRaw(list);
      });

    return () => unsubscribe();
  }, [chatId]);

  // Helpers
  const tsToMillis = (ts: any) => {
    if (!ts) return 0;
    if (typeof ts.toMillis === "function") return ts.toMillis();
    if (ts.seconds) return ts.seconds * 1000 + Math.floor((ts.nanoseconds || 0) / 1e6);
    const parsed = new Date(ts).getTime();
    return isNaN(parsed) ? 0 : parsed;
  };

  const formatTime = (ts: any) => {
    if (!ts) return "";
    const d = new Date(tsToMillis(ts));
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  };

  const formatDateLabel = (ts: any) => {
    if (!ts) return "";
    const d = new Date(tsToMillis(ts));
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  // 🔹 Group messages by date
  const grouped = useMemo(() => {
    const sorted = [...messagesRaw].sort(
      (a, b) => tsToMillis(a.createdAt) - tsToMillis(b.createdAt)
    );

    const out: Array<any> = [];
    let lastDate: string | null = null;

    for (const m of sorted) {
      const dateStr = formatDateLabel(m.createdAt);
      if (dateStr !== lastDate) {
        out.push({ type: "date", id: `date-${dateStr}-${m.id}`, date: dateStr });
        lastDate = dateStr;
      }
      out.push({ type: "message", ...m });
    }

    return out;
  }, [messagesRaw]);

  // 🔹 Reverse for FlatList inverted
  const flatData = useMemo(() => [...grouped].reverse(), [grouped]);

  // 🔹 Send message
  const sendMessage = async () => {
    if (!input.trim() || !currentUser || !chatId) return;

    const text = input.trim();
    const newMessage = {
      senderId: currentUser.uid,
      text,
      createdAt: firestore.FieldValue.serverTimestamp(),
    };

    try {
      await firestore()
        .collection("chats")
        .doc(chatId as string)
        .collection("messages")
        .add(newMessage);

      await firestore().collection("chats").doc(chatId as string).set(
        {
          participants: [currentUser.uid, userId],
          lastMessage: text,
          updatedAt: firestore.FieldValue.serverTimestamp(),
        },
        { merge: true }
      );

      setInput("");
    } catch (err) {
      console.error("sendMessage error:", err);
    }
  };

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={() => {}} />

      <View style={styles.chatContainer}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{name}</Text>
          <View style={styles.rightPlaceholder} />
        </View>

        {/* Messages */}
        <FlatList
          data={flatData}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={{ padding: 15 }}
          renderItem={({ item }) => {
            if (item.type === "date") {
              return (
                <View style={styles.dateHeader}>
                  <Text style={styles.dateHeaderText}>{item.date}</Text>
                </View>
              );
            }

            const isOwn = item.senderId === currentUser?.uid;

            return (
              <View
                style={[
                  styles.messageRow,
                  isOwn ? styles.myRow : styles.theirRow,
                ]}
              >
                {/* Show profile only for the other user */}
                {!isOwn && (
                  <Image
                    source={
                      otherProfilePic
                        ? { uri: otherProfilePic }
                        : require("@/assets/images/default.jpg") // local image
                    }
                    style={styles.avatar}
                  />
                )}

                <MessageBubble
                  text={item.text}
                  timestamp={formatTime(item.createdAt)}
                  isOwnMessage={isOwn}
                />
              </View>
            );
          }}
        />

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={input}
            onChangeText={setInput}
            placeholder="Type a message..."
            placeholderTextColor="#434343b3"
          />
          <TouchableOpacity onPress={sendMessage} style={styles.sendButton}>
            <Text style={styles.sendText}>➤</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: "row", backgroundColor: COLORS.white },
  chatContainer: { flex: 1, flexDirection: "column", paddingHorizontal: 40 },

  header: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderColor: COLORS.gray,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: { paddingHorizontal: 10 },
  backText: { fontSize: 16, color: COLORS.accent, fontWeight: "500" },
  headerTitle: {
    fontSize: 18,
    fontWeight: "500",
    fontFamily: "Poppins",
    textAlign: "center",
    flex: 1,
  },
  rightPlaceholder: { width: 50 },

  dateHeader: {
    alignSelf: "center",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginVertical: 8,
  },
  dateHeaderText: { fontSize: 13, color: COLORS.gray, fontWeight: "500" },

  messageRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    maxWidth: "80%",
  },
  myRow: { alignSelf: "flex-end" },
  theirRow: { alignSelf: "flex-start" },

  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 8,
  },

  inputContainer: {
    flexDirection: "row",
    padding: 10,
  },
  input: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 25,
    marginRight: 10,
    backgroundColor: COLORS.white,
  },
  sendButton: { borderRadius: 22, justifyContent: "center", alignItems: "center" },
  sendText: { color: COLORS.accent, fontSize: 38},
});
