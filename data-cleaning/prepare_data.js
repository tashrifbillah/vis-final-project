/**
 * Extracts data from wikipedia HTML table
 */

const rows = [];
const headers = ['name', 'image', 'location', 'date_established', 'area', 'visitors', 'description']

const defaultExtract = el => $(el).text().split("\n")[0]

// Functions to get each piece of data
const extractors = {
  name: el => $(el).text().replace(/\s+$/, ''),
  image: el => 'https:' + $('img', el).attr('src'),
  location: el => $(el).text().split(/\d/)[0],
  date_established: defaultExtract,
  area: defaultExtract,
  visitors: defaultExtract,
  description(el) {
    $('sup', el).remove()
    return $(el).text()
  }
}

// Iterate over each row
$('table tbody tr').each(function() {
  const row = {};

  // Iterate through each data point and run through extractor function, add to object
  $('th, td', this).each(function(idx) {
    const header = headers[idx]
    row[header] = extractors[header](this)
  })

  // Append object to outer rows variable
  rows.push(row)
})

console.log(rows)
