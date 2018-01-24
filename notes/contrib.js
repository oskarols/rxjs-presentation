window.oldLog = console.log;
window.oldError = console.error;


    $('.runcode')
        .on('click', function() {
            const codeElement = $(this)
                .parent('section')
                .find('code.code-to-be-run');

            const codeOutputElement = $(this)
                .parent('section')
                .find('.codeoutput');

            codeOutputElement.empty();

            console.log = function (message) {
                codeOutputElement.append('<p>' + message + '</p>')
                window.oldLog.apply(console, arguments);
            };

            console.error = function (message) {
                codeOutputElement.append('<p class="red">' + message + '</p>')
                window.oldError.apply(console, arguments);
            }

            eval(codeElement.get(0).innerText);
        });

    // document
    //     .getElementById('testing')
    //     .addEventListener('click', function() {

    //         var myObs = Rx.Observable.create(function(observer) {
    //             observer.next(10);
    //             observer.next(20);
    //             observer.next(30);
    //         });

    //         myObs.subscribe(function(value) {
    //             console.log(value);
    //         });
    //     });

