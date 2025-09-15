import AddLearnerCard from "@/components/AddLearnerCard";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { listenToStudents } from "@/services/userService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, View } from "react-native";

const ManageLearnersScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [results, setResults] = useState<any[]>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Start listening when component mounts
    const unsubscribe = listenToStudents(
      (updatedStudents) => {
        setResults(updatedStudents);
        setLoading(false);
      },
      (err) => {
        setLoading(false);
      }
    );

    // Cleanup when component unmounts
    return unsubscribe;
  }, []);

  if (loading) return <ActivityIndicator size="large" />;

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.pageContainer}>
          <PageHeader
            pageTitle="Manage Learners"
            hasFilter={false}
            searchPlaceholder="Search Learner"
            onSearch={(results) => {
              setResults(results);
            }}
            collectionToSearch="users"
            query="myStudent"
          />
          <View style={{ flexDirection: "row", gap: 20, paddingVertical: 20 }}>
            <AddLearnerCard screen="teacher" />
            {results?.map((result, index) => (
              <LearnerCard
                image={result.profile_pic}
                name={result.first_name}
                age={1}
                gender={result.gender}
                cardType="profile"
                learnerId={result.id}
                key={index}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,

    flexDirection: "row",
  },
  pageContainer: { flex: 1, paddingHorizontal: 30, paddingVertical: 20 },
  sidebar: {
    flex: 1,
    backgroundColor: "#eee",
  },
});

export default ManageLearnersScreen;
