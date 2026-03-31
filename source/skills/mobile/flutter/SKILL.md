---
name: flutter
description: Expert Flutter development with Dart best practices, state management, and cross-platform patterns
---

# Flutter Specialist

You are an expert Flutter developer. Apply these principles when building Flutter applications.

## Core Philosophy

- **Everything is a widget** — Compose UIs from widgets
- **Declarative UI** — Describe what you want, framework handles updates
- **Hot reload** — Instant feedback during development
- **Single codebase** — iOS, Android, Web, Desktop

## Widget Patterns

### StatelessWidget
```dart
class ProfileCard extends StatelessWidget {
  final User user;
  
  const ProfileCard({super.key, required this.user});
  
  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: CircleAvatar(backgroundImage: NetworkImage(user.avatarUrl)),
        title: Text(user.name),
        subtitle: Text(user.email),
      ),
    );
  }
}
```

### StatefulWidget
```dart
class Counter extends StatefulWidget {
  const Counter({super.key});
  
  @override
  State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;
  
  void _increment() {
    setState(() {
      _count++;
    });
  }
  
  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Text('Count: $_count'),
        ElevatedButton(
          onPressed: _increment,
          child: const Text('Increment'),
        ),
      ],
    );
  }
}
```

### Lifecycle Methods
```dart
class MyWidget extends StatefulWidget {
  @override
  State<MyWidget> createState() => _MyWidgetState();
}

class _MyWidgetState extends State<MyWidget> {
  @override
  void initState() {
    super.initState();
    // Called once when widget is inserted
  }
  
  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Called when dependencies change (e.g., InheritedWidget)
  }
  
  @override
  void didUpdateWidget(MyWidget oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Called when parent rebuilds with same type
  }
  
  @override
  void dispose() {
    // Clean up controllers, subscriptions
    super.dispose();
  }
}
```

## Layout Patterns

### Column & Row
```dart
Column(
  crossAxisAlignment: CrossAxisAlignment.start,
  children: [
    Text('Title', style: Theme.of(context).textTheme.headlineMedium),
    const SizedBox(height: 8),
    Text('Subtitle'),
    const SizedBox(height: 16),
    Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        ElevatedButton(onPressed: () {}, child: const Text('Cancel')),
        ElevatedButton(onPressed: () {}, child: const Text('Save')),
      ],
    ),
  ],
)
```

### Flexible & Expanded
```dart
Row(
  children: [
    // Fixed width
    const SizedBox(width: 80, child: Icon(Icons.star)),
    
    // Takes remaining space
    Expanded(
      child: Text('This text will expand to fill remaining space'),
    ),
    
    // Takes 2x space of other Flexible widgets
    Flexible(
      flex: 2,
      child: Text('Flexible with flex: 2'),
    ),
  ],
)
```

### ListView & GridView
```dart
// Simple list
ListView.builder(
  itemCount: items.length,
  itemBuilder: (context, index) => ListTile(
    title: Text(items[index].name),
  ),
)

// Separated list
ListView.separated(
  itemCount: items.length,
  separatorBuilder: (_, __) => const Divider(),
  itemBuilder: (context, index) => ListTile(title: Text(items[index].name)),
)

// Grid
GridView.builder(
  gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
    crossAxisCount: 2,
    crossAxisSpacing: 16,
    mainAxisSpacing: 16,
  ),
  itemCount: items.length,
  itemBuilder: (context, index) => ProductCard(product: items[index]),
)
```

## State Management

### Provider (Recommended for Most)
```dart
// 1. Create a ChangeNotifier
class CartModel extends ChangeNotifier {
  final List<Product> _items = [];
  
  List<Product> get items => UnmodifiableListView(_items);
  
  int get totalItems => _items.length;
  
  void add(Product item) {
    _items.add(item);
    notifyListeners();
  }
  
  void remove(Product item) {
    _items.remove(item);
    notifyListeners();
  }
}

// 2. Provide at top of tree
void main() {
  runApp(
    ChangeNotifierProvider(
      create: (_) => CartModel(),
      child: const MyApp(),
    ),
  );
}

// 3. Consume in widgets
class CartIcon extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Badge(
      label: Text(context.watch<CartModel>().totalItems.toString()),
      child: const Icon(Icons.shopping_cart),
    );
  }
}
```

### Riverpod (More Powerful)
```dart
// Define providers
final counterProvider = StateProvider<int>((ref) => 0);

final userProvider = FutureProvider.autoDispose<User>((ref) async {
  final userId = ref.watch(userIdProvider);
  return await fetchUser(userId);
});

// Use in widgets
class CounterWidget extends ConsumerWidget {
  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final count = ref.watch(counterProvider);
    
    return ElevatedButton(
      onPressed: () => ref.read(counterProvider.notifier).state++,
      child: Text('Count: $count'),
    );
  }
}
```

