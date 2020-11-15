let allData,
    activitySets,
    activityMapVis;


let palette = ["#EDC951","#CC333F","#00A0B0"]
let color = d3.scaleOrdinal()
  .range(palette);

let radarChartOptions = {
  w: 600,
  h: 600,
  // margin: margin,
  maxValue: 1,
  levels: 6,
  roundStrokes: true,
  color: color,
  strokeWidth: 2
};


d3.json("data-cleaning/cleaned_data.json")
  .then(data => {
    console.log(data);
    allData = data;
    prepareData();
  })

d3.json("data-cleaning/activities/activity_sets.json")
  .then(data => {
    console.log(data);
    activitySets = data;
  })


function prepareData() {
  let parkActivityScores = [];

  allData.forEach(d => {
    let activityScores = [];
    activitySets.forEach(a => {
      let activitySet = new Set(a.activities);
      activityScores.push({'axis': a.name, 'value': setScore(activitySet, d.activities)});
    })

    let parkData = {'parkName': d.name, 'activityScores': activityScores};
    parkActivityScores.push(parkData);
  })

  //Call function to draw the Radar chart
  RadarChart(".radarChart", parkActivityScores.slice(0,3), radarChartOptions);
  for (let i = 0; i <3; i++) {
    console.log(".radarChart" + (i+1))
    let customOptions = radarChartOptions;
    customOptions.color = d3.scaleOrdinal()
      .range([palette[i]]);
    customOptions.w = 200;
    customOptions.h = 200;
    RadarChart(".radarChart" + (i+1),  [parkActivityScores[i]], radarChartOptions);
  }

  initActivityMap();

}

function setScore(set, activities) {
  if (!activities) {
    console.log("You've found the most boring place on earth, with literally NO activities");
    return 0;
  }
  let score = 0;
  activities.forEach(d  => {
    if (set.has(d.name)) {
      score += 1;
    }
  })

  return score / set.size;
}


function initActivityMap() {
  // activityMapVis = new ActivityMap('mapDiv', lilData);
}
