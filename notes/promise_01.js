


var myPromise = new Promise (function(resolve, reject) {
    resolve(5);
});

myPromise.then(function(myNumber) {
    console.log(myNumber)
});
