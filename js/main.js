let allData;


let color = d3.scaleOrdinal()
  .range(["#EDC951","#CC333F","#00A0B0"]);

let radarChartOptions = {
  w: 600,
  h: 600,
  // margin: margin,
  maxValue: 1,
  levels: 6,
  roundStrokes: true,
  color: color
};



d3.json("data-cleaning/cleaned_data.json")
  .then(data => {
    console.log(data);
    allData = data;
    prepareData();
  })
console.log("WTF")

set1 = new Set(["Boating", "SCUBA Diving", "Snorkeling", "Surfing", "Paddling", "Swimming", "Tubing", "Water Skiing", "Fishing"])
set2 = new Set(["Ice Skating", "Dog Sledding", "Snow Play", "Snowmobiling", "Snowshoeing", "Skiing"])
set3 = new Set(["Hiking", "Camping", "Wildlife Watching", "Biking", "Horse Trekking", "Astronomy"])
set4 = new Set(["Canyoneering", "Caving", "Climbing", "Compass and GPS", "Hunting and Gathering", "Flying", "Auto and ATV"])
set5 = new Set(["Playground", "Shopping", "Team Sports", "Food", "Golfing"])
set6 = new Set(["Arts and Culture", "Guided Tours", "Hands-On", "Living History", "Museum Exhibits", "Park Film", "Junior Ranger Program"])





function prepareData() {
  let lilData = [];
  let parkNames = [];

  allData.forEach(d => {
    // console.log("D: ", d);
    let activityScores = [
      {'axis': 'Water', 'value': setScore(set1, d.activities)},
      {'axis': 'Snow', 'value': setScore(set2, d.activities)},
      {'axis': 'General Outdoor', 'value': setScore(set3, d.activities)},
      {'axis': 'Adventure', 'value': setScore(set4, d.activities)},
      {'axis': 'Misc', 'value': setScore(set5, d.activities)},
      {'axis': 'Education', 'value': setScore(set6, d.activities)}];

    parkData = {'parkName': d.name, 'activityScores': activityScores};
    console.log("Parkdata: ", parkData);
    lilData.push(parkData);
    parkNames.push(d.name);
  })

  //Call function to draw the Radar chart
  RadarChart(".radarChart", lilData.slice(0,3), radarChartOptions);
  console.log(parkNames);
  for (let i = 0; i <3; i++) {
    console.log(".radarChart" + (i+1))
    RadarChart(".radarChart" + (i+1),  [lilData[i]], radarChartOptions);
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
      // console.log("Adding one  for ", d.name);
    }
  })

  return score / set.size;
}