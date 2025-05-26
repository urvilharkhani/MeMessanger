import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Modal,
  Keyboard,
  Alert,
  Image,
} from 'react-native';

import { launchImageLibrary } from 'react-native-image-picker';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MessageScreen = ({ route }) => {
  const { contactId, name, members = null } = route.params;
  const [input, setInput] = useState('');
  const [messageList, setMessageList] = useState([]);
  const [infoVisible, setInfoVisible] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  const saveMessages = async (messages) => {
    const key = members ? `group-${contactId}` : `chat-${contactId}`;
    await AsyncStorage.setItem(key, JSON.stringify(messages));
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (editingMessageId) {
      const updated = messageList.map((msg) =>
        msg.id === editingMessageId ? { ...msg, text: input } : msg
      );
      setMessageList(updated);
      await saveMessages(updated);
      setEditingMessageId(null);
    } else {
      const newMessage = {
        id: Date.now().toString(),
        text: input,
        sender: 'me',
        timestamp: new Date().toISOString(),
      };
      const updated = [...messageList, newMessage];
      setMessageList(updated);
      await saveMessages(updated);
    }

    setInput('');
  };

const pickImage = async () => {
  launchImageLibrary({ mediaType: 'photo' }, async (response) => {
    if (!response.didCancel && !response.errorCode && response.assets?.length) {
      const imageAsset = response.assets[0];
      const newMessage = {
        id: Date.now().toString(),
        image: imageAsset.uri, // store the image URI
        sender: 'me',
        timestamp: new Date().toISOString(),
      };
      const updated = [...messageList, newMessage];
      setMessageList(updated);
      await saveMessages(updated);
    }
  });
};


 const renderItem = ({ item }) => {
  if (item.sender === 'system') {
    return (
      <View style={styles.systemMessageContainer}>
        <View style={styles.systemMessageBubble}>
          <Text style={styles.systemMessageText}>{item.text}</Text>
        </View>
      </View>
    );
  }

  const isMe = item.sender === 'me';
  const isEditable = isMe && item.timestamp && (Date.now() - new Date(item.timestamp).getTime() <= 1800000);

  const handleLongPress = () => {
    if (!isMe) return;

    const actions = [
      isEditable && {
        text: 'Edit',
        onPress: () => {
          setInput(item.text || '');
          setEditingMessageId(item.id);
        },
      },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          const updated = messageList.filter((msg) => msg.id !== item.id);
          setMessageList(updated);
          await saveMessages(updated);
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ].filter(Boolean);

    Alert.alert('Message Options', 'Choose an action:', actions);
  };

  return (
    <TouchableOpacity onLongPress={handleLongPress}>
      <View style={[styles.messageRow, isMe ? styles.messageRight : styles.messageLeft]}>
        <View style={[styles.messageBubble, isMe ? styles.myMessage : styles.theirMessage]}>
          {item.text && <Text style={styles.messageText}>{item.text}</Text>}
          {item.image && (
            <Image
              source={{ uri: item.image }}
              style={{ width: 180, height: 180, borderRadius: 10, marginTop: 6 }}
              resizeMode="cover"
            />
          )}
          {item.timestamp && (
            <Text style={styles.timestamp}>
              {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};



  useEffect(() => {
    const onShow = (e) => {
      const height = e?.endCoordinates?.height;
      setKeyboardHeight(height);
    };

    const onHide = () => {
      setKeyboardHeight(0);
    };

    const showSub = Keyboard.addListener('keyboardDidShow', onShow);
    const hideSub = Keyboard.addListener('keyboardDidHide', onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  useEffect(() => {
    const loadMessages = async () => {
      const key = members ? `group-${contactId}` : `chat-${contactId}`;
      const stored = await AsyncStorage.getItem(key);
      if (stored) {
        setMessageList(JSON.parse(stored));
      }
    };
    loadMessages();
  }, [contactId, members]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{name}</Text>
        {members && (
          <TouchableOpacity onPress={() => setInfoVisible(true)}>
            <Ionicons name="information-circle-outline" size={24} color="blue" />
          </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={messageList}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20, paddingHorizontal: 10 }}
      />

      {/* Input area with edit mode support */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'padding'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 110 : keyboardHeight ? keyboardHeight / 3.45 : 20}
        style={styles.inputContainer}
      >
        <TouchableOpacity onPress={pickImage}>
          <Ionicons name="attach-outline" size={24} color="gray" style={styles.icon} />
        </TouchableOpacity>

        <TextInput
          style={styles.textInput}
          placeholder={editingMessageId ? 'Edit your message' : 'Type a message'}
          value={input}
          onChangeText={setInput}
        />

        {editingMessageId && (
          <TouchableOpacity onPress={() => {
            setInput('');
            setEditingMessageId(null);
          }}>
            <Ionicons name="close-circle" size={24} color="red" style={styles.icon} />
          </TouchableOpacity>
        )}

        <TouchableOpacity onPress={handleSend}>
          <Ionicons name={editingMessageId ? 'checkmark' : 'send'} size={24} color="blue" style={styles.icon} />
        </TouchableOpacity>
      </KeyboardAvoidingView>

      {/* Group Info Modal */}
      <Modal visible={infoVisible} animationType="slide">
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Group Info</Text>
            <TouchableOpacity onPress={() => setInfoVisible(false)}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>
          <View style={{ paddingHorizontal: 10 }}>
            <Text style={styles.modalSubtitle}>Name: {name}</Text>
            <Text style={styles.modalSubtitle}>Description:</Text>
            <Text style={styles.description}>This is a family group created by default.</Text>
            <Text style={[styles.modalSubtitle, { marginTop: 20 }]}>Members:</Text>
            {members && members.map((member, index) => (
              <Text key={index} style={styles.memberItem}>
                {member.name}
              </Text>
            ))}
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
};

export default MessageScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#f9f9f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    paddingHorizontal: 10,
    color: '#333',
  },
  messageRow: {
    flexDirection: 'row',
    marginVertical: 4,
    paddingHorizontal: 10,
  },
  messageRight: {
    justifyContent: 'flex-end',
  },
  messageLeft: {
    justifyContent: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderBottomRightRadius: 4,
  },
  myMessage: {
    backgroundColor: '#dcf8c6',
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  theirMessage: {
    backgroundColor: '#fff',
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    borderWidth: 0.5,
    borderColor: '#ccc',
  },
  messageText: {
    fontSize: 16,
    color: '#222',
  },
  timestamp: {
    fontSize: 10,
    color: '#888',
    marginTop: 4,
    textAlign: 'right',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderTopWidth: 1,
    borderColor: '#ddd',
    marginBottom: 5,
  },
  textInput: {
    flex: 1,
    padding: 10,
    borderRadius: 20,
    backgroundColor: '#f1f1f1',
    marginHorizontal: 10,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  icon: {
    padding: 6,
  },
  modalContainer: {
    flex: 1,
    margin: 18,
    backgroundColor: '#fff',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  modalSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
    color: '#555',
  },
  description: {
    fontSize: 15,
    marginTop: 4,
    color: '#444',
  },
  memberItem: {
    fontSize: 16,
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#eee',
    color: '#333',
  },
  systemMessageContainer: {
    alignItems: 'center',
    marginVertical: 6,
  },
  systemMessageBubble: {
    backgroundColor: '#dcf8c6',
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
    maxWidth: '80%',
    alignSelf: 'center',
  },
  systemMessageText: {
    fontSize: 14,
    color: '#222',
    fontWeight: '500',
    textAlign: 'center',
  },
  systemMessageContainer: {
  alignItems: 'center',
  marginVertical: 6,
},
systemMessageBubble: {
  backgroundColor: '#dcf8c6',
  borderRadius: 16,
  paddingVertical: 6,
  paddingHorizontal: 12,
  alignSelf: 'center',
  maxWidth: '70%',
},
systemMessageText: {
  fontSize: 13,
  color: '#222',
  textAlign: 'center',
  fontWeight: '500',
},

});
