
var NUMBER_OF_GENES = 5
var POPULATION_SIZE = 100
var MAX_NUMBER_OF_ITERATIONS = 1000
var bestCandidate = null;
var bestFitness = 10000000000000000;
var iteration = 0;


var F = 0.5;
var population = []

function initArrayWithRandomNumbers()
{
  var candidate = [];
  for( var i =0 ; i< NUMBER_OF_GENES ; i++)
  {
    candidate.push(Math.random());
  }
  return candidate;
}

function initPopulation()
{
  for(var i = 0; i< POPULATION_SIZE; i++)
  {
      population.push(initArrayWithRandomNumbers());
  }
}

function pickRandomIdx(invalidcandidatesidx)
{
  var candidateidxarr = []
  for(var i = 0; i< POPULATION_SIZE; i++)
  {
    if(invalidcandidatesidx.indexOf(i) == -1)
    {
      candidateidxarr.push(i);
    }
  }
  tryidx = Math.round(Math.random() * (candidateidxarr.length -1));
  choice  = candidateidxarr[tryidx]
  if (typeof choice == 'undefined')
  {
    console.log(choice);
  }

  return choice
}

//(In essence, the new position is outcome of binary crossover of agent \mathbf {x}  with intermediate agent \mathbf {z} =\mathbf {a} +F\times (\mathbf {b} -\mathbf {c} ).)
function generateNewCandidate(a,b,c,x, crossPoint)
{
    var newCandidate = [];


    for( var i =0 ; i< NUMBER_OF_GENES ; i++)
    {
      var randomPick = Math.random();
      if(randomPick < crossPoint || i == crossPoint )
      {
        var ai = a[i];
        var bi = b[i];
        var ci = c[i];
        newCandidate.push(ai + F *(bi-ci))
      }
      else
      {
        newCandidate.push(x[i])
      }
    }
    return newCandidate;
}
//particular to the problem

function evalCandidate(candidate,x)
{
  /* Horner's rule for polynomial evaluation
  coefficients := [-19, 7, -4, 6] # list coefficients of all x^0..x^n in order
  x := 3
  accumulator := 0
  for i in length(coefficients) downto 1 do
    # Assumes 1-based indexing for arrays
    accumulator := ( accumulator * x ) + coefficients[i]
    done
  # accumulator now has the answer
  */
  var result = 0
  for (var i = 0 ; i< NUMBER_OF_GENES; i++)
  {
    result = (result * x) + candidate[i];
  }
  return result;
}

function calculateFitnessofCandidate(candidate,dataset)
{
  // We will use the MSE
  error = 0;
  for(var i = 0 ; i< dataset.length; i++)
  {
    var value = evalCandidate(candidate,dataset[i].x);
    error = error + (dataset[i].y - value) * (dataset[i].y - value);
  }
  return error;
}

function differentialEvolutionStep(dataset)
{
  //For each agent \mathbf {x}  in the population do
    for(var candidateIdx = 0 ; candidateIdx < POPULATION_SIZE; candidateIdx++)
    {
      //Pick three agents \mathbf {a} ,\mathbf {b} , and \mathbf {c}  from the population at random, they must be distinct from each other as well as from agent \mathbf {x}
        invalididxlist = [];
        //pick a
        invalididxlist.push(candidateIdx);
        aIdx = pickRandomIdx(invalididxlist);
        //pick b
        invalididxlist.push(aIdx);
        bIdx = pickRandomIdx(invalididxlist);
        //pick c
        invalididxlist.push(bIdx);
        cIdx = pickRandomIdx(invalididxlist);

        var xCandidate = population[candidateIdx];
        var aCandidate = population[aIdx];
        var bCandidate = population[bIdx];
        var cCandidate = population[cIdx];
     //Pick a random index R\in \{1,\ldots ,n\} (n being the dimensionality of the problem to be optimized).
       var crossPoint = Math.round(Math.random() * (NUMBER_OF_GENES-1));
    //Compute the agent's potentially new position \mathbf {y} =[y_{1},\ldots ,y_{n}] as follows:
          //For each i, pick a uniformly distributed number r_{i}\equiv U(0,1)
          //If r_{i}<{\text{CR}} or i=R then set y_{i}=a_{i}+F\times (b_{i}-c_{i}) otherwise set y_{i}=x_{i}
      var newCandidate = generateNewCandidate(aCandidate,bCandidate,cCandidate,xCandidate, crossPoint);
      var fitnessNewCandidate = calculateFitnessofCandidate(newCandidate,dataset);
      var fitnessOldCandidate = calculateFitnessofCandidate(xCandidate,dataset);

      if(fitnessNewCandidate < fitnessOldCandidate)
      {
          population[candidateIdx] = newCandidate;
          if(bestFitness > fitnessNewCandidate)
          {
            bestFitness = fitnessNewCandidate;
            bestCandidate = population[candidateIdx];
          }
      }

      if(bestFitness > fitnessOldCandidate)
      {
        bestFitness = fitnessOldCandidate;
        bestCandidate = population[candidateIdx];
      }

    }

    var newData = []
    for(var i = 0 ; i< dataset.length; i++)
    {
      var y = evalCandidate(bestCandidate,dataset[i].x);
      newData.push({"x":dataset[i].x,"y":y});
    }
    var msg = {"graphdata":newData, "bestCandidate":bestCandidate,"bestFitness":bestFitness}
    postMessage(msg);
}

function guiDifferentialEvolution(dataset)
{
  if(iteration == 0)
  {// Initialize all agents \mathbf {x}  with random positions in the search-space.
    initPopulation();
    differentialEvolutionStep(dataset);
  }
  else if (iteration < MAX_NUMBER_OF_ITERATIONS)
  {
      differentialEvolutionStep(dataset);
  }
  else
  {
    // post the end message
    var msg = {"graphdata":null, "bestCandidate":null,"bestFitness":null}
    postMessage(msg);
  }
  iteration = iteration + 1;
}

function differentialEvolution(dataset)
{
  // Initialize all agents \mathbf {x}  with random positions in the search-space.
  initPopulation();
  //Until a termination criterion is met (e.g. number of iterations performed, or adequate fitness reached), repeat the following:
  while(iteration < MAX_NUMBER_OF_ITERATIONS )
  {
    iteration = iteration + 1;
    differentialEvolutionStep(dataset);
  }

}

self.onmessage = function(event)
{
  if(typeof(event.data.dataset) != "undefined")
    guiDifferentialEvolution(event.data);
}