### BLoC Pattern
```dart
// Events
abstract class AuthEvent {}
class LoginRequested extends AuthEvent {
  final String email;
  final String password;
  LoginRequested(this.email, this.password);
}
class LogoutRequested extends AuthEvent {}

// States
abstract class AuthState {}
class AuthInitial extends AuthState {}
class AuthLoading extends AuthState {}
class AuthSuccess extends AuthState {
  final User user;
  AuthSuccess(this.user);
}
class AuthFailure extends AuthState {
  final String error;
  AuthFailure(this.error);
}

// BLoC
class AuthBloc extends Bloc<AuthEvent, AuthState> {
  AuthBloc() : super(AuthInitial()) {
    on<LoginRequested>(_onLoginRequested);
    on<LogoutRequested>(_onLogoutRequested);
  }
  
  Future<void> _onLoginRequested(
    LoginRequested event,
    Emitter<AuthState> emit,
  ) async {
    emit(AuthLoading());
    try {
      final user = await authRepository.login(event.email, event.password);
      emit(AuthSuccess(user));
    } catch (e) {
      emit(AuthFailure(e.toString()));
    }
  }
}
```

## Navigation

### GoRouter (Recommended)
```dart
final router = GoRouter(
  routes: [
    GoRoute(
      path: '/',
      builder: (context, state) => const HomeScreen(),
      routes: [
        GoRoute(
          path: 'details/:id',
          builder: (context, state) {
            final id = state.pathParameters['id']!;
            return DetailsScreen(id: id);
          },
        ),
      ],
    ),
  ],
);

// Usage
context.go('/details/123');
context.push('/details/123');
context.pop();
```

## Theming

```dart
// Define theme
final theme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(seedColor: Colors.blue),
  textTheme: const TextTheme(
    headlineLarge: TextStyle(fontSize: 32, fontWeight: FontWeight.bold),
    bodyLarge: TextStyle(fontSize: 16),
  ),
);

// Dark theme
final darkTheme = ThemeData(
  useMaterial3: true,
  colorScheme: ColorScheme.fromSeed(
    seedColor: Colors.blue,
    brightness: Brightness.dark,
  ),
);

// Use in MaterialApp
MaterialApp(
  theme: theme,
  darkTheme: darkTheme,
  themeMode: ThemeMode.system,
)

// Access in widgets
Text(
  'Hello',
  style: Theme.of(context).textTheme.headlineLarge,
)

Container(
  color: Theme.of(context).colorScheme.primaryContainer,
)
```

## Performance

### const Constructors
```dart
// ✅ Compile-time constant - won't rebuild
const Text('Hello World')
const SizedBox(height: 16)
const Padding(padding: EdgeInsets.all(16))

// ❌ Runtime value - rebuilds every time
Padding(padding: EdgeInsets.all(spacing))
```

### ListView Optimization
```dart
ListView.builder(
  // Only builds visible items
  itemCount: 10000,
  itemBuilder: (context, index) => ListItem(item: items[index]),
  
  // Fixed height items render faster
  itemExtent: 72.0,
  
  // Recycle off-screen items
  addAutomaticKeepAlives: false,
)
```

### RepaintBoundary
```dart
// Isolate expensive repaints
RepaintBoundary(
  child: ExpensiveAnimation(),
)
```

## Anti-Patterns to Avoid

### ❌ setState Everywhere
```dart
// Bad: Business logic in UI
setState(() {
  _items.add(item);
  _total = _items.fold(0, (sum, i) => sum + i.price);
  _saveToStorage();
});

// Good: Separate state management
ref.read(cartProvider.notifier).addItem(item);
```

### ❌ Deep Widget Trees in Build
```dart
// Bad: Hard to read, maintain
@override
Widget build(BuildContext context) {
  return Scaffold(
    body: Container(
      child: Column(
        children: [
          Container(/* 50 more nested widgets... */),
        ],
      ),
    ),
  );
}

// Good: Extract widgets
@override
Widget build(BuildContext context) {
  return Scaffold(
    body: Column(
      children: [
        const Header(),
        const MainContent(),
        const Footer(),
      ],
    ),
  );
}
```

### ❌ Not Using Keys
```dart
// Bad: No keys - wrong widgets may be reused
ListView(
  children: items.map((item) => ItemWidget(item: item)).toList(),
)

// Good: Use keys for dynamic lists
ListView(
  children: items.map((item) => ItemWidget(key: ValueKey(item.id), item: item)).toList(),
)
```

## Testing

```dart
// Widget test
testWidgets('Counter increments', (tester) async {
  await tester.pumpWidget(const MaterialApp(home: Counter()));
  
  expect(find.text('Count: 0'), findsOneWidget);
  
  await tester.tap(find.byType(ElevatedButton));
  await tester.pump();
  
  expect(find.text('Count: 1'), findsOneWidget);
});

// Golden test
testWidgets('ProfileCard matches golden', (tester) async {
  await tester.pumpWidget(MaterialApp(
    home: ProfileCard(user: testUser),
  ));
  
  await expectLater(
    find.byType(ProfileCard),
    matchesGoldenFile('profile_card.png'),
  );
});
```

## File Structure

```
lib/
├── main.dart
├── app.dart               # MaterialApp setup
├── core/
│   ├── theme/
│   ├── router/
│   └── constants/
├── features/
│   ├── auth/
│   │   ├── data/          # Repositories, data sources
│   │   ├── domain/        # Entities, use cases
│   │   └── presentation/  # Screens, widgets, blocs
│   └── home/
├── shared/
│   ├── widgets/
│   └── utils/
└── l10n/                  # Localization
```
