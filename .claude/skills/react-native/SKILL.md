---
name: react-native
description: 
---

---
name: react-native
description: Expert React Native development with cross-platform patterns, native modules, and performance optimization
---

# React Native Specialist

You are an expert React Native developer. Apply these principles when building mobile applications.

## Core Philosophy

- **Learn once, write anywhere** — Understand platform differences
- **Native feel** — Platform-appropriate UX, not web on mobile
- **Performance first** — 60fps is the minimum
- **Offline capable** — Mobile networks are unreliable

## Project Setup

### Recommended Stack
```bash
# Expo (recommended for most projects)
npx create-expo-app MyApp
cd MyApp
npx expo start

# Bare React Native (when you need native modules)
npx react-native init MyApp
```

### Project Structure
```
src/
├── components/          # Shared UI components
│   ├── Button/
│   │   ├── Button.tsx
│   │   └── Button.styles.ts
├── screens/             # Screen components
├── navigation/          # React Navigation setup
├── hooks/               # Custom hooks
├── services/            # API, storage, etc.
├── store/               # State management
├── utils/               # Pure utilities
├── types/               # TypeScript types
└── constants/           # Theme, config
```

## Styling Patterns

### StyleSheet (Preferred)
```tsx
import { StyleSheet, View, Text } from 'react-native'

function Card({ title, children }) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4, // Android shadow
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
})
```

### Platform-Specific Styles
```tsx
import { Platform, StyleSheet } from 'react-native'

const styles = StyleSheet.create({
  container: {
    paddingTop: Platform.select({
      ios: 44,
      android: 24,
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 4,
      },
    }),
  },
})
```

### Theme System
```tsx
// theme.ts
export const theme = {
  colors: {
    primary: '#007AFF',
    background: '#F2F2F7',
    card: '#FFFFFF',
    text: '#000000',
    textSecondary: '#8E8E93',
    border: '#E5E5EA',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
  },
  typography: {
    title: { fontSize: 28, fontWeight: '700' },
    heading: { fontSize: 22, fontWeight: '600' },
    body: { fontSize: 17 },
    caption: { fontSize: 13 },
  },
}

// Usage with hook
const { colors, spacing } = useTheme()
```

## Navigation

### React Navigation Setup
```tsx
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

function MainTabs() {
  return (
    <Tab.Navigator>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
        <Stack.Screen name="Details" component={DetailsScreen} />
        <Stack.Screen name="Modal" component={ModalScreen} options={{ presentation: 'modal' }} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}
```

### Type-Safe Navigation
```tsx
// types.ts
export type RootStackParamList = {
  Main: undefined
  Details: { id: string }
  Modal: { title: string }
}

// Usage
import { NativeStackScreenProps } from '@react-navigation/native-stack'

type DetailsProps = NativeStackScreenProps<RootStackParamList, 'Details'>

function DetailsScreen({ route, navigation }: DetailsProps) {
  const { id } = route.params
  
  return (
    <Button onPress={() => navigation.navigate('Modal', { title: 'Hello' })}>
      Open Modal
    </Button>
  )
}
```

## Performance Optimization

### FlatList Best Practices
```tsx
<FlatList
  data={items}
  keyExtractor={item => item.id}
  renderItem={({ item }) => <ListItem item={item} />}
  
  // Performance optimizations
  removeClippedSubviews={true}
  maxToRenderPerBatch={10}
  windowSize={5}
  initialNumToRender={10}
  
  // Memoized item component
  getItemLayout={(data, index) => ({
    length: ITEM_HEIGHT,
    offset: ITEM_HEIGHT * index,
    index,
  })}
/>

// Memoize list items
const ListItem = memo(({ item }) => (
  <View style={styles.item}>
    <Text>{item.name}</Text>
  </View>
))
```

### Image Optimization
```tsx
import FastImage from 'react-native-fast-image'

<FastImage
  source={{ uri: imageUrl, priority: FastImage.priority.normal }}
  style={styles.image}
  resizeMode={FastImage.resizeMode.cover}
/>

// Use appropriate image sizes
const imageUrl = `${baseUrl}?w=${width * PixelRatio.get()}`
```

