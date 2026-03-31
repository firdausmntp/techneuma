# React Anti-Patterns: What NOT To Do

## Component Anti-Patterns

### ❌ God Components
```jsx
// BAD: One massive component doing everything
function Dashboard() {
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [filterBy, setFilterBy] = useState('all');
  // ... 50 more state variables

  useEffect(() => {
    // Fetching all data in one giant useEffect
    Promise.all([
      fetchUsers(),
      fetchProducts(),
      fetchOrders(),
      fetchAnalytics(),
      fetchNotifications(),
      fetchSettings(),
    ]).then(([u, p, o, a, n, s]) => {
      setUsers(u);
      setProducts(p);
      setOrders(o);
      setAnalytics(a);
      setNotifications(n);
      setSettings(s);
      setIsLoading(false);
    });
  }, []);

  // ... 500 lines of rendering logic
  return (
    <div>
      {/* Massive JSX tree */}
    </div>
  );
}
```

**Why it's bad:**
- Impossible to test individual parts
- Hard to understand and maintain
- Can't reuse any logic
- Single change triggers full re-render

---

### ❌ Props Drilling Hell
```jsx
// BAD: Passing props through 5+ levels
function App() {
  const [user, setUser] = useState(null);
  return <Layout user={user} setUser={setUser} />;
}

function Layout({ user, setUser }) {
  return <Main user={user} setUser={setUser} />;
}

function Main({ user, setUser }) {
  return <Sidebar user={user} setUser={setUser} />;
}

function Sidebar({ user, setUser }) {
  return <UserMenu user={user} setUser={setUser} />;
}

function UserMenu({ user, setUser }) {
  // Finally using the props!
  return <button onClick={() => setUser(null)}>Logout</button>;
}
```

**Why it's bad:**
- Makes refactoring painful
- Intermediate components don't need these props
- Hard to trace data flow

**Fix:** Use Context or state management library

---

### ❌ Unnecessary useEffect for Derived State
```jsx
// BAD: useEffect to compute derived state
function ProductList({ products }) {
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  // DON'T DO THIS!
  useEffect(() => {
    const filtered = products.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [products, searchQuery]);

  // DON'T DO THIS EITHER!
  useEffect(() => {
    const total = filteredProducts.reduce((sum, p) => sum + p.price, 0);
    setTotalPrice(total);
  }, [filteredProducts]);

  return (
    <div>
      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <p>Total: ${totalPrice}</p>
      {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}

// GOOD: Compute during render
function ProductList({ products }) {
  const [searchQuery, setSearchQuery] = useState('');

  // Derived state - computed during render
  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const totalPrice = filteredProducts.reduce((sum, p) => sum + p.price, 0);

  return (
    <div>
      <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
      <p>Total: ${totalPrice}</p>
      {filteredProducts.map(p => <ProductCard key={p.id} product={p} />)}
    </div>
  );
}
```

**Why it's bad:**
- Causes unnecessary re-renders (state change → effect → state change)
- More complex than needed
- Harder to reason about

---

### ❌ Creating Objects/Arrays in JSX
```jsx
// BAD: New object created every render
function MyComponent() {
  return (
    <ChildComponent 
      style={{ marginTop: 10, padding: 20 }}  // ❌ New object every render!
      options={['a', 'b', 'c']}               // ❌ New array every render!
      config={{ timeout: 5000 }}               // ❌ New object every render!
    />
  );
}

// GOOD: Define outside or memoize
const style = { marginTop: 10, padding: 20 };
const options = ['a', 'b', 'c'];

function MyComponent() {
  const config = useMemo(() => ({ timeout: 5000 }), []);
  
  return (
    <ChildComponent 
      style={style}
      options={options}
      config={config}
    />
  );
}
```

**Why it's bad:**
- If ChildComponent uses memo(), it won't work
- Creates garbage for GC every render
- Can cause cascading re-renders

---

