import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  Modal,
  SafeAreaView,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { contacts as initialContacts } from '../data/contacts';
import { dummyUsers } from '../data/users';

const HomeScreen = ({ navigation }) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [groups, setGroups] = useState([]);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [createGroupModalVisible, setCreateGroupModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [editedName, setEditedName] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState('');
  const [actionModalVisible, setActionModalVisible] = useState(false);
  const [actionTarget, setActionTarget] = useState(null);

  const getColorForName = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = ['#FFB6C1', '#87CEEB', '#98FB98', '#FFD700', '#FFA07A', '#BA55D3'];
    return colors[hash % colors.length];
  };

  const handleLongPress = (item, isGroup) => {
    setActionTarget({ ...item, isGroup });
    setActionModalVisible(true);
  };

  const handleDelete = async (id, isGroup) => {
    if (isGroup) {
      const updatedGroups = groups.filter((g) => g.id !== id);
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    } else {
      const updatedContacts = contacts.filter((c) => c.id !== id);
      setContacts(updatedContacts);
    }
  };

  const handleSaveEdit = async () => {
    if (!editedName.trim()) return;

    if (selectedItem?.isGroup) {
      const updatedGroups = groups.map((g) =>
        g.id === selectedItem.id ? { ...g, name: editedName } : g
      );
      await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
      setGroups(updatedGroups);
    } else {
      const updatedContacts = contacts.map((c) =>
        c.id === selectedItem.id ? { ...c, name: editedName } : c
      );
      setContacts(updatedContacts);
    }

    setEditModalVisible(false);
    setSelectedItem(null);
    setEditedName('');
  };

  const toggleUserSelect = (user) => {
    if (selectedUsers.some((u) => u.id === user.id)) {
      setSelectedUsers(selectedUsers.filter((u) => u.id !== user.id));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const handleCreateGroup = async () => {
  if (!groupName.trim() || selectedUsers.length === 0) return;

  const group = {
    id: Date.now().toString(),
    name: groupName,
    members: selectedUsers,
  };

  const updatedGroups = [...groups, group];
  await AsyncStorage.setItem('groups', JSON.stringify(updatedGroups));
  setGroups(updatedGroups);

  const introMessages = [
    {
      id: Date.now().toString() + '_sys',
      text: `Group "${group.name}" created.`,
      sender: 'system',
      timestamp: new Date().toISOString(),
    },
    ...selectedUsers.map((user) => ({
      id: Date.now().toString() + '_' + user.id,
      text: `Hi, it's ${user.name}!`,
      sender: user.name,
      timestamp: new Date().toISOString(),
    })),
  ];

  await AsyncStorage.setItem(`group-${group.id}`, JSON.stringify(introMessages));

  setCreateGroupModalVisible(false);
  setSelectedUsers([]);
  setGroupName('');
};


  const renderItem = ({ item }) => {
    const isGroup = item.members !== undefined;
    const bgColor = getColorForName(item.name);

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() =>
          navigation.navigate('Messages', {
            contactId: item.id,
            name: item.name,
            members: item.members,
          })
        }
        onLongPress={() => handleLongPress(item, isGroup)}
      >
        {isGroup ? (
          <Image source={require('../assets/images/group.png')} style={styles.groupAvatar} />
        ) : (
          <View style={[styles.avatarCircle, { backgroundColor: bgColor }]}>
            <Text style={styles.avatarText}>{item.name.charAt(0).toUpperCase()}</Text>
          </View>
        )}
        <Text style={styles.name}>{item.name}</Text>
      </TouchableOpacity>
    );
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedGroups = await AsyncStorage.getItem('groups');
        if (storedGroups) {
          setGroups(JSON.parse(storedGroups));
        } else {
          const familyMembers = dummyUsers.slice(0, 4);
          const familyGroup = {
            id: 'g1',
            name: 'Family',
            members: familyMembers,
          };
          setGroups([familyGroup]);
          await AsyncStorage.setItem('groups', JSON.stringify([familyGroup]));

          const groupMessages = familyMembers.map((m) => ({
            id: Date.now().toString() + m.id,
            text: `Hi, it's ${m.name}!`,
            sender: m.name,
          }));
          await AsyncStorage.setItem(`group-${familyGroup.id}`, JSON.stringify(groupMessages));
        }

        for (let contact of initialContacts) {
          const key = `chat-${contact.id}`;
          const existing = await AsyncStorage.getItem(key);
          if (!existing) {
            const introMessage = [{
              id: Date.now().toString(),
              text: `Hi, it's ${contact.name}!`,
              sender: contact.name,
            }];
            await AsyncStorage.setItem(key, JSON.stringify(introMessage));
          }
        }
      } catch (err) {
        console.error('Failed to load or initialize data:', err);
      }
    };

    loadInitialData();
  }, []);

  const ActionModal = () => {
    if (!actionTarget) return null;

    return (
      <Modal visible={actionModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{actionTarget.name}</Text>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                setEditedName(actionTarget.name);
                setSelectedItem(actionTarget);
                setEditModalVisible(true);
                setActionModalVisible(false);
              }}
            >
              <Text>Edit Name</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => {
                Alert.alert(
                  'Confirm Delete',
                  `Delete "${actionTarget.name}"?`,
                  [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete',
                      style: 'destructive',
                      onPress: () => {
                        handleDelete(actionTarget.id, actionTarget.isGroup);
                        setActionModalVisible(false);
                      },
                    },
                  ]
                );
              }}
            >
              <Text style={{ color: 'red' }}>Delete</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setActionModalVisible(false)}
            >
              <Text style={{ color: 'gray' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <SafeAreaView style={styles.safeContainer}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Messages</Text>
        <TouchableOpacity onPress={() => setCreateGroupModalVisible(true)}>
          <Ionicons name="add-circle-outline" size={28} color="blue" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={[...groups, ...contacts]}
        keyExtractor={(item, index) => `${item?.id ?? 'key'}-${index}`}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 16 }}
      />

      <ActionModal />

      <Modal visible={editModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Name</Text>
            <TextInput
              placeholder="Enter new name"
              value={editedName}
              onChangeText={setEditedName}
              style={{
                borderWidth: 1,
                borderColor: '#ccc',
                borderRadius: 8,
                padding: 10,
                marginBottom: 16,
              }}
            />
            <TouchableOpacity
              style={[styles.modalButton, { backgroundColor: 'blue' }]}
              onPress={handleSaveEdit}
            >
              <Text style={{ color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={{ marginTop: 12 }}>
              <Text style={{ textAlign: 'center', color: 'gray' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <Modal visible={createGroupModalVisible} animationType="slide" transparent>
  <KeyboardAvoidingView
    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    style={styles.modalOverlay}
  >
    <View style={[styles.modalContent, { maxHeight: '85%' }]}>
      <Text style={styles.modalTitle}>Create Group</Text>

      <TextInput
        placeholder="Enter group name"
        value={groupName}
        onChangeText={setGroupName}
        style={styles.input}
      />

      <ScrollView style={{ marginVertical: 10 }}>
        {dummyUsers.map((user) => {
          const isSelected = selectedUsers.some((u) => u.id === user.id);
          return (
            <TouchableOpacity
              key={user.id}
              onPress={() => toggleUserSelect(user)}
              style={styles.userRow}
            >
              <Ionicons
                name={isSelected ? 'checkbox' : 'square-outline'}
                size={22}
                color={isSelected ? 'blue' : 'gray'}
                style={{ marginRight: 12 }}
              />
              <Text>{user.name}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <TouchableOpacity style={styles.createButton} onPress={handleCreateGroup}>
        <Text style={styles.createButtonText}>Create</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setCreateGroupModalVisible(false)} style={{ marginTop: 10 }}>
        <Text style={{ color: 'gray', textAlign: 'center' }}>Cancel</Text>
      </TouchableOpacity>
    </View>
  </KeyboardAvoidingView>
</Modal>

    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  safeContainer: { flex: 1, backgroundColor: '#fff' },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 16,
    alignItems: 'center',
  },
  title: { fontSize: 24, fontWeight: 'bold' },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  name: { fontSize: 18, fontWeight: '600' },
  groupAvatar: {
    width: 48,
    height: 48,
    marginRight: 12,
    borderRadius: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalButton: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: '#ddd',
  },
  input: {
  borderWidth: 1,
  borderColor: '#ccc',
  borderRadius: 10,
  padding: 10,
  fontSize: 16,
  backgroundColor: '#f9f9f9',
},

userRow: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 10,
  borderBottomWidth: 1,
  borderColor: '#eee',
},

createButton: {
  backgroundColor: 'blue',
  paddingVertical: 12,
  borderRadius: 10,
  alignItems: 'center',
  marginTop: 10,
},

createButtonText: {
  color: '#fff',
  fontWeight: 'bold',
  fontSize: 16,
},

});