### Avoid Re-renders
```tsx
// ✅ Use useCallback for event handlers
const handlePress = useCallback(() => {
  doSomething(id)
}, [id])

// ✅ Use useMemo for expensive computations
const sortedItems = useMemo(() => 
  items.sort((a, b) => a.name.localeCompare(b.name)),
  [items]
)

// ✅ Memoize components
const ExpensiveChild = memo(({ data }) => {
  // Complex rendering
})
```

## Animations

### Reanimated (Recommended)
```tsx
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring,
  withTiming 
} from 'react-native-reanimated'

function AnimatedButton() {
  const scale = useSharedValue(1)
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }))
  
  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }
  
  const handlePressOut = () => {
    scale.value = withSpring(1)
  }
  
  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut}>
      <Animated.View style={[styles.button, animatedStyle]}>
        <Text>Press Me</Text>
      </Animated.View>
    </Pressable>
  )
}
```

### Gesture Handler
```tsx
import { GestureDetector, Gesture } from 'react-native-gesture-handler'
import Animated, { useSharedValue, useAnimatedStyle, withSpring } from 'react-native-reanimated'

function SwipeableCard() {
  const translateX = useSharedValue(0)
  
  const pan = Gesture.Pan()
    .onUpdate(e => {
      translateX.value = e.translationX
    })
    .onEnd(() => {
      translateX.value = withSpring(0)
    })
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }))
  
  return (
    <GestureDetector gesture={pan}>
      <Animated.View style={[styles.card, animatedStyle]}>
        <Text>Swipe me</Text>
      </Animated.View>
    </GestureDetector>
  )
}
```

## Data & State

### API Calls with TanStack Query
```tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

function useUser(userId) {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

function useUpdateUser() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateUser,
    onSuccess: (data) => {
      queryClient.invalidateQueries(['user', data.id])
    },
  })
}
```

### Offline Storage
```tsx
import AsyncStorage from '@react-native-async-storage/async-storage'

// Simple key-value
await AsyncStorage.setItem('user', JSON.stringify(user))
const user = JSON.parse(await AsyncStorage.getItem('user'))

// MMKV for better performance
import { MMKV } from 'react-native-mmkv'
const storage = new MMKV()

storage.set('user.token', token)
const token = storage.getString('user.token')
```

## Platform-Specific Code

### Platform Files
```
Button/
├── Button.tsx           # Shared logic
├── Button.ios.tsx       # iOS-specific
├── Button.android.tsx   # Android-specific
```

### Conditional Rendering
```tsx
import { Platform } from 'react-native'

{Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}

// Platform-specific components
const BackButton = Platform.select({
  ios: () => <ChevronLeft />,
  android: () => <ArrowLeft />,
})()
```

## Anti-Patterns to Avoid

### ❌ Web Patterns on Mobile
```tsx
// Bad: hover states don't work on mobile
<TouchableOpacity style={{ ':hover': { opacity: 0.8 } }} />

// Good: Use pressable states
<Pressable style={({ pressed }) => [
  styles.button,
  pressed && styles.buttonPressed
]} />
```

### ❌ Inline Styles
```tsx
// Bad: Creates new object every render
<View style={{ marginTop: 10 }} />

// Good: Use StyleSheet
<View style={styles.container} />
```

### ❌ Large Bundle Imports
```tsx
// Bad: Imports entire library
import moment from 'moment'

// Good: Use tree-shakeable alternative
import { format } from 'date-fns'
```

## Testing

```tsx
import { render, screen, fireEvent } from '@testing-library/react-native'

test('submits form correctly', async () => {
  const onSubmit = jest.fn()
  render(<LoginForm onSubmit={onSubmit} />)
  
  fireEvent.changeText(screen.getByPlaceholderText('Email'), 'test@example.com')
  fireEvent.changeText(screen.getByPlaceholderText('Password'), 'password123')
  fireEvent.press(screen.getByText('Login'))
  
  expect(onSubmit).toHaveBeenCalledWith({
    email: 'test@example.com',
    password: 'password123',
  })
})
```
