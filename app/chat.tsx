// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   ActivityIndicator,
//   KeyboardAvoidingView,
//   Platform,
// } from 'react-native';
// import { OPENAI_API_KEY } from '@env';

// import * as ENV from '@env';
// console.log(ENV);

// export default function ChatPage() {
//   const [input, setInput] = useState('');
//   const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
//   const [loading, setLoading] = useState(false);

//   const handleSend = async () => {
//     if (!input.trim()) return;

//     const newMessages = [...messages, { role: 'user', content: input }];
//     setMessages(newMessages);
//     setInput('');
//     setLoading(true);

//     try {
//       const response = await fetch('https://api.openai.com/v1/chat/completions', {
//         method: 'POST',
//         headers: {
//           Authorization: `Bearer ${OPENAI_API_KEY}`,
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({
//           model: 'gpt-4',
//           messages: newMessages,
//         }),
//       });

//       const data = await response.json();
//       const reply = data.choices?.[0]?.message?.content?.trim();

//       if (reply) {
//         setMessages([...newMessages, { role: 'assistant', content: reply }]);
//       } else {
//         setMessages([...newMessages, { role: 'assistant', content: 'No response received.' }]);
//       }
//     } catch (err) {
//       console.error(err);
//       setMessages([...newMessages, { role: 'assistant', content: 'Error contacting OpenAI.' }]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <KeyboardAvoidingView
//       style={styles.container}
//       behavior={Platform.OS === 'ios' ? 'padding' : undefined}
//     >
//       <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 16 }}>
//         {messages.map((msg, index) => (
//           <View
//             key={index}
//             style={[
//               styles.messageBubble,
//               msg.role === 'user' ? styles.userBubble : styles.assistantBubble,
//             ]}
//           >
//             <Text style={styles.messageText}>{msg.content}</Text>
//           </View>
//         ))}
//         {loading && (
//           <ActivityIndicator size="small" style={{ marginTop: 12 }} />
//         )}
//       </ScrollView>

//       <View style={styles.inputBar}>
//         <TextInput
//           style={styles.input}
//           placeholder="Type your message..."
//           value={input}
//           onChangeText={setInput}
//           onSubmitEditing={handleSend}
//         />
//         <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
//           <Text style={styles.sendText}>Send</Text>
//         </TouchableOpacity>
//       </View>
//     </KeyboardAvoidingView>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1, backgroundColor: '#fff' },
//   chatArea: { flex: 1, padding: 16 },
//   messageBubble: {
//     padding: 10,
//     borderRadius: 10,
//     marginVertical: 4,
//     maxWidth: '80%',
//   },
//   userBubble: {
//     backgroundColor: '#DCF8C6',
//     alignSelf: 'flex-end',
//   },
//   assistantBubble: {
//     backgroundColor: '#F1F0F0',
//     alignSelf: 'flex-start',
//   },
//   messageText: {
//     fontSize: 16,
//     color: '#333',
//   },
//   inputBar: {
//     flexDirection: 'row',
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     borderTopWidth: 1,
//     borderColor: '#ddd',
//     backgroundColor: '#fff',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     fontSize: 16,
//     paddingVertical: 8,
//     paddingHorizontal: 12,
//     backgroundColor: '#f2f2f2',
//     borderRadius: 20,
//     marginRight: 8,
//   },
//   sendButton: {
//     backgroundColor: '#32535F',
//     paddingVertical: 10,
//     paddingHorizontal: 16,
//     borderRadius: 20,
//   },
//   sendText: {
//     color: 'white',
//     fontWeight: '600',
//     fontSize: 16,
//   },
// });
