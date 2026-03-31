# React Examples: What TO Do

## Component Composition

### ✅ Small, Focused Components
```jsx
// Each component has ONE job
function UserAvatar({ src, name, size = 'md' }) {
  const sizes = { sm: 32, md: 48, lg: 64 };
  return (
    <img 
      src={src} 
      alt={name}
      width={sizes[size]}
      height={sizes[size]}
      className="rounded-full object-cover"
    />
  );
}

function UserInfo({ name, role }) {
  return (
    <div>
      <p className="font-semibold text-gray-900">{name}</p>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  );
}

function UserCard({ user }) {
  return (
    <div className="flex items-center gap-3 p-4 bg-white rounded-lg shadow-sm">
      <UserAvatar src={user.avatar} name={user.name} />
      <UserInfo name={user.name} role={user.role} />
    </div>
  );
}
```

### ✅ Custom Hooks for Logic Reuse
```jsx
// Encapsulate complex logic in hooks
function useLocalStorage(key, initialValue) {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : initialValue;
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

function useDebounce(value, delay = 300) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

// Usage
function SearchInput() {
  const [query, setQuery] = useLocalStorage('search', '');
  const debouncedQuery = useDebounce(query, 300);
  
  // Search with debouncedQuery...
}
```

### ✅ Proper Loading & Error States
```jsx
function UserProfile({ userId }) {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetchUser(userId),
  });

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-12 w-12 bg-gray-200 rounded-full" />
        <div className="h-4 w-32 bg-gray-200 rounded mt-2" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-600 p-4 bg-red-50 rounded-lg">
        <p className="font-medium">Failed to load profile</p>
        <p className="text-sm">{error.message}</p>
        <button 
          onClick={() => refetch()}
          className="mt-2 text-sm underline"
        >
          Try again
        </button>
      </div>
    );
  }

  return <ProfileCard user={user} />;
}
```

### ✅ Proper Event Handler Memoization
```jsx
function TodoList({ todos, onToggle, onDelete }) {
  // Memoize handlers that depend on props
  const handleToggle = useCallback((id) => {
    onToggle(id);
  }, [onToggle]);

  const handleDelete = useCallback((id) => {
    onDelete(id);
  }, [onDelete]);

  return (
    <ul>
      {todos.map(todo => (
        <TodoItem 
          key={todo.id}
          todo={todo}
          onToggle={handleToggle}
          onDelete={handleDelete}
        />
      ))}
    </ul>
  );
}

// Memoized child prevents re-renders
const TodoItem = memo(({ todo, onToggle, onDelete }) => (
  <li className="flex items-center gap-2">
    <input 
      type="checkbox"
      checked={todo.completed}
      onChange={() => onToggle(todo.id)}
    />
    <span>{todo.title}</span>
    <button onClick={() => onDelete(todo.id)}>Delete</button>
  </li>
));
```

### ✅ Controlled Form with Validation
```jsx
function ContactForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.includes('@')) newErrors.email = 'Valid email required';
    if (formData.message.length < 10) newErrors.message = 'Message too short';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validate();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '', message: '' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? 'name-error' : undefined}
        />
        {errors.name && <p id="name-error" className="text-red-500">{errors.name}</p>}
      </div>
      
      {/* Similar fields for email and message */}
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Sending...' : 'Send'}
      </button>
    </form>
  );
}
```

### ✅ Context for Truly Global State
```jsx
// Theme context - rarely changes, many consumers
const ThemeContext = createContext();

function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => 
    localStorage.getItem('theme') || 'light'
  );

  const toggle = useCallback(() => {
    setTheme(t => {
      const next = t === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', next);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ theme, toggle }), [theme, toggle]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be within ThemeProvider');
  return context;
}
```

### ✅ Proper TypeScript Component
```tsx
interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: ReactNode;
  children: ReactNode;
  onClick?: () => void;
}

function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  children,
  onClick,
}: ButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={cn(
        'inline-flex items-center justify-center rounded-md font-medium transition-colors',
        variants[variant],
        sizes[size],
        isLoading && 'opacity-50 cursor-not-allowed'
      )}
    >
      {isLoading ? (
        <Spinner className="mr-2" />
      ) : leftIcon ? (
        <span className="mr-2">{leftIcon}</span>
      ) : null}
      {children}
    </button>
  );
}
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /react and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /react on a specific area, list constraints, and include tests or verification checks.
```
