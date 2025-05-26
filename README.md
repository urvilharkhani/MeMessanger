# 💬 React Native Messenger App

A full-featured React Native chat app with support for group and individual messages, emoji input, image attachments, editable messages, and persistent storage — all styled like WhatsApp.

---

## 🚀 Getting Started

### ✅ Requirements

- Node.js  
- React Native CLI  
- Android Studio or Xcode  
- Android SDK (API Level 33 or above)

---

## 📦 Install Dependencies

Install all required dependencies using:

```bash
npm install
```

### Required Packages

- `@react-native-async-storage/async-storage` – local storage
- `@react-navigation/native`
- `@react-navigation/native-stack`
- `react-native-vector-icons`
- `react-native-gesture-handler`
- `react-native-safe-area-context`
- `react-native-screens`
- `react-native-reanimated`
- `react-native-image-picker`
- `react-native-emoji-selector`

---

### 🛠 Helpful Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)  
- [React Navigation Setup](https://reactnavigation.org/docs/getting-started)  
- [AsyncStorage on Medium](https://medium.com/tag/react-native)

---

## ▶️ Running the App

### For Android

```bash
npx react-native run-android
```

### For iOS

```bash
npx react-native run-ios
```

Ensure you have an emulator or physical device connected.

---

## 🧠 Project Structure

```plaintext
src/
│
├── assets/
│   └── images/
│       └── group.png
│
├── data/
│   ├── contacts.js         # Default contact data
│   └── users.js            # Dummy users used in groups
│
├── screens/
│   ├── HomeScreen.js       # Main screen with contact and group list
│   └── MessageScreen.js    # Chat UI and logic for individual or group
│
├── AppNavigator.js         # Stack navigator config

App.js                      # Root of the app
package.json
README.md
```

---

## ✨ Features

- 👥 View and chat with contacts and groups  
- ➕ Create new group chats with dummy users  
- 📝 Long-press to rename or delete any contact or group  
- 🖼 Attach and send images from gallery  
- 🧽 Edit your own message (within 30 min)  
- 😄 Add emojis with emoji selector  
- ℹ️ View group info like name, members, and description  
- 💾 Persist all messages using AsyncStorage  
- 🟢 Show system messages like "Group Created" (styled like WhatsApp)

---

## 💡 UX & Design Notes

- Uses `SafeAreaView` to handle iOS notches  
- `KeyboardAvoidingView` adjusts input bar for both platforms  
- WhatsApp-style message bubbles with timestamps  
- Custom modals for creating groups or editing names  
- Attached images display inline in chat  
- Centered system messages styled in WhatsApp green

---

## 🧪 Testing Tips

- Test message editing (only works for 30 minutes after sending)  
- Test image attachment from your gallery  
- Try creating and deleting multiple groups  
- Long press on a chat to rename or delete it  
- View member info in a group using the info icon (ℹ️)

---
## 🙌 Developer

**Name:** Urvil Harkhani
**Student ID:** 1271198
**Course:** COMP5450 Mobile Programming  
**Instructor:** Dr. Sabah Mohammed

## 🙌 Credits

Built using React Native for learners looking to build chat UIs with clean design and offline storage. No backend, just local data and love.
