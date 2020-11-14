let activityCategories;


function load_activity_categories(activity_csv = "data-cleaning/activities/activity_aggregation.csv") {
  d3.csv(activity_csv).then(data => {
    console.log("LOADED")
    activityCategories = data;
    create_activity_sets();
  });
}

function create_activity_sets() {
  let activitySets = [];

  activityCategories.forEach(d => {
    let activitySet = activitySets.filter(e => e.name == d['Category'])[0];
    if (activitySet) {
      activitySet.activities.push(d['Activity Name']);
    } else {
      activitySets.push({'name': d['Category'], 'activities': [d['Activity Name']]})
    }
  })

  console.log("Final Activity Sets");
  console.log(JSON.stringify(activitySets));
}

load_activity_categories();