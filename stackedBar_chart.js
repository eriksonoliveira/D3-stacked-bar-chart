function stackedBarChart() {
  const data = [
    { city: "Barrie", rain: 156, snow: 46 },
    { city: "Guelph", rain: 167, snow: 45 },
    { city: "Hamilton", rain: 149, snow: 36 },
    { city: "Kitchener", rain: 166, snow: 62 },
    { city: "London", rain: 168, snow: 60 },
    { city: "Ottawa", rain: 161, snow: 52 },
    { city: "Toronto", rain: 145, snow: 41 }
  ];

  // Set the dimensions and margins
  const margin = {
    top: 40,
    right: 100,
    bottom: 30,
    left: 40
  };

  const width = 700 - margin.left - margin.right;
  const height = 350 - margin.top - margin.bottom;

  data.forEach(function(d) {
    d.rain = +d.rain;
    d.snow = +d.snow;
  });

  // Get sum of rain and snow days for each city
  const totals = data.map(function(entry) {
    const { city, rain, snow } = entry;
    return { city: city, total: rain + snow };
  });

  // set the ranges
  const x = d3
    .scaleBand()
    .rangeRound([0, width])
    .padding(0.3);
  const y = d3.scaleLinear().range([height, 0]);

  function makeYGridlines() {
    return d3.axisLeft(y).ticks(5);
  }

  const colors = ["#19b", "#aaa"];

  const stack = d3
    .stack()
    .keys(["rain", "snow"])
    .offset(d3.stackOffsetNone);

  const layers = stack(data);

  // create div for tooltip
  const div = d3
    .select("#stackedBar_chart")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

  // create svg element
  const svg = d3
    .select("#stackedBar_chart")
    .append("svg")
    .attr("class", "chartArea")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Scale the range of the data in the domains
  x.domain(
    data.map(function(d) {
      return d.city;
    })
  );
  y.domain([
    0,
    d3.max(totals, function(d) {
      return d.total + 50;
    })
  ]);

  // add gridlines
  svg
    .append("g")
    .attr("class", "grid")
    .call(
      makeYGridlines()
        .tickSize(-width, 0, 0)
        .tickFormat("")
    );
  // Adding the x Axis
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + height + ")")
    .call(d3.axisBottom(x));

  // Adding the y axis
  svg
    .append("g")
    .attr("class", "y axis")
    .call(d3.axisLeft(y).ticks(5));

  // create bar layers and attatch mouse events
  const layer = svg
    .selectAll(".layer")
    .data(layers)
    .enter()
    .append("g")
    .attr("class", "layer")
    .style("fill", function(d, i) {
      return colors[i];
    });

  layer
    .selectAll("rect")
    .data(function(d) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function(d) {
      return x(d.data.city);
    })
    .attr("width", x.bandwidth())
    .attr("y", function(d) {
      return y(d[1]);
    })
    .attr("height", function(d) {
      return y(d[0]) - y(d[1]);
    })
    .on("mouseover", function(d) {
      d3.select(this).classed("selected", true);

      div
        .transition()
        .duration(200)
        .style("opacity", 0.8);

      div
        .html(d.data.city + ": <br/><strong>" + (d[1] - d[0]) + "</strong>")
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 30 + "px");
    })
    .on("mouseout", function(d) {
      d3.select(this).classed("selected", false);

      div
        .transition()
        .duration(200)
        .style("opacity", 0);
    });

  // Draw legend
  var legend = svg
    .selectAll(".legend")
    .data(colors)
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) {
      return "translate(30," + i * 19 + ")";
    });

  legend
    .append("rect")
    .attr("x", width - 12)
    .attr("width", 18)
    .attr("height", 18)
    .style("fill", function(d, i) {
      return colors.slice().reverse()[i];
    });

  legend
    .append("text")
    .attr("x", width + 10)
    .attr("y", 9)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d, i) {
      switch (i) {
        case 0:
          return "Rain";
        case 1:
          return "Snow";
      }
    });

  // Add a title
  svg
    .append("text")
    .attr("x", width / 2)
    .attr("y", 0 - margin.top / 2.5)
    .attr("text-anchor", "middle")
    .attr("class", "title")
    .text("Average Yearly Days With Precipitation");
}
