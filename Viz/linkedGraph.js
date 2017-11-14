var svg = d3.select("svg"),
        width = +svg.attr("width"),
        height = +svg.attr("height");

var backgroundLayer = svg.append('g');
var dataVizLayer = svg.append('g');
var UILayer = svg.append('g');

var color = d3.scaleOrdinal(d3.schemeCategory20);



var ChangeDataButton = UILayer.append("rect")
                            .attr("width", 120)
                            .attr("height", 50)
                            .on("click", function () { SwitchData(); });

var currentData = 0;

InitView("movies.json");

function SwitchData() {
    backgroundLayer.selectAll("*").remove();
    dataVizLayer.selectAll("*").remove();

    if (currentData == 0) {
        currentData = 1;
        InitView("movies2.json");
    }
    else {
        currentData = 0;
        InitView("movies.json");
    }
};

function InitView(jsonFile) {
    var simulation = d3.forceSimulation()
   .force("link", d3.forceLink().id(function (d) { return d.id; }))
   .force("charge", d3.forceManyBody())
   .force("center", d3.forceCenter(width / 2, height / 2));

    d3.json(jsonFile, function (error, graph) {
        if (error) throw error;
        var background = backgroundLayer.append("rect")
            .attr("width", width)
            .attr("height", height)
            .attr("opacity", "0")
            .on("click", function () { resetView(); });

        var link = dataVizLayer.append("g")
            .selectAll("link")
            .data(graph.links)
            .enter().append("line")
            .attr("stroke", "#696969")
            .attr("stroke-width", 1);

        var node = dataVizLayer.append("g")
            .selectAll("circle")
            .data(graph.nodes)
            .enter().append("circle")
            .attr("r", 5)
            .attr("fill", function (d) { return color(d.group); })
            .on("click", function (d) { click(d, this); })
            .call(d3.drag()
              .on("start", dragstarted)
              .on("drag", dragged)
              .on("end", dragended));


        node.append("title")
            .text(function (d) { return d.id; });

        simulation.nodes(graph.nodes).on("tick", ticked);

        simulation.force("link").links(graph.links);

        function ticked() {
            link
                .attr("x1", function (d) { return d.source.x; })
                .attr("y1", function (d) { return d.source.y; })
                .attr("x2", function (d) { return d.target.x; })
                .attr("y2", function (d) { return d.target.y; });

            node
                .attr("cx", function (d) { return d.x; })
                .attr("cy", function (d) { return d.y; });
        }

        function resetView() {
            link.attr("stroke", "#696969")
                .attr("stroke-width", 1)
                .attr("stroke-opacity", 1);

            node.attr("r", 5)
                .attr("fill", function (d) { return color(d.group); })
                .attr("opacity", 1);

        }

        function click(d, s) {
            node.attr("opacity", function (n) {
                if (d.id != n.id) return 0.3;
            });


            link.attr("stroke", function (x) {
                if (x.source.id == d.id || x.target.id == d.id) {
                    node.attr("opacity", function (n) {
                        if (x.source.id == n.id || x.target.id == n.id) return 1.0;
                        else return "opacity";
                    });
                    return "red";
                }
                else return "#696969";
            })
            .attr("stroke-opacity", function (x) {
                if (x.source.id == d.id || x.target.id == d.id) { return 1; }
                else return 0.3;
            })
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

    });
};

