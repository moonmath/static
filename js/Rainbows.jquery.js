// Requires d3

$(function ($) {
    if (typeof ($) !== 'function'
        || typeof ($.Rainbows) !== 'undefined'
    ) {
        return;
    }

    $.Rainbows = $.extend($.Rainbows || {},  {

        __init__: function () {
            $.Rainbows.timeCache = new Date(Date.now()).toISOString().split(":")[0];
            $.Rainbows.sectors();
        },

        sectors: function () {
            var ctx = $.Rainbows;
            ctx.svg = d3.select("svg#sectors");
            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                height = +ctx.svg.attr("height") - margin.top - margin.bottom;
            ctx.g = ctx.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            ctx.width = +ctx.svg.attr("width") - margin.left - margin.right;
            var parseTime = d3.timeParse("%d-%b-%y");
            ctx.x = d3.scaleTime()
                .rangeRound([0, ctx.width]);
            ctx.y = d3.scaleLog()
                .rangeRound([height, 0]);

            d3.csv("data/rainbowVars.csv?v=" + ctx.timeCache, function (d, i, columns) {
                var date = Date.parse(d.date),
                    lightGreen = parseFloat(d.lightGreen),
                    lightOrange = parseFloat(d.lightOrange),
                    lightRed = parseFloat(d.lightRed),
                    blue = parseFloat(d.blue),
                    green = parseFloat(d.green),
                    orange = parseFloat(d.orange),
                    red = parseFloat(d.red),
                    violet = parseFloat(d.violet),
                    yellow = parseFloat(d.yellow);
                uv = parseFloat(d.uv);
                d.dateNum = (typeof date === 'number') ? date : d.date;
                d.lightGreen = (typeof lightGreen === 'number') ? lightGreen : d.lightGreen;
                d.lightOrange = (typeof lightOrange === 'number') ? lightOrange : d.lightOrange;
                d.lightRed = (typeof lightRed === 'number') ? lightRed : d.lightRed;
                d.blue = (typeof blue === 'number') ? blue : d.blue;
                d.green = (typeof green === 'number') ? green : d.green;
                d.orange = (typeof orange === 'number') ? orange : d.orange;
                d.red = (typeof red === 'number') ? red : d.red;
                d.violet = (typeof violet === 'number') ? violet : d.violet;
                d.yellow = (typeof yellow === 'number') ? yellow : d.yellow;
                d.uv = (typeof uv === 'number') ? uv : d.uv;
                count = -1;
                while (count < 6) {
                    var cString = count.toString();
                    d['gl' +cString]  = Math.pow(10, count);
                    d['gl' +cString + '_25']  = Math.pow(10, (count + 0.25));
                    d['gl' +cString + '_50']  = Math.pow(10, (count + 0.5));
                    d['gl' +cString + '_75']  = Math.pow(10, (count + 0.75));
                    count += 1;
                }
                return d;
            }, function (error, data) {
                ctx.price();
                if (error) throw error;
                ctx.x.domain(d3.extent(data, function (d) {
                    return d.dateNum;
                }));
                ctx.y.domain(d3.extent(data, function (d) {
                    return d.violet;
                }));
                count = -1;
                while (count < 6) {
                    var cString = count.toString();
                    ctx.gridLine('gl' + cString, data, 0.5);
                    ctx.gridLine('gl' + cString + '_25', data, 0.2);
                    ctx.gridLine('gl' + cString + '_50', data, 0.2);
                    ctx.gridLine('gl' + cString + '_75', data, 0.2);
                    count += 1;
                }
                ctx.sectorColoring('yellow', '#F6FF00', data)
                ctx.sectorColoring('lightGreen', '#86D40D', data)
                ctx.sectorColoring('green', '#17BE01', data)
                ctx.sectorColoring('red', '#FF008A', data)
                ctx.sectorColoring('lightRed', '#FF0000', data)
                ctx.sectorColoring('violet', '#0606CB', data)
                ctx.sectorColoring('blue', '#0078EF', data)
                ctx.sectorColoring('orange', '#F74A28', data)
                ctx.sectorColoring('lightOrange', '#FEA417', data)
                ctx.g.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "grid")
                    .call(
                        d3.axisBottom(ctx.x)
                        .tickSize(-ctx.width)
                    )
                    .select(".domain")
                    .remove();
                ctx.g.append("g")
                    .call(
                        d3.axisLeft(ctx.y)
                    )
                    .append("text")
                    .attr("fill", "#000")
                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "0.71em")
                    .attr("text-anchor", "end")
                    .text("Price ($)");
            });

        },

        price: function () {
            var ctx = $.Rainbows;
            d3.csv("data/allData.csv?v=" + ctx.timeCache, function(d, i, columns) {
              d.Date = Date.parse(d.Date);
              d.Close = parseFloat(d.Close);
              return d;
            }, function(error, data) {
                if (error) throw error;
                var ctx = $.Rainbows;
                var line = d3.line()
                    .x(function(d) { return ctx.x(d.Date); })
                    .y(function(d) { return ctx.y(d.Close); });
                ctx.g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-width", 0.5)
                    .attr("d", line);
            });
        },

        handleMouseOut: function(d, i) {
        },

        handleMouseOver: function(d, i, n) {
        },

        gridLine: function (lineName, data, width) {
            var ctx = $.Rainbows;
            try {
                ctx.g.append("path")
                    .datum(data)
                    .attr("fill", "none")
                    .attr("stroke", "black")
                    .attr("stroke-linejoin", "round")
                    .attr("stroke-linecap", "round")
                    .attr("stroke-opacity", 0.5)
                    .attr("stroke-width", width)
                    .attr("d",
                        d3.line()
                        .x(function (d) {
                            try {
                                return $.Rainbows.x(d.dateNum);
                            } catch (err) { }
                        })
                        .y(function (d) {
                            try {
                                return $.Rainbows.y(d[lineName]);
                            } catch (err) { }
                        })
                        .curve(d3.curveCatmullRom.alpha(0))
                    )
                    .on("mouseover", ctx.handleMouseOver)
                    .on("mouseout", ctx.handleMouseOut);
            } catch (err) {
                var foo = "bar"
            }
        },


        sectorColoring: function (colorName, color, data) {
            var ctx = $.Rainbows;
            try {
                ctx.g.append("path")
                    .datum(data)
                    .attr("class", color)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-opacity", 0.3)
                    .attr("stroke-width", 11)
                    .attr("d",
                        d3.line()
                        .x(function (d) {
                            try {
                                return $.Rainbows.x(d.dateNum);
                            } catch (err) { }
                        })
                        .y(function (d) {
                            try {
                                return $.Rainbows.y(d[colorName]);
                            } catch (err) { }
                        })
                        .curve(d3.curveCatmullRom.alpha(0))
                    )
                    .on("mouseover", ctx.handleMouseOver)
                    .on("mouseout", ctx.handleMouseOut);
            } catch(err) { }
        },

    });

    var ctx = $.Rainbows;
    $.Rainbows.__init__();
});
