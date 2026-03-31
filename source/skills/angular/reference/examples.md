# Angular Examples - Good Patterns

## ✅ Good: Standalone Components
```typescript
// Modern Angular (v15+)
import { Component, signal, computed } from '@angular/core'
import { CommonModule } from '@angular/common'

@Component({
  selector: 'app-counter',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div>
      <p>Count: {{ count() }}</p>
      <p>Doubled: {{ doubled() }}</p>
      <button (click)="increment()">+1</button>
    </div>
  `
})
export class CounterComponent {
  count = signal(0)
  doubled = computed(() => this.count() * 2)
  
  increment() {
    this.count.update(n => n + 1)
  }
}
```

## ✅ Good: Reactive Forms
```typescript
import { Component } from '@angular/core'
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms'

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="email" />
      @if (form.controls.email.errors?.['email']) {
        <span class="error">Invalid email</span>
      }
      
      <input type="password" formControlName="password" />
      
      <button [disabled]="form.invalid || loading">
        {{ loading ? 'Submitting...' : 'Login' }}
      </button>
    </form>
  `
})
export class LoginComponent {
  loading = false
  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]]
  })
  
  constructor(private fb: FormBuilder) {}
  
  onSubmit() {
    if (this.form.valid) {
      this.loading = true
      // Submit logic
    }
  }
}
```

## ✅ Good: Services with Dependency Injection
```typescript
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { BehaviorSubject, map, tap } from 'rxjs'

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private _currentUser = new BehaviorSubject<User | null>(null)
  
  currentUser$ = this._currentUser.asObservable()
  isLoggedIn$ = this.currentUser$.pipe(map(u => !!u))
  
  login(credentials: Credentials) {
    return this.http.post<User>('/api/login', credentials).pipe(
      tap(user => this._currentUser.next(user))
    )
  }
  
  logout() {
    this._currentUser.next(null)
  }
}
```

## ✅ Good: Smart/Dumb Component Pattern
```typescript
// Smart (Container) Component
@Component({
  selector: 'app-user-list-container',
  standalone: true,
  imports: [UserListComponent, AsyncPipe],
  template: `
    <app-user-list 
      [users]="users$ | async" 
      [loading]="loading$ | async"
      (userSelected)="onUserSelected($event)"
    />
  `
})
export class UserListContainerComponent {
  private userService = inject(UserService)
  users$ = this.userService.getUsers()
  loading$ = this.userService.loading$
  
  onUserSelected(user: User) {
    this.router.navigate(['/users', user.id])
  }
}

// Dumb (Presentational) Component
@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (loading) {
      <spinner />
    } @else {
      @for (user of users; track user.id) {
        <div (click)="userSelected.emit(user)">
          {{ user.name }}
        </div>
      }
    }
  `
})
export class UserListComponent {
  @Input() users: User[] = []
  @Input() loading = false
  @Output() userSelected = new EventEmitter<User>()
}
```

## ✅ Good: NgRx Signal Store (Modern)
```typescript
import { signalStore, withState, withMethods, patchState } from '@ngrx/signals'

interface TodosState {
  todos: Todo[]
  loading: boolean
  filter: 'all' | 'active' | 'completed'
}

export const TodosStore = signalStore(
  withState<TodosState>({
    todos: [],
    loading: false,
    filter: 'all'
  }),
  withMethods((store) => ({
    addTodo(title: string) {
      patchState(store, {
        todos: [...store.todos(), { id: crypto.randomUUID(), title, completed: false }]
      })
    },
    toggleTodo(id: string) {
      patchState(store, {
        todos: store.todos().map(t => 
          t.id === id ? { ...t, completed: !t.completed } : t
        )
      })
    }
  }))
)
```

## ✅ Good: Route Guards
```typescript
import { inject } from '@angular/core'
import { Router, CanActivateFn } from '@angular/router'
import { AuthService } from './auth.service'
import { map, tap } from 'rxjs'

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService)
  const router = inject(Router)
  
  return auth.isAuthenticated$.pipe(
    tap(isAuth => {
      if (!isAuth) {
        router.navigate(['/login'])
      }
    })
  )
}

// Usage in routes
export const routes: Routes = [
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
]
```

## DON'T (Not Good)

### Bad Request Example

```text
Run /angular and make it better.
```

Why this is not good:
- Too vague, no clear scope or success criteria.
- Missing constraints, so the result may break expectations.
- No validation steps, so quality cannot be trusted.

### Better Alternative

```text
Run /angular on a specific area, list constraints, and include tests or verification checks.
```
