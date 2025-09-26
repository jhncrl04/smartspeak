// components/ProfileList.tsx
import { useAuthStore } from "@/stores/userAuthStore";
import firestore from "@react-native-firebase/firestore";
import { useEffect, useState } from "react";
import { FlatList } from "react-native";
import ProfileBubble from "./ProfileBubble";

const ProfileList = () => {
  const { user } = useAuthStore(); // logged in user (from your store)
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!user) return;

    // guardians see teachers, teachers see guardians
    const roleToFetch = user.role === "guardian" ? "teacher" : "guardian";

    const unsubscribe = firestore()
      .collection("users")
      .where("role", "==", roleToFetch)
      .onSnapshot((snapshot) => {
        const fetchedUsers = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setUsers(fetchedUsers);
      });

    return () => unsubscribe();
  }, [user]);

  return (
    <FlatList
      data={users}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => <ProfileBubble user={item} />}
      horizontal
    />
  );
};

export default ProfileList;
