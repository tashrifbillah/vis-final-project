let allData,
    activitySets,
    activityMapVis,
    parkActivityScores;


let palette = ["#984ea3","#CC333F","#0066ff"]
let color = d3.scaleOrdinal()
  .range(palette);

let radarChartOptionsLarge = {
  w: 600,
  h: 600,
  // margin: margin,
  maxValue: 1,
  levels: 6,
  roundStrokes: true,
  color: color,
  strokeWidth: 2
};

let radarChartOptionsSmall = {
  w: 200,
  h: 200,
  // margin: margin,
  maxValue: 1,
  levels: 6,
  roundStrokes: true,
  color: color,
  strokeWidth: 2
};


d3.json("data/cleaned_data.json")
  .then(async data => {
    console.log(data);
    allData = data;

    d3.json("data/timeline_data.json").then(timelineData => {
      const formattedParks = allData.map(p => ({
        year: Number(p.date_established.split(', ')[1]),
        image: p.images[0].url,
        title: `${p.fullName} Founded`,
        description: p.description
      }))
      new Timeline("timeline", _.orderBy(timelineData.concat(formattedParks), 'year'))
    })

    activitySets = await d3.json("data/activity_sets.json");
    prepareData();
  })

// TODO: De-duplicate  Sequoia and Kings Valley
function prepareData() {
  parkActivityScores = [];

  allData.forEach(d => {
    let activityScores = [];
    activitySets.forEach(a => {
      let activitySet = new Set(a.activities);
      activityScores.push({'axis': a.name, 'value': setScore(activitySet, d.activities)});
    })

    let parkData = {'parkName': d.name, 'activityScores': activityScores};
    if (parkActivityScores.map(d => d.parkName).indexOf(d.name) == -1) {
      parkActivityScores.push(parkData);
    }
  })

  updateRadar();

}

function updateRadar() {
  let displayParks;
  // console.log(topTenParks.slice(0,3).map(d => d.name));
  if (topTenParks.length != 0) {
    displayParks = parkActivityScores.filter(d => {
      return topTenParks.slice(0,3).map(d => d.name).indexOf(d.parkName) != -1;
    });
  } else {
    displayParks = parkActivityScores.sort(() => Math.random() - 0.5).slice(0, 3);
    console.log(displayParks)
  }

  // console.log("Display Parks: ", displayParks)

  //Call function to draw the Radar chart
  RadarChart(".radarChart", displayParks, radarChartOptionsLarge);

  for (let i = 0; i <3; i++) {
    let customOptions = radarChartOptionsSmall;
    customOptions.color = d3.scaleOrdinal()
      .range([palette[i]]);
    RadarChart(".radarChart" + (i+1),  [displayParks[i]], radarChartOptionsSmall);
  }
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
