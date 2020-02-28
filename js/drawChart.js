let svg = d3.select("svg"),
  margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 40
  },
  width = +svg.attr("width") - margin.left - margin.right,
  height = +svg.attr("height") - margin.top - margin.bottom;

let x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
  y = d3.scaleLinear().rangeRound([height, 0]);

// tooltip selection 
let tooltip = d3.select("body").append("div").attr("class", "toolTip");

// loading in the dataset using d3.csv and rearranging the data
d3.csv("data/dataset.csv", function (d) {
  d.internet = +d.internet;
  return d;
}, function (error, data) {
  if (error) throw error;

  //maps the piece of code to the according Axis.
  let xAxis = x.domain(data.map(function (d) {
    return d.age;
  }));
  let yAxis = y.domain([0, d3.max(data, function (d) {
    return d.internet;
  })]);




  // this piece of code appends g element to bar, this allows to group shapes
  let bar = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // draws the bottom axis and flips
  bar.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))



  // draws the left hand side axis
  bar.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(10, ))
    .append("text")
    .attr("y", 6)
    .text("internet");



  // this code draws out the bars
  bar.selectAll("bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", function (d) {
      return x(d.age);
    })
    .attr("y", function (d) {
      return y(d.internet);
    })
    //animating the bar loading. help from http://bl.ocks.org/alexanderGugel/8b42c782ce8862cfe5e6
    .transition()
    .delay(function (d, i) {
      return i * 210;
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(d.internet);
    });

  // allows to add hoverover tooltip, to see what the actual precentage is.
  bar.selectAll("rect")
    .on("mousemove", function (d) {
      tooltip
        .style("left", d3.event.pageX - 50 + "px")
        .style("top", d3.event.pageY - 70 + "px")
        .style("display", "inline-block")
        .html((d.internet) + "%");
    })
    .on("mouseout", function (d) {
      tooltip.style("display", "none");
    });

  // listening for a input to be changed.
  d3.select("input").on("change", change);



  function change() {
    // on checked the numbers are sorted ascending 
    let x0 = x.domain(data.sort(this.checked ?
          function (a, b) {
            console.log("1");
            return b.internet - a.internet;
          } :
          function (a, b) {
            console.log("2");
            return a.ageCode - b.ageCode;
          })
        .map(function (d) {
          return d.ageCode;
        }))
      .copy();


    svg.selectAll(".bar")
      .sort(function (a, b) {
        return x0(a.ageCode) - x0(b.ageCode);
      });


    let transition = svg.transition().duration(750),
      delay = function (d, i) {
        return i * 50;
      };

    transition.selectAll(".bar")
      .delay(delay)
      .attr("x", function (d) {
        return x0(d.ageCode);
      });

    // re-orders the dataset back to regular 
    x.domain(data.sort(this.checked ?
        function (a, b) {
          console.log("1");
          return b.internet - a.internet;
        } :
        function (a, b) {
          console.log("2");
          return a.ageCode - b.ageCode;
        })
      .map(function (d) {
        return d.age;
      }))

    // calling back the axis to re-order the ages to correct position
    transition.select(".axis.axis--x")
      .call(d3.axisBottom(x))
      .selectAll("g")
      .delay(delay);
  }

});