### ❌ Using Index as Key for Dynamic Lists
```jsx
// BAD: Index as key
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map((todo, index) => (
        <li key={index}>  {/* ❌ Index changes when list reorders! */}
          <input type="checkbox" checked={todo.completed} />
          {todo.title}
        </li>
      ))}
    </ul>
  );
}

// GOOD: Stable unique identifier
function TodoList({ todos }) {
  return (
    <ul>
      {todos.map(todo => (
        <li key={todo.id}>  {/* ✅ Stable ID */}
          <input type="checkbox" checked={todo.completed} />
          {todo.title}
        </li>
      ))}
    </ul>
  );
}
```

**Why it's bad:**
- When list changes, React reuses wrong DOM elements
- Input state gets mixed up between items
- Performance issues with re-ordering

---

### ❌ Mutating State Directly
```jsx
// BAD: Direct mutation
function ShoppingCart() {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    items.push(item);  // ❌ Mutating state!
    setItems(items);   // React won't see the change!
  };

  const updateQuantity = (id, quantity) => {
    const item = items.find(i => i.id === id);
    item.quantity = quantity;  // ❌ Mutating nested object!
    setItems([...items]);      // Spread doesn't help nested mutation
  };
}

// GOOD: Create new references
function ShoppingCart() {
  const [items, setItems] = useState([]);

  const addItem = (item) => {
    setItems(prev => [...prev, item]);  // ✅ New array
  };

  const updateQuantity = (id, quantity) => {
    setItems(prev => prev.map(item => 
      item.id === id 
        ? { ...item, quantity }  // ✅ New object
        : item
    ));
  };
}
```

**Why it's bad:**
- React uses reference equality to detect changes
- Mutations won't trigger re-renders
- Can cause stale data bugs

---

### ❌ Async Operations in useEffect Without Cleanup
```jsx
// BAD: No cleanup, potential memory leak
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(userId).then(data => {
      setUser(data);  // ❌ May set state on unmounted component!
    });
  }, [userId]);
}

// GOOD: With cleanup
function UserProfile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let cancelled = false;
    
    fetchUser(userId).then(data => {
      if (!cancelled) {
        setUser(data);
      }
    });

    return () => {
      cancelled = true;  // ✅ Prevent state update after unmount
    };
  }, [userId]);
}

// BETTER: Use a data fetching library
function UserProfile({ userId }) {
  const { data: user } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });
}
```

---

### ❌ Excessive Re-renders from Context
```jsx
// BAD: Entire app re-renders on any state change
const AppContext = createContext();

function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [theme, setTheme] = useState('light');
  const [notifications, setNotifications] = useState([]);
  const [cart, setCart] = useState([]);
  // Every state change re-renders ALL consumers!

  return (
    <AppContext.Provider value={{ 
      user, setUser, 
      theme, setTheme,
      notifications, setNotifications,
      cart, setCart 
    }}>
      {children}
    </AppContext.Provider>
  );
}

// GOOD: Split into separate contexts
const UserContext = createContext();
const ThemeContext = createContext();
const CartContext = createContext();

function Providers({ children }) {
  return (
    <UserProvider>
      <ThemeProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </ThemeProvider>
    </UserProvider>
  );
}
```

---

### ❌ useEffect for Event Handling
```jsx
// BAD: Using useEffect to handle button clicks
function Counter() {
  const [count, setCount] = useState(0);
  const [shouldIncrement, setShouldIncrement] = useState(false);

  useEffect(() => {
    if (shouldIncrement) {
      setCount(c => c + 1);
      setShouldIncrement(false);
    }
  }, [shouldIncrement]);

  return (
    <button onClick={() => setShouldIncrement(true)}>
      Count: {count}
    </button>
  );
}

// GOOD: Handle directly in event handler
function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      Count: {count}
    </button>
  );
}
```

**Why it's bad:**
- Unnecessary indirection
- Extra render cycle
- Harder to trace what's happening
