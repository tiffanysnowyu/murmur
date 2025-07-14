// import React, { useState } from 'react';
// import { View, Text, Button, ActivityIndicator, StyleSheet } from 'react-native';
// import { OPENAI_API_KEY } from '@env';

// export default function OpenAITestScreen() {
//   const [response, setResponse] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const callOpenAI = async () => {
//     setLoading(true);
//     setError(null);
//     setResponse(null);
//     try {
//       const result = await fetch('https://api.openai.com/v1/models', {
//         headers: {
//           'Authorization': `Bearer ${OPENAI_API_KEY}`,
//         },
//       });
//       if (!result.ok) {
//         throw new Error(`HTTP ${result.status}`);
//       }
//       const data = await result.json();
//       setResponse(JSON.stringify(data, null, 2));
//     } catch (e) {
//       setError(e.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>OpenAI Key Test</Text>
//       <Button title="Call OpenAI API" onPress={callOpenAI} />
//       {loading && <ActivityIndicator style={{ marginTop: 20 }} />}
//       {response && (
//         <View style={styles.responseBox}>
//           <Text style={styles.responseText}>{response}</Text>
//         </View>
//       )}
//       {error && <Text style={styles.errorText}>Error: {error}</Text>}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     padding: 24,
//     backgroundColor: '#fff',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     marginBottom: 24,
//   },
//   responseBox: {
//     marginTop: 24,
//     backgroundColor: '#f4f4f4',
//     padding: 12,
//     borderRadius: 8,
//     maxHeight: 300,
//     width: '100%',
//   },
//   responseText: {
//     fontSize: 12,
//     color: '#333',
//   },
//   errorText: {
//     marginTop: 24,
//     color: 'red',
//     fontWeight: 'bold',
//   },
// });
