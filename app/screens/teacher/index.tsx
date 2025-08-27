import AddLearnerCard from "@/components/AddLearnerCard";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import { getStudents } from "@/services/userService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";

const ManageLearnersScreen = () => {
  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  const [results, setResults] = useState<any[]>();

  useEffect(() => {
    const fetchCards = async () => {
      try {
        const data = await getStudents();
        setResults(data);
      } catch (err) {
        console.error("Error fetching boards: ", err);
      }
    };
    fetchCards();
  }, []);

  return (
    <View style={styles.container}>
      <Sidebar userRole="teacher" onNavigate={handleNavigation} />
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
        <View style={{ flexDirection: "row", gap: 20 }}>
          <AddLearnerCard screen="teacher" />
          {results?.map((result, index) => (
            <LearnerCard
              name={result.fname}
              age={1}
              gender={result.gender}
              cardType="profile"
              userId={result.id}
              key={index}
            />
          ))}
        </View>
      </View>
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
