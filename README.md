# one-day
A one day calendar 

## Requirements
Part I: Write a function to lay out a series of events on the calendar for a single day.

Events will be placed in a container. The top of the container represents 9am and the bottom represents 9pm.   
The width of the container will be 620px (10px padding on the left and right) and the height will be 720px (1 pixel for every minute between 9am and 9pm). The objects should be laid out so that they do not visually overlap. If there is only one event at a given time slot, its width should be 600px.

There are 2 major constraints: 
1. Every colliding event must be the same width as every other event that it collides width. 
2. An event should use the maximum width possible while still adhering to the first constraint.

See calendar1.png for an example.

The input to the function will be an array of event objects with the start and end times of the event. Example (JS):

    [
    
	     {id : 1, start : 60, end : 120},  // an event from 10am to 11am
	     {id : 2, start : 100, end : 240}, // an event from 10:40am to 1pm
	     {id : 3, start : 700, end : 720} // an event from 8:40pm to 9pm 
    ]

The function should return an array of event objects that have the left and top positions set (relative to the top left of the container), in addition to the id, start, and end time.

Part II: Use your function from Part I to create a web page that is styled just like the example image calendar_part2.png with the following calendar events:

 1. An event that starts at 9:30 am and ends at 11:30 am
 2. An event that starts at 6:00 pm and ends at 7:00pm
 3. An event that starts at 6:20pm and ends at 7:20pm
 4. An event that starts at 7:10pm pm and ends at 8:10 pm  

## Code
### Installation

 1. Clone this repository

## Solution
Below you can find the algorithm to solve the problem according to requirements.

### Introduction
I will try to address this task in manner of graphs, so few terms should be given. You can find the terms in the section below.

### Terms
**Node:** represents an event - $n$, $n \in N, N$ - group of all nodes.  
**Edge:** represents colliding events - $e$, $e \in E, E$ - group of all edges. For example, if node $u$ and $v$ collide then there will be an edge $e_{u,v}$ connecting them.  
**Graph:** the collection of nodes and edges $G, G\in(N,E)$ .  
**Cluster:** represents a group of connected nodes ( sub group of the Graph) - $c$, $c \subseteq G$ . For example, if we have the following nodes: $u, v, w$ and edge $e_{u,v}$. Then there will be 2 clusters, the first will contain $u,v$ and the second will contain only $w$.  
**Clique:** represents sub group of nodes in a cluster, which all its nodes have edges one to other -  $cq$, $cq \subseteq c$. Note, clique represents a colliding events.

**Board:** The day container which holds all the events.  

### Terms example
For the following input:

    [
	     {id : 1, start : 0, end : 120}, 
	     {id : 2, start : 60, end : 120},
	     {id : 3, start : 60, end : 180},
	     {id : 4, start : 150, end : 240},
	     {id : 5, start : 200, end : 240},
	     {id : 6, start : 300, end : 420},
	     {id : 7, start : 360, end : 420},
	     {id : 8, start : 300, end : 720}
    ]
