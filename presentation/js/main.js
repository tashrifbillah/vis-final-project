let allData,
    activitySets,
    activityMapVis;

let barVis;

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

const MONTHS_SHORT = ['', 'jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep']
const SEASONS = {
  All: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  Spring: [3, 4, 5],
  Summer: [6, 7, 8],
  Fall: [9, 10, 11],
  Winter: [12, 1, 2]
}

d3.json("data/cleaned_data.json")
  .then(async data => {
    // Normalize visit numbers data structures
    allData = data.map(function(d) {
      const monthlyVisits = _.fromPairs(Object.entries(d['monthly visit']).map(([k, v]) => [
        k,
        {prev: v[`${k} 2019`], current: v[`${k} 2020`], monthIdx: MONTHS_SHORT.indexOf(k)}
      ]))

      const ytdVisits = _.fromPairs(Object.entries(d['monthly visit']).map(([k, v]) => [
        MONTHS_SHORT.findIndex[k],
        {prev: v[`YTD ${k}`], current: v[`YTD ${k}`], monthIdx: MONTHS_SHORT.indexOf(k)}
      ]))
      const seasonalVisits = _.fromPairs(Object.entries(SEASONS).map(([k, v]) => [
        k,
        _.sumBy(_.compact(v.map(i => monthlyVisits[MONTHS_SHORT[i]])), 'current')
      ]))

      return {
        ...d,
        monthlyVisits,
        ytdVisits,
        seasonalVisits
      }
    });

    d3.json("data/timeline_data.json").then(timelineData => {
      const formattedParks = allData.map(p => ({
        year: Number(p.date_established.split(', ')[1]),
        image: p.images[0].url,
        title: `${p.fullName} Founded`,
        description: p.description,
        isPark: true
      }))
      new Timeline("timeline", _.orderBy(timelineData.concat(formattedParks), 'year'))
    })

    activitySets = await d3.json("data/activity_sets.json");
    prepareData();
    barVis = new BarChart('bar', data)
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
