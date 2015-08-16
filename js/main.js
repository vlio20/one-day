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

    var BOARD_WIDTH = 600;
    var boardDiv = document.getElementsByClassName('board')[0];
    //boardDiv.innerHTML = '';

    layOutDay(events);

    function layOutDay(events) {
        var isInputValid = validateEvents(events);

        if (isInputValid) {
            var histogram = createHistogram(events);
            var graph = createTheGraph(events, histogram);
            setClusterWidth(graph);
            setNodesPosition(graph);
            drawBoard(graph);
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

    /**
     * Creates an array of arrays, each index of the top array represents a minute, each minuet is an array of
     * events which takes place at this time (minute);
     * @param events
     * @returns {Array}
     */
    function createHistogram(events) {

        //initializing the minutes array
        var minutes = new Array(720);
        for (var i = 0; i < minutes.length; i++) {
            minutes[i] = [];
        }

        //setting which events occurs at each minute
        events.forEach(function (event) {
            for (var i = event.start; i <= event.end - 1; i++) {
                minutes[i].push(event.id);
            }
        });

        return minutes;
    }

    /**
     * creates a graph of events
     * @param events - the provided input (events)
     * @param minutes - the histogram array
     * @returns {Graph}
     */
    function createTheGraph(events, minutes) {
        var graph = new Graph();
        var nodeMap = {};

        //creating the nodes
        events.forEach(function (event) {
            var node = new Node(event.id, event.start, event.end - 1);
            nodeMap[node.id] = node;
        });

        //creating the clusters
        var cluster = null;

        //cluster is a group of nodes which have a connectivity path, when the minute array length is 0 it means that
        //there are n more nodes in the cluster - cluster can be "closed".
        minutes.forEach(function (minute) {
            if (minute.length > 0) {
                cluster = cluster || new Cluster();
                minute.forEach(function (eventId) {
                    if (!cluster.nodes[eventId]) {
                        cluster.nodes[eventId] = nodeMap[eventId];

                        //
                        nodeMap[eventId].cluster = cluster;
                    }
                });
            } else {
                if (cluster != null) {
                    graph.clusters.push(cluster);
                }

                cluster = null;
            }
        });

        if (cluster != null) {
            graph.clusters.push(cluster);
        }

        //adding neighbours to nodes, neighbours is the group of colliding nodes (events).
        //adding the biggest clique for each site
        minutes.forEach(function (minute) {
            minute.forEach(function (eventId) {
                var sourceNode = nodeMap[eventId];

                //a max clique is a biggest group of colliding events
                sourceNode.biggestCliqueSize = Math.max(sourceNode.biggestCliqueSize, minute.length);
                minute.forEach(function (targetEventId) {
                    if (eventId != targetEventId) {
                        sourceNode.neighbours[targetEventId] = nodeMap[targetEventId];
                    }
                });
            });
        });

        graph.nodes = nodeMap;

        return graph;
    }

    /**
     * width of each node in a cluster defined by the board width divided by the biggest colliding group (a.k.a neighbours)
     * in the cluster.
     * @param graph
     */
    function setClusterWidth(graph) {
        graph.clusters.forEach(function (cluster) {

            //cluster must have at least one node
            var maxCliqueSize = 1;
            for (var nodeId in cluster.nodes) {
                maxCliqueSize = Math.max(maxCliqueSize, cluster.nodes[nodeId].biggestCliqueSize);
            }

            cluster.maxCliqueSize = maxCliqueSize;
            cluster.width = BOARD_WIDTH / (maxCliqueSize);
        });
    }

    /**
     * sets each nodes position (relative to its neighbours). The number of available positions on the X axes is
     * according to the biggest clique in the cluster.
     * @param graph
     */
    function setNodesPosition(graph) {
        graph.clusters.forEach(function (cluster) {
            for (var nodeId in cluster.nodes) {
                var node = cluster.nodes[nodeId];
                var positionArray = new Array(node.cluster.maxCliqueSize);

                //find a place (offset) on the X axes of the node
                for (var neighbourId in node.neighbours) {
                    var neighbour = node.neighbours[neighbourId];
                    if (neighbour.position != null) {
                        positionArray[neighbour.position] = true;
                    }
                }

                for (var i = 0; i < positionArray.length; i++) {
                    if (!positionArray[i]) {
                        node.position = i;
                        break;
                    }
                }
            }
        });
    }

    /**
     * Draws the events on the board;
     * @param graph
     */
    function drawBoard(graph) {
        for (var nodeId in graph.nodes) {
            var node = graph.nodes[nodeId];

            //the 10 in the left parameter is for the left padding of the board element
            appendEvent(node.id, node.start, node.position * node.cluster.width + 10, node.cluster.width, node.end + 1 - node.start);
        }
    }

    /*-----Utils-----*/

    /**
     * Checks if given number is an int
     * @param n
     * @returns {boolean}
     */
    function isInt(n) {
        return Number(n) === n && n % 1 === 0;
    }

    /**
     * appends event to the board
     * @param top
     * @param left
     * @param width
     * @param height
     */
    function appendEvent(text, top, left, width, height) {
        var style = 'top: ' + top + 'px; left: ' + left + 'px; width: ' + width + 'px; height: ' + height + 'px;';
        boardDiv.insertAdjacentHTML('beforeend', '<div class="event" style="' + style + '"><span>' + text + '</span></div>');
    }

})();