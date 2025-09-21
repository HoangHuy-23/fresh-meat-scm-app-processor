import { Link, Stack } from "expo-router";
import { StyleSheet, Text } from "react-native";


export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: "Oops!" }} />
        <Link href="/" style={styles.link}>
          <Text style={styles.linkText}>Go to home screen!</Text>
        </Link>
    </>
  );
}

const styles = StyleSheet.create({
  link: {
    marginTop: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    backgroundColor: '#f97316',
  },
  linkText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
