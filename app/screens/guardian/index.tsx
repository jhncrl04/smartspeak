import FabMenu from "@/components/FabMenu";
import LearnerCard from "@/components/LearnerCard";
import PageHeader from "@/components/PageHeader";
import Sidebar from "@/components/Sidebar";
import AddChildModal from "@/components/ui/AddChildModal";
import { listenToChildren } from "@/services/userService";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";

const ChildManagementScreen = () => {
  const [children, setChildren] = useState<any[]>();

  const handleNavigation = (screen: string) => {
    router.push(screen as any);
  };

  useEffect(() => {
    const unsubscribe = listenToChildren((children) => {
      setChildren(children);
    });

    return () => unsubscribe();
  }, []);

  const [activeModal, setActiveModal] = useState<"add-child" | null>(null);

  return (
    <>
      <AddChildModal
        visible={activeModal === "add-child"}
        onClose={() => setActiveModal(null)}
      />
      <View style={styles.container}>
        <Sidebar userRole="guardian" onNavigate={handleNavigation} />
        <ScrollView>
          <View style={styles.pageContainer}>
            <PageHeader
              collectionToSearch="users"
              onSearch={() => {}}
              query="newLearner"
              pageTitle="Manage Child"
              hasFilter={false}
              searchPlaceholder="Search Child"
            />
            <View style={styles.cardContainer}>
              {children?.map((child) => (
                <LearnerCard
                  key={child.id}
                  learnerId={child.id}
                  cardType={"profile"}
                  image={child.profile_pic ? child.profile_pic : null}
                  name={child.first_name}
                  age={12}
                  gender={child.gender}
                />
              ))}
            </View>
          </View>
        </ScrollView>
        <FabMenu
          page="children"
          actions={{ add_child: () => setActiveModal("add-child") }}
        />
      </View>
    </>
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
  cardContainer: {
    flex: 1,
    flexWrap: "wrap",
    flexDirection: "row",

    alignItems: "center",

    gap: 15,

    paddingVertical: 20,
  },
});

export default ChildManagementScreen;
