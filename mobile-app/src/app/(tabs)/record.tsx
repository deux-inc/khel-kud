// Record tab: active game session, live timer, start/stop tracking  
import { Text, View, StyleSheet } from "react-native";


export default function Record() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Hello world!</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    text: {
        fontSize: 20,
        fontWeight: "bold",
    },
});