
var SIZE_X = 712;
var SIZE_Y = 712;
var myWorker = null;
// define dimensions of graph
var m = [80, 80, 80, 80]; // margins
var w = SIZE_X - m[1] - m[3]; // width
var h = SIZE_Y - m[0] - m[2]; // height
var svg = null;
var dataset = null;
var frameNumber = 0;


function render(data)
{
  dataset = data;

  // create the scale functors that map the data domain to the pixel domain
  var scaleX = d3.scale.linear().domain(d3.extent(data, function(d) { return d.x; })).range([0,w]);
  var scaleY = d3.scale.linear().domain(d3.extent(data, function(d) { return d.y; })).range([h,0]);

  // create a line function that can convert data[] into x and y points
  var lineFunction = d3.svg.line().x(function(d) {return scaleX(d.x);})
                                  .y(function(d) {return scaleY(d.y);})
  // create x axis
  var xAxis = d3.svg.axis().scale(scaleX).tickSize(-h).tickSubdivide(true);

  // add it and make it transparent so it does not interfere with the actual info
	svg.append("svg:g")
	          .attr("class", "x axis")
			      .attr("transform", "translate(0," + h + ")")
            .style("stroke-opacity", 0.2)
			      .call(xAxis);

  // create y axis
  var yAxisLeft = d3.svg.axis().scale(scaleY).ticks(4).orient("left");
  // add the y-axis to the left
  svg.append("svg:g")
            .attr("class", "y axis")
            .attr("transform", "translate(-25,0)")
            .call(yAxisLeft);

  //add the title text element that will display the current generation
  textTitle = svg.append('svg:text');
  textTitle.attr("x", (w / 2))
           .attr("y",  -60)
           .attr("text-anchor", "middle")
           .style("font-size", "20px")
           .text("Generation "+frameNumber);

  //add the "best candidate so far" text
  textDetails = svg.append('svg:text');
  textDetails.attr("x", (w / 2))
             .attr("y",  -30)
             .attr("text-anchor", "middle")
             .style("font-size", "12px")
             .text("Generation "+frameNumber);

  //create the reference path (we load it from our data)
  path = svg.append('svg:path');
  path.attr('d',lineFunction(dataset))
      .style('stroke-width', 2)
      .style('stroke', 'steelblue');

  //create the evolution path (will be updated)
  pathEvolution = svg.append("path");
 // we check browser support for web workers
  if(typeof(Worker) !== "undefined")
  {
    //we create the web worker because the algorithm is intensive and we don't want it to block our interface
     myWorker = new Worker("diffevolution.js");
     function updateDiffEvo()
     {
       //keep track of the current generation
       frameNumber = frameNumber + 1;
       //posting the message advances the algorithm
       myWorker.postMessage(dataset);
     }
     //we do a generation every half a second
     setInterval(updateDiffEvo, 500);

     myWorker.onmessage = function(event)
     {
       // we received an end message
       if(event.data.graphdata == null)
       {
         myWorker.terminate();
         return;
       }

       textTitle.text("Generation "+frameNumber);
       textDetails.text( "BestFit: "
                    +event.data.bestCandidate[0].toFixed(4) + " \n"
                    +event.data.bestCandidate[1].toFixed(4) + " \n"
                    +event.data.bestCandidate[2].toFixed(4) + " \n"
                    +event.data.bestCandidate[3].toFixed(4) + " \n"
                    +event.data.bestCandidate[4].toFixed(4) + " \n"
                  +" Error: "+event.data.bestFitness.toFixed(2));

      pathEvolution.transition()
                   .attr("class", "line")
                   .style("stroke", "red")
                   .duration(500)
                   .ease("quad")
                   .attr("d", lineFunction(event.data.graphdata));
      };
   }
   else
   {
    // we don't support browsers that don't have web workers  :( )
    alert("Sorry no webworker support for your browser, the example will not work:( ")
   }
   // end of render function
}


// converts string data from the csv object entry to numeric values
function type(d)
{
  d.x = +d.x;
  d.y = +d.y;
  return d;
}

//load the reference function data from a csv file
function loadDataFromCSV(filename)
{
    data = d3.csv(filename,type,render);
}

// Reset the svg element
function resetSVGElement()
{
  var div = document.getElementById('d3-chartid');
  div.innerHTML = "";

}

function generateSVGElement()
{
  svg = d3.select(".d3-chart").append("svg")
                              .attr("width",SIZE_X)
                              .attr("height", SIZE_Y)
                              .append("svg:g")
                              .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
}

//Function used to switch data inputs based on listbox selection
function onListElementClick(data,domid)
{
  // clear selection
  var oldSelectedListElements = document.getElementsByClassName("selectedul");
  for (i = 0; i < oldSelectedListElements.length; i++)
  {
    oldSelectedListElements[i].className ="";
  }

  listElement = document.getElementById(domid);
  listElement.className  = "selectedul";

  if(myWorker != null)
  {
//Clear the "screen" :)
    resetSVGElement();
//Regenerate the graph
    generateSVGElement()

//Terminate the current worker
    myWorker.terminate();
    myWorker = undefined;
//Clear dataset
    dataset  = null;
//Reset generation counter
    frameNumber = 0;
  }
//Load the data using the hash as a filename
  loadDataFromCSV(data);
}
//The initialization function
function visInit()
{
//Create the main graph element
  generateSVGElement();
//Start with the first element in the list
  onListElementClick('data/sin.csv','lst0');

};
// add the initialization function on the dom content loaded event
document.addEventListener("DOMContentLoaded",visInit);