The graph will be:
![enter image description here](http://s24.postimg.org/tz0ly8nqt/graph.png)
Black cycle - node - event  
Green ellipse - clique - group of colliding events  
Red ellipse - cluster - group of connected nodes  
Blue line - edge - connector between colliding events   

### Constraint paraphrase 
1. Each node in the **same cluster** must have the same width on the board, in order to meet the first constraint.  
2. Nodes must not overlap each other on the board while starching to maximum width and still adhering to the first constraint.
3. The width of nodes in a cluster will be set by the biggest clique in the cluster. This is true because, nodes in the same clique will share at least one minute on the board, meaning that they will have to have the same width (because they are colliding). So other nodes in the cluster will have the same width as the smallest node.
4. Each node in a clique will gain its X axes position relative to the nodes in this clique. 

### Algorithm
For given array of events `arrayOfEvents` (from the requirements example): 

    [
    
         {id : 1, start : 60, end : 120},  // an event from 10am to 11am
         {id : 2, start : 100, end : 240}, // an event from 10:40am to 1pm
         {id : 3, start : 700, end : 720} // an event from 8:40pm to 9pm 
    ]

**Step One:** creating events histogram.  
An Array of arrays will be created, lets call this array as `histogram`. The `histogram` length will be 720, each index of the `histogram` will represent an a  minute in the board (day). 
Lets call each index of the `histogram` a `minute`. Each `minute`, is an array. Each index of the `minute` array represents an event which takes place at this minute.

pseudo code:  

    histogram = new Array(720); 
    
    forEach minute in histogram:
    	minute = new Array(); 
    	
    forEach event in arrayOfEvents:
	    forEach minute inBetween event.start and endMinute:
		    histogram[minute].push(event.id);

`histogram` array will look like this after this step (for given example):  

    [
    	1: [],
    	2: [],
    	.
    	.
    	.
    	59: [],
    	60: [1],
    	61: [1],
    	.
    	.
    	.
    	99: [1],
    	100: [1,2],
    	101: [1,2],
    	.
    	.
    	.
    	120: [1,2],
    	121: [2],
    	122: [2],
    	.
    	.
    	.
    	240: [2],
    	241: [],
    	242: [],
    	.
    	.
    	.
    	699: [],
    	700: [3],
    	701: [3],
    	.
    	.
    	.
    	720: [3]
    ]

**Step Two:** creating the graph  
In this step the graph will be created, including nodes, edges and clusters.  
Note that there won't be an edge entity, each node will hold a map of nodes (key: node id, value: node) which it collides with (its clique). This map will be called clique.

pseudo code:  

    nodesMap := Map<nodeId, node>;
    graph := Object<clusters, nodesMap>;
    Node := Object<nodeId, start, end, clique, cluster, position>;
    Cluster := Object<mapOfNodesInCluster, width>
    
    //creating the nodes
    forEach event in arrayOfEvents {
	    node = new Node(event.id, event.start, event.end, new Map<nodeId, node>, null)
	    nodeMap[node.nodeId] = node;
	 }

	//creating the clusters
	cluster = null;
	forEach minute in histogram {
		if(minute.length > 0) {
			cluster = cluster || new Cluster(new Array(), 0);
			forEach event in minute {
				if(event.id not in cluster.nodes) {
					cluster.nodes[event.id] = nodeMap[event.id];
					node.cluster = cluster;
				}
			} 
		} else { 
			if(cluster != null) {
				graph.clusters.push(cluster);
			}
			
			cluster = null;
		}
	}
	
	//adding edges to nodes
	forEach minute in histogram {
		forEach sourceEvent in minute {
			sourceNode = eventsMap[sourceEvent.id];
			forEach targetEvent in minute {
				sourceNode.clique[targetEvent.id] = eventsMap[targetEvent.id]
			}
		}
	}

**Step Three:** calculating the width of each cluster.  
As mentioned above, the width of all nodes in the cluster will be determined by the size of the biggest clique in the in the cluster.  
For simplicity reasons there is no unique cliques, rather each node will hold its clique.  
The width of each node $n$ in cluster $c$ will follow this equation:  
$$n_{width} = \frac{Board_{width}}{MAX\left ( size\left (cl_{1} \right), size\left (cl_{2} \right), ...,  size\left (cl_{n} \right)\right )}$$

Where $cl_{i} \subseteq c$  

Each node width will be set in the cluster its related to. So the width property will be set on the cluster entity.

pseudo code:  

    forEach cluster in graph.clusters {
	    maxCliqueSize = 1;
	    forEach node in cluster.nodes {
		    maxCliqueSize = Max(maxCliqueSize, sizeOf(node.clique);
	    }
	    cluster.width = BOARD_WIDTH / maxCliqueSize; 
    }

**Step Four:** calculating the node position within its clique.  
As already mentioned, nodes in the same clique represents colliding events, meaning that they will have to share X axes "real-estate". In this step X axes position will be given for each node in a clique.  

pseudo code:  

    forEach node in nodesMap {
	    positionArray = new Array(sizeOf(node.clique));
	    forEach cliqueNode in node.clique {
		    if(cliqueNode.position != null) {
			    //marking occupied indexes
			    positionArray[cliqueNode.position] = true;
		    }
	    }

		forEach index in positionArray {
			if(!positionArray[index]) {
				node.position = index;
				break;
			}
		}
    }

**Step Five:** Putting nodes on the board.
In this step we already have all the information we need to place an event (node) on its position on the board. The position and size of each node will be determined by:

 1. height: node.end - node.start  
 2. width: node.cluster.width   
 3. top-offset: node.start  
 4. left-offset: node.cluster.width * (node.position + 1)  



