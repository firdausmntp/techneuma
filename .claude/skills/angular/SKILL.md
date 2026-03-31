---
name: angular
description: 
---

---
name: angular
description: Expert Angular development with components, services, RxJS, and enterprise patterns
---

# Angular Specialist

You are an expert Angular developer. Apply these principles for robust enterprise applications.

## Core Philosophy

- **Opinionated framework** — Convention over configuration
- **Dependency injection** — Loose coupling, testability
- **Reactive programming** — RxJS for async operations
- **TypeScript first** — Full type safety

## Components

### Basic Component
```typescript
import { Component, Input, Output, EventEmitter } from '@angular/core'

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="card" (click)="onClick()">
      <h2>{{ user.name }}</h2>
      <p>{{ user.email }}</p>
      <span class="badge" [class.active]="user.isActive">
        {{ user.isActive ? 'Active' : 'Inactive' }}
      </span>
    </div>
  `,
  styles: [`
    .card { padding: 1rem; border-radius: 8px; }
    .badge.active { background: green; }
  `]
})
export class UserCardComponent {
  @Input({ required: true }) user!: User
  @Output() selected = new EventEmitter<User>()
  
  onClick() {
    this.selected.emit(this.user)
  }
}
```

### Signals (Angular 16+)
```typescript
import { Component, signal, computed, effect } from '@angular/core'

@Component({
  selector: 'app-counter',
  standalone: true,
  template: `
    <p>Count: {{ count() }}</p>
    <p>Doubled: {{ doubled() }}</p>
    <button (click)="increment()">+</button>
    <button (click)="decrement()">-</button>
  `
})
export class CounterComponent {
  count = signal(0)
  doubled = computed(() => this.count() * 2)
  
  constructor() {
    effect(() => {
      console.log('Count changed to:', this.count())
    })
  }
  
  increment() { this.count.update(n => n + 1) }
  decrement() { this.count.update(n => n - 1) }
}
```

### Input/Output with Signals
```typescript
@Component({
  selector: 'app-child',
  standalone: true,
  template: `<p>{{ name() }}</p>`
})
export class ChildComponent {
  name = input.required<string>()
  age = input(0)  // With default
  
  nameChange = output<string>()
  
  updateName(newName: string) {
    this.nameChange.emit(newName)
  }
}
```

## Services & DI

### Service
```typescript
import { Injectable, inject } from '@angular/core'
import { HttpClient } from '@angular/common/http'
import { Observable, BehaviorSubject } from 'rxjs'
import { map, catchError } from 'rxjs/operators'

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient)
  private usersSubject = new BehaviorSubject<User[]>([])
  
  users$ = this.usersSubject.asObservable()
  
  getUsers(): Observable<User[]> {
    return this.http.get<User[]>('/api/users').pipe(
      map(users => {
        this.usersSubject.next(users)
        return users
      }),
      catchError(error => {
        console.error('Failed to fetch users', error)
        throw error
      })
    )
  }
  
  getUser(id: string): Observable<User> {
    return this.http.get<User>(`/api/users/${id}`)
  }
  
  createUser(user: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>('/api/users', user)
  }
}
```

### Injection
```typescript
@Component({ /* ... */ })
export class UserListComponent {
  // Modern: inject function
  private userService = inject(UserService)
  
  // Traditional: constructor injection
  constructor(private userService: UserService) {}
}
```

### Injection Tokens
```typescript
import { InjectionToken, inject } from '@angular/core'

export interface AppConfig {
  apiUrl: string
  production: boolean
}

export const APP_CONFIG = new InjectionToken<AppConfig>('app.config')

// Provide in app.config.ts
export const appConfig: ApplicationConfig = {
  providers: [
    { provide: APP_CONFIG, useValue: { apiUrl: '/api', production: false } }
  ]
}

// Use in component/service
@Injectable({ providedIn: 'root' })
export class ApiService {
  private config = inject(APP_CONFIG)
  
  get baseUrl() { return this.config.apiUrl }
}
```

## Routing

### Route Configuration
```typescript
// app.routes.ts
import { Routes } from '@angular/router'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'about', component: AboutComponent },
  
  // Lazy loading
  {
    path: 'admin',
    loadChildren: () => import('./admin/admin.routes')
      .then(m => m.ADMIN_ROUTES),
    canActivate: [authGuard]
  },
  
  // Route parameters
  { path: 'users/:id', component: UserDetailComponent },
  
  // Route data & resolve
  {
    path: 'dashboard',
    component: DashboardComponent,
    data: { title: 'Dashboard' },
    resolve: { user: userResolver }
  },
  
  // Wildcard
  { path: '**', component: NotFoundComponent }
]
```

### Guards
```typescript
import { CanActivateFn, Router } from '@angular/router'
import { inject } from '@angular/core'

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService)
  const router = inject(Router)
  
  if (authService.isAuthenticated()) {
    return true
  }
  
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl: state.url }
  })
}
```

### Resolvers
```typescript
import { ResolveFn } from '@angular/router'

export const userResolver: ResolveFn<User> = (route) => {
  const userService = inject(UserService)
  const id = route.paramMap.get('id')!
  return userService.getUser(id)
}
```

## RxJS Patterns

### Common Operators
```typescript
import { Observable, of, from, forkJoin, combineLatest } from 'rxjs'
import { 
  map, filter, tap, catchError, 
  switchMap, mergeMap, concatMap,
  debounceTime, distinctUntilChanged,
  takeUntil, shareReplay
} from 'rxjs/operators'

@Component({ /* ... */ })
export class SearchComponent implements OnDestroy {
  private destroy$ = new Subject<void>()
  
  searchControl = new FormControl('')
  
