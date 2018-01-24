const myObservable = Rx.Observable.create(function(observer) {
    debugger;
    observer.next(1);
    observer.next(2);
    observer.next(3);
    observer.next(4);
});

const obs = {
    next: function(myNumber) {
        console.log(myNumber);
    }
}

const subscription = myObservable.subscribe(obs);
