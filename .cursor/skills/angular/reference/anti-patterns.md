# Angular Anti-Patterns

## ❌ Not Using Standalone Components
```typescript
// Bad: Module-based (legacy)
@NgModule({
  declarations: [MyComponent],
  imports: [CommonModule],
  exports: [MyComponent]
})
export class MyModule {}

// Good: Standalone
@Component({
  standalone: true,
  imports: [CommonModule],
  // ...
})
export class MyComponent {}
```

## ❌ Subscribe Without Unsubscribe
```typescript
// Bad: Memory leak
export class MyComponent {
  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      this.data = data
    })
  }
}

// Good: Auto-unsubscribe with takeUntilDestroyed
export class MyComponent {
  private destroyRef = inject(DestroyRef)
  
  ngOnInit() {
    this.dataService.getData()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(data => this.data = data)
  }
}

// Better: Use async pipe
@Component({
  template: `@if (data$ | async; as data) { ... }`
})
export class MyComponent {
  data$ = this.dataService.getData()
}
```

## ❌ Logic in Templates
```html
<!-- Bad: Complex logic in template -->
<div *ngIf="user && user.roles && user.roles.includes('admin') && !isLoading && items.length > 0">

<!-- Good: Move to component -->
<div *ngIf="canShowAdminPanel">
```

```typescript
get canShowAdminPanel() {
  return this.user?.roles?.includes('admin') && !this.isLoading && this.items.length > 0
}

// Or with signals
canShowAdminPanel = computed(() => 
  this.user()?.roles?.includes('admin') && !this.isLoading() && this.items().length > 0
)
```

## ❌ Nested Subscriptions
```typescript
// Bad: Callback hell
this.userService.getUser().subscribe(user => {
  this.orderService.getOrders(user.id).subscribe(orders => {
    this.orderService.getOrderDetails(orders[0].id).subscribe(details => {
      // ...
    })
  })
})

// Good: Use RxJS operators
this.userService.getUser().pipe(
  switchMap(user => this.orderService.getOrders(user.id)),
  switchMap(orders => this.orderService.getOrderDetails(orders[0].id))
).subscribe(details => {
  // ...
})
```

## ❌ Manual Change Detection
```typescript
// Bad: Forcing change detection
constructor(private cdr: ChangeDetectorRef) {}

updateData() {
  this.data = newData
  this.cdr.detectChanges()  // Shouldn't need this!
}

// Good: Use proper reactive patterns
// Signals auto-trigger change detection
data = signal<Data[]>([])

updateData() {
  this.data.set(newData)
}
```

## ❌ Services in Components
```typescript
// Bad: HTTP calls in component
@Component({...})
export class UserComponent {
  constructor(private http: HttpClient) {}
  
  loadUser() {
    this.http.get('/api/user').subscribe(...)
  }
}

// Good: Use services
@Component({...})
export class UserComponent {
  constructor(private userService: UserService) {}
  
  loadUser() {
    this.userService.getUser().subscribe(...)
  }
}
```

## ❌ Template-Driven Forms for Complex Forms
```html
<!-- Bad: Template-driven for complex validation -->
<input [(ngModel)]="email" required email #emailField="ngModel" />
<input [(ngModel)]="confirmEmail" required #confirmField="ngModel" />
<!-- Cross-field validation? Good luck! -->

<!-- Good: Use Reactive Forms -->
```

```typescript
form = this.fb.group({
  email: ['', [Validators.required, Validators.email]],
  confirmEmail: ['', [Validators.required]]
}, {
  validators: [this.matchEmails]
})

matchEmails(group: FormGroup) {
  return group.get('email')?.value === group.get('confirmEmail')?.value
    ? null
    : { mismatch: true }
}
```

## ❌ Storing State in Components
```typescript
// Bad: Component owns application state
@Component({...})
export class CartComponent {
  items: CartItem[] = []  // Lost on navigation!
  
  addItem(item: CartItem) {
    this.items.push(item)
  }
}

// Good: Use services or state management
@Injectable({ providedIn: 'root' })
export class CartService {
  private items = signal<CartItem[]>([])
  items$ = this.items.asReadonly()
  
  addItem(item: CartItem) {
    this.items.update(items => [...items, item])
  }
}
```
