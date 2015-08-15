(function () {
        var events = [
            {id: 1, start: 0, end: 120},
            {id: 2, start: 60, end: 120},
            {id: 3, start: 60, end: 180},
            {id: 4, start: 150, end: 240},
            {id: 5, start: 200, end: 240},
            {id: 6, start: 300, end: 420},
            {id: 7, start: 360, end: 420},
            {id: 8, start: 300, end: 720}
        ];

        layOutDay(events);

        function layOutDay(events) {
            var isInputValid = validateEvents(events);

            if(isInputValid) {
                var histogram = createHistogram(events);
            }
        }

        /**
         * Will check if provided input is in correct form. events should be an array of object. Each object of the array
         * should have 3 attributes: id (Number|unique), start (number|between:0,720),
         * end (number|between:0,720|greaterThen:start)
         * @param events
         * @returns {boolean}
         */
        function validateEvents(events) {
            var isValid = true;
            var mapOfIds = {};

            if (events instanceof Array) {
                for (var i = 0; i < events.length; i++) {
                    var event = events[i];

                    //checking the event id
                    if (!(event && isInt(event.id) && !mapOfIds[event.id])) {
                        isValid = false;
                    } else {
                        mapOfIds[event.id] = true;
                    }

                    //checking the event start time
                    if (!(isInt(event.start) && 0 <= event.start && event.start <= 720)) {
                        isValid = false;
                    }

                    //checking the event end time
                    if (!(isInt(event.end) && event.start <= event.end && event.end <= 720)) {
                        isValid = false;
                    }

                    if (!isValid) {
                        console.error("one of the objects in the events array is invalid");
                    }
                }

            } else {
                console.error("input should be an Array");
                isValid = false;
            }

            if (!isValid) {
                alert("the provided events are invalid, check console log for more information");
            }

            return isValid;
        }

        function createHistogram(events) {

            //initializing the minutes array
            var minutes = new Array(720);
            for(var i = 0; i < minutes.length; i++) {
                minutes[i] = [];
            }

            //setting which events occurs at each minute
            events.forEach(function(event) {
                for(var i = event.start; i <= event.end - 1; i++) {
                    minutes[i].push(event.id);
                }
            });

            return minutes;
        }

        /**
         * Checks if given number is an int
         * @param n
         * @returns {boolean}
         */
        function isInt(n) {
            return Number(n) === n && n % 1 === 0;
        }
    })
();