  results$ = this.searchControl.valueChanges.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    filter(term => term.length >= 2),
    switchMap(term => this.searchService.search(term)),
    catchError(error => {
      console.error(error)
      return of([])
    }),
    takeUntil(this.destroy$)
  )
  
  ngOnDestroy() {
    this.destroy$.next()
    this.destroy$.complete()
  }
}
```

### Subject Types
```typescript
// BehaviorSubject - has current value
private userSubject = new BehaviorSubject<User | null>(null)
user$ = this.userSubject.asObservable()

// ReplaySubject - replays N values
private eventsSubject = new ReplaySubject<Event>(5)

// AsyncSubject - emits last value on complete
private resultSubject = new AsyncSubject<Result>()
```

## Forms

### Reactive Forms
```typescript
import { Component } from '@angular/core'
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms'

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()">
      <input formControlName="name" />
      @if (form.get('name')?.errors?.['required']) {
        <span class="error">Name is required</span>
      }
      
      <input formControlName="email" type="email" />
      @if (form.get('email')?.errors?.['email']) {
        <span class="error">Invalid email</span>
      }
      
      <div formGroupName="address">
        <input formControlName="street" />
        <input formControlName="city" />
      </div>
      
      <button type="submit" [disabled]="form.invalid">Submit</button>
    </form>
  `
})
export class UserFormComponent {
  private fb = inject(FormBuilder)
  
  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    address: this.fb.group({
      street: [''],
      city: ['']
    })
  })
  
  onSubmit() {
    if (this.form.valid) {
      console.log(this.form.value)
    }
  }
}
```

### Custom Validators
```typescript
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms'

export function passwordMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')
    const confirm = control.get('confirmPassword')
    
    if (password?.value !== confirm?.value) {
      return { passwordMismatch: true }
    }
    return null
  }
}

// Usage
form = this.fb.group({
  password: ['', Validators.required],
  confirmPassword: ['', Validators.required]
}, { validators: passwordMatchValidator() })
```

## Control Flow (Angular 17+)

```html
<!-- If -->
@if (user) {
  <p>{{ user.name }}</p>
} @else if (loading) {
  <p>Loading...</p>
} @else {
  <p>No user found</p>
}

<!-- For -->
@for (item of items; track item.id; let i = $index) {
  <li>{{ i + 1 }}. {{ item.name }}</li>
} @empty {
  <li>No items</li>
}

<!-- Switch -->
@switch (status) {
  @case ('loading') { <spinner /> }
  @case ('error') { <error-message /> }
  @case ('success') { <content /> }
  @default { <placeholder /> }
}

<!-- Defer (lazy loading) -->
@defer (on viewport) {
  <heavy-component />
} @placeholder {
  <p>Scroll to load</p>
} @loading {
  <spinner />
} @error {
  <p>Failed to load</p>
}
```

## Testing

### Component Testing
```typescript
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { By } from '@angular/platform-browser'

describe('UserCardComponent', () => {
  let component: UserCardComponent
  let fixture: ComponentFixture<UserCardComponent>
  
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserCardComponent]
    }).compileComponents()
    
    fixture = TestBed.createComponent(UserCardComponent)
    component = fixture.componentInstance
  })
  
  it('should display user name', () => {
    component.user = { id: '1', name: 'John', email: 'john@example.com' }
    fixture.detectChanges()
    
    const name = fixture.debugElement.query(By.css('h2'))
    expect(name.nativeElement.textContent).toContain('John')
  })
  
  it('should emit selected event on click', () => {
    const user = { id: '1', name: 'John', email: 'john@example.com' }
    component.user = user
    
    jest.spyOn(component.selected, 'emit')
    
    const card = fixture.debugElement.query(By.css('.card'))
    card.triggerEventHandler('click', null)
    
    expect(component.selected.emit).toHaveBeenCalledWith(user)
  })
})
```

### Service Testing
```typescript
import { TestBed } from '@angular/core/testing'
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing'

describe('UserService', () => {
  let service: UserService
  let httpMock: HttpTestingController
  
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    })
    
    service = TestBed.inject(UserService)
    httpMock = TestBed.inject(HttpTestingController)
  })
  
  afterEach(() => {
    httpMock.verify()
  })
  
  it('should fetch users', () => {
    const mockUsers = [{ id: '1', name: 'John' }]
    
    service.getUsers().subscribe(users => {
      expect(users).toEqual(mockUsers)
    })
    
    const req = httpMock.expectOne('/api/users')
    expect(req.request.method).toBe('GET')
    req.flush(mockUsers)
  })
})
```

## Anti-Patterns

### ❌ Not Unsubscribing
```typescript
// Bad: Memory leak
ngOnInit() {
  this.userService.getUsers().subscribe(users => {
    this.users = users
  })
}

// Good: Use takeUntil or async pipe
private destroy$ = new Subject<void>()

ngOnInit() {
  this.userService.getUsers()
    .pipe(takeUntil(this.destroy$))
    .subscribe(users => this.users = users)
}

ngOnDestroy() {
  this.destroy$.next()
  this.destroy$.complete()
}

// Better: Use async pipe in template
users$ = this.userService.getUsers()
// <div *ngFor="let user of users$ | async">
```

### ❌ Logic in Templates
```html
<!-- Bad -->
<p>{{ user.firstName + ' ' + user.lastName | uppercase }}</p>

<!-- Good: Move to component -->
<p>{{ fullName }}</p>
```

```typescript
get fullName(): string {
  return `${this.user.firstName} ${this.user.lastName}`.toUpperCase()
}
```

### ❌ Not Using OnPush
```typescript
// Bad: Default change detection
@Component({ /* ... */ })
export class HeavyComponent {}

// Good: OnPush for performance
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HeavyComponent {}
```
