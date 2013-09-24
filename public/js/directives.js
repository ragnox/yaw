'use strict';

/* Directives */


angular.module('yawApp.directives', []).directive('map', function ($location,socket) {

    return {
        restrict: 'E',
        scope: {
            val: '=',
            grouped: '='
        },
        link: function (scope, element, attrs) {

            socket.on("cs:update", function(d,k,m) {
                console.log('cs:updated');
                console.log(d);


                if(!angular.equals(scope.cs, d)) {
                    scope.cs = d;
                }

            });

            scope.$watch("cs", function (newV, oldV) {

                    if(newV == null || angular.isUndefined(newV)) {
                        return;
                    }

                    console.log('emit' + newV);
                    socket.emit("cs:update", scope.cs, function(a,b) {

                        console.log('cs:update emitted');
                        console.log(a);
                        console.log(b);
                    });
                }, true);


// The SVG container
            var width  = 960,
                height = 500;

            var color = d3.scale.category20c();


            var projection = d3.geo.orthographic()
                .scale(300)
                .translate([width / 2, height / 2])
                .clipAngle(90);

            var path = d3.geo.path()
                .projection(projection);

            var sx = d3.scale.linear()
                .domain([0, width])
                .range([-180, 180]);

            var sy = d3.scale.linear()
                .domain([0, height])
                .range([90, -90]);

            var pan = function(a,b) {
                svg.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");

            };

            var x, y, s,m0,o0,m1,o1;
            var dragstart, drag, ds;


            var dragBehavior = d3.behavior.drag()
                .on("dragstart", dragstart = function() {
                    var m = d3.mouse(this);
                    var proj = projection.rotate();
                    m0 = [m[0] || d3.event.sourceEvent.pageX, m[1] || d3.event.sourceEvent.pageY];
                    o0 = [-proj[0],-proj[1]];
                })
                .on("drag", drag = function() {
                    var m = d3.mouse(this);
                    if (m0) {
                        var m1 = [m[0] || d3.event.sourceEvent.pageX, m[1] || d3.event.sourceEvent.pageY],
                            o1 = [o0[0] + (m0[0] - m1[0]), o0[1] + (m1[1] - m0[1])];
                        projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
//                    path = d3.geo.path().projection(projection);
                    try {
                        d3.selectAll("path").attr("d", path);
                    } catch(e) {
//                        console.log(e);
                    }
                });

            var svg = d3.select("body").append("svg")
                .on("mousemove", function(e,f,d,h) {
                    var p = d3.mouse(this);
                    var e = d3.event;

                    if(e.metaKey) {
                        if(ds) {
                            drag.apply(this);
                        } else {
                            ds = true;
                            dragstart.apply(this);
                        }
                    } else {
                        ds = false;
                        x=p[0];
                        y=p[1];
                    }
                })
                .attr("width", width)
                .attr("height", height)
                .call(d3.behavior.zoom().on("zoom", pan))
                .call(dragBehavior)
                .append('g');

            var border = svg.append("path")
                .attr("class", "border");


            var tooltip = d3.select(element[0]).append("div")
                .attr("class", "tooltip");

            queue()
                .defer(d3.json, "json/world-110m.json")
                .defer(d3.tsv, "json/world-country-names.tsv")
                .defer(d3.json, "json/cities.json")
                .await(ready);

            function ready(error, world, names, points) {

                var countries = topojson.feature(world, world.objects.countries).features,
                    neighbors = topojson.neighbors(world.objects.countries.geometries);
                    var i = -1,
                    n = countries.length;

//                scope.countries = countries;

                countries.forEach(function(d) {
                    var tryit = names.filter(function(n) { return d.id == n.id; })[0];
                    if (typeof tryit === "undefined"){
                        d.name = "Undefined";
                        console.log(d);
                    } else {
                        d.name = tryit.name;
                    }
                });

                var country = svg.selectAll(".country").data(countries);

                country
                    .enter()
                    .insert("path")
                    .attr("class", "country")
                    .attr("title", function(d,i) { return d.name; })
                    .attr("d", path)
                    .style("stroke", function(d, i) {
                        return color(i);
                    })
                    .on("mouseenter", function(d,i) {
                        d3.select(this).style("opacity", "0.2");
//                        console.log(d);
                    })
                    .on("mouseleave", function(d,i) {
                        if(scope.cs[d.name]) {

                            d3.select(this).style("opacity", "0.1");
                        } else {

                            d3.select(this).style("opacity", "1.0");
                        }
//                        console.log(e);
                    })
                ;

                function polygon(ring) {
                    var polygon = [ring];
                    ring.push(ring[0]); // add closing coordinate
                    if (d3.geo.area({type: "Polygon", coordinates: polygon}) > 2 * Math.PI) ring.reverse(); // fix winding order
                    return polygon;
                }
                //Show/hide tooltip
                scope.cs = {};
                scope.p = [];
                country
                    .on("mousemove", function(d,i) {

                        if(d3.event.ctrlKey) {
                            delete scope.cs[d.name];

                        }
                        if(d3.event.shiftKey) {
                            scope.cs[d.name] = d;

                            name = d.name;

                            var p = [];
                            angular.forEach(scope.cs, function(c) {
                                if(c.name == d.name) {
                                    country = c;
                                    p[c.id]=1;
                                }
                            });

                            var selectionBoundary = topojson.mesh(world, p, function(a, b) { return a !== b; }),
                            selection = {type: "MultiPolygon", coordinates: selectionBoundary.coordinates.map(polygon)};

                            border.attr("d", path(selection));
                        }
                        else {

                        }
                        scope.country = d.name;
                        scope.$apply(function(f) {
//                            console.log(f);
                        });


//                        $location.path('' + d.name);

                        tooltip
                            .classed("hidden", false)
//                            .attr("style", "right: 2em; top: 2em;")
                            .html(d.name);
                    })
                    .on("mouseout",  function(d,i) {
                        tooltip.classed("hidden", true)
                    });



            }
        }
    };
});