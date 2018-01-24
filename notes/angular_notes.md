RXJS
- does doing .subscribe in a constructor actually leak memory?

When inside of a Component with onPush, if it's using .subscribe and needs to be updated upon
that subscription, why does not changeDetector.detectChanges()


If using changedetector.detach()
+ markForCheck -- does it still check its parent?

detach + markForCheck doesn't work?

Recurring problem in RXJS (e.g. when it's expecting an Observable, but gets undefined:
Cannot read property 'Symbol(Symbol.iterator)' of undefined ; Zone: <root> ; Task: Promise.then ; Value: ViewWrappedError TypeError: Cannot read property 'Symbol(Symbol.iterator)' of undefined

Model computed properties; can we refactor to have these in a single place and reuse them throughout the code?

Sending undefined on the action channel should trigger an exception

Effect Flaw: the types are actually never defined on the Effect methods, since they always have a "...): Subscription" return type; not what the input and output of th eaction actually is.

How does one really reason regarding Observable.let vs ngrx.select? Wrt performance, identity checks etc.

How does the {provide: FoobarComponent, useValue: FoobarComponent.prototype} actually work?





## RXJS

* RXJS 4 !== RXJS 5
Make sure to read the documentation for the latest version of rxjs (v5). Some things have been changed since v4.
https://github.com/ReactiveX/rxjs/blob/master/MIGRATION.md

New repo URL (v5, what ng2 uses):
https://github.com/ReactiveX/rxjs

Old repo URL (spend no time here):
https://github.com/Reactive-Extensions/RxJS

* Learn how to read marble diagrams since it's the best documentation there is for rxjs operators:
See image here: http://reactivex.io/documentation/observable.html

* The method descriptions for operators is barely readable most of the time. Use the marble diagrams here to understand each of the operators:
http://reactivex.io/rxjs/class/es6/Observable.js~Observable.html

Or check out the excellent (draggable!) diagrams on http://rxmarbles.com/

* How to debug rxjs:
http://staltz.com/how-to-debug-rxjs-code.html

* We use the different maps a lot. It's very important to understand the difference between `switchMap`, `mergeMap` and `exhaustMap`. Otherwise we might have subtle bugs when there's latency introduced.





## Components + Observables

### Conventions

Variables with Observable use $ as suffix: `casinoGames$`
Variables with Subscription use $$ as suffix: `casinoGames$$`

### AsyncPipe + Observable

If value from Observable will be shown in template, use the asyncPipe since it will automatically take care of unsubscribing and notifying

the change detection that the template should be re-checked for updates (it does so via ChangeDetectorRef.markforChange())

```
// COMPONENT

Component {
    lobbyTitle$: Observable<string>;

    ngOnInit() {
        this.lobbyTitle$ = this.store.select(...);
    }
}


// TEMPLATE

<h1>{{ lobbyTitle$ | async }}</h1>
```


If you find yourself using the asyncPipe on the same Observable in multiple places, then do the subscription in the Component and bind to

that instead. Otherwise you might end up with weird bugs where the multi-subscriptions trigger side effects multiple times.

(NOTE: Kind of convoluted example, since we ideally should never do any http-calls straight from the Components. This should instead go

through the SDK-layer. Hopefully you get the point anyway.)


The following example will for instance do the HTTP-request twice (!).

DONT:

```
// COMPONENT

Component {
    exampleValue$: Observable<string>;

    ngOnInit() {
        // Note: this doesn't do the HTTP-call until the async-pipe
        // calls .subscribe() from the template

        this.exampleValue$ = this.http.get('/example/value');
    }
}

// TEMPLATE

<h1>{{ exampleValue$ | async }}</h1>

<p>This is my value {{ exampleValue$ | async }}</p>
```

DO:

```
// COMPONENT

Component {
    exampleValue$$: Subscription;
    exampleValue: string;

    ngOnInit() {
        this.exampleValue$$ = this.http.get('/example/value')
            .subscribe((exampleValue) => {
                this.exampleValue = exampleValue;
            });

    }

    // The asyncPipe takes care of unsubscribing when the component is disposed of.
    // Without it we have to take care of manually unsubscribing. Otherwise memoryleaks.
    ngOnDestroy() {
        this.exampleValue$$.unsubscribe();
    }
}

// TEMPLATE


<h1>{{ exampleValue }}</h1>

<p>This is my value {{ exampleValue }}</p>
```


### Components + Async Observables

Sometimes you will be subscribing to some value on the store, and when the value arrives it's not changed in the template. This will occur

especially often when the Components are using ChangeDetectionStrategy.OnPush (which we should use as often as possible for performance

reasons). This is because the changeDetection assumes the Component hasn't been updated since neither data has been pushed ot it (via @Input

Foobar params from parent Component) nor has there been any local events triggered in the Component.

On these occasions, you have to manually force the ChangeDetection to run:

```
Component {

    constructor(private changeDetector: ChangeDetectorRef) { }

    ngOnInit() {
        this.exampleValue$$ = Observable.combineLatest(
            this.store.select(...),
            this.store.select(...)
        )
            .subscribe((exampleValue) => {
                this.exampleValue = exampleValue;

                // Note: running this.changedetector.detectChanges() won't work here
                // since internally the Component doesn't think it needs to check for changes
                // so it will do nothing most of the time.

                this.changeDetector.markForCheck();
            });
    }
}
```
