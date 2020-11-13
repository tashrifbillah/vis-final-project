let historyItems = [];

// Iterate over each row
$('b + p').each(function() {
    const item = {};

    // Iterate through each data point and run through extractor function, add to object
    item.title = $('b', this).text().split(/, \d/)[0];
    item.year = Number($('b', this).text().match(/\d+/)[0]);
    item.description = $(this).text().split(' - ')[1].replaceAll(/\n\s+/gi, ' ')

    // Append object to outer rows variable
    historyItems.push(item)
})

console.log(JSON.stringify(historyItems))
