// Requires d3

$(function ($) {
    if (typeof ($) !== 'function'
        || typeof ($.Rainbows) !== 'undefined'
    ) {
        return;
    }

    $.Rainbows = $.extend($.Rainbows || {},  {

        _elems: {},
        horizontalGridLines: {},

        __init__: function () {
            var count = -1;
            while (count < 7) {
                var cString = count.toString();
                $.Rainbows.horizontalGridLines['gl' +cString]  = Math.pow(10, count);
                $.Rainbows.horizontalGridLines['gl' +cString + '_25']  = Math.pow(10, (count + 0.25));
                $.Rainbows.horizontalGridLines['gl' +cString + '_50']  = Math.pow(10, (count + 0.5));
                $.Rainbows.horizontalGridLines['gl' +cString + '_75']  = Math.pow(10, (count + 0.75));
                count += 1;
            }
            $.Rainbows.timeCache = new Date(Date.now()).toISOString().split(":")[0];
            $.Rainbows.set(
                'svg#r2017',
                "data/rainbow2017.csv",
                12,
                "#mm-calcs table tbody tr:nth-child(7) td:nth-child(6)"
            );
            $.Rainbows.set(
                'svg#r2012',
                "data/rainbowVars.csv",
                8,
                "#mm-calcs table tbody tr:nth-child(7) td:nth-child(11)"
            );
        },

        set: function (target, source, strokeWidth, cdprString) {
            $.Rainbows._elems[target] = {
                strokeWidth: strokeWidth,
                source: source,
                svg: d3.select(target),
                cdprString: cdprString
            };
            var slf = $.Rainbows._elems[target];
            var margin = {top: 20, right: 20, bottom: 30, left: 50},
                height = +slf.svg.attr("height") - margin.top - margin.bottom;
            slf.g = slf.svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");
            slf.width = +slf.svg.attr("width") - margin.left - margin.right;
            var parseTime = d3.timeParse("%d-%b-%y");
            slf.x = d3.scaleTime()
                .rangeRound([0, slf.width]);
            slf.y = d3.scaleLog()
                .rangeRound([height, 0]);
            d3.csv(source + "?v=" + slf.timeCache, function (d, i, columns) {
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
                d = $.extend(d, $.Rainbows.horizontalGridLines);
                return d;
            }, function (error, data) {
                $.Rainbows.setPrice(slf);
                if (error) throw error;
                slf.x.domain(d3.extent(data, function (d) {
                    return d.dateNum;
                }));
                slf.y.domain(d3.extent(data, function (d) {
                    return d.violet;
                }));
                count = -1;
                while (count < 6) {
                    var cString = count.toString();
                    $.Rainbows.setGridLine(slf,'gl' + cString, data, 0.5);
                    $.Rainbows.setGridLine(slf,'gl' + cString + '_25', data, 0.2);
                    $.Rainbows.setGridLine(slf,'gl' + cString + '_50', data, 0.2);
                    $.Rainbows.setGridLine(slf,'gl' + cString + '_75', data, 0.2);
                    count += 1;
                }
                $.Rainbows.setColors(slf, 'yellow', '#F6FF00', data)
                $.Rainbows.setColors(slf, 'lightGreen', '#86D40D', data)
                $.Rainbows.setColors(slf, 'green', '#17BE01', data)
                $.Rainbows.setColors(slf, 'red', '#FF008A', data)
                $.Rainbows.setColors(slf, 'lightRed', '#FF0000', data)
                $.Rainbows.setColors(slf, 'violet', '#0606CB', data)
                $.Rainbows.setColors(slf, 'blue', '#0078EF', data)
                $.Rainbows.setColors(slf, 'orange', '#F74A28', data)
                $.Rainbows.setColors(slf, 'lightOrange', '#FEA417', data)
                slf.g.append("g")
                    .attr("transform", "translate(0," + height + ")")
                    .attr("class", "grid")
                    .call(
                        d3.axisBottom(slf.x)
                        .tickSize(-slf.width)
                    )
                    .select(".domain");
                slf.g.append("g")
                    .call(
                        d3.axisLeft(slf.y).tickFormat(d3.format(",.2r"))
                    )
                    .append("text")
                    .attr("fill", "#000")
//                    .attr("transform", "rotate(-90)")
                    .attr("y", 6)
                    .attr("dy", "-1em")
                    .attr("dx", "20em")
                    .attr("text-anchor", "end")
                    .text("Price (USD) cast over CDPR: " + $(cdprString).text());
            });


        },

        setPrice: function (slf) {
            d3.csv("data/allData.csv?v=" + $.Rainbows.timeCache, function(d, i, columns) {
              d.Date = Date.parse(d.Date);
              d.Close = parseFloat(d.Close);
              return d;
            }, function(error, data) {
                if (error) throw error;
                var line = d3.line()
                    .x(function(d) { return slf.x(d.Date); })
                    .y(function(d) { return slf.y(d.Close); });
                slf.g.append("path")
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

        setGridLine: function (slf, lineName, data, width) {
            try {
                slf.g.append("path")
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
                                return slf.x(d.dateNum);
                            } catch (err) { }
                        })
                        .y(function (d) {
                            try {
                                return slf.y(d[lineName]);
                            } catch (err) { }
                        })
                        .curve(d3.curveCatmullRom.alpha(0))
                    )
                    .on("mouseover", $.Rainbows.handleMouseOver)
                    .on("mouseout", $.Rainbows.handleMouseOut);
            } catch (err) {
                var foo = "bar"
            }
        },

        setColors: function (slf, colorName, color, data) {
            try {
                slf.g.append("path")
                    .datum(data)
                    .attr("class", color)
                    .attr("fill", "none")
                    .attr("stroke", color)
                    .attr("stroke-opacity", 0.3)
                    .attr("stroke-width", slf.strokeWidth)
                    .attr("d",
                        d3.line()
                        .x(function (d) {
                            try {
                                return slf.x(d.dateNum);
                            } catch (err) { }
                        })
                        .y(function (d) {
                            try {
                                return slf.y(d[colorName]);
                            } catch (err) { }
                        })
                        .curve(d3.curveCatmullRom.alpha(0))
                    )
                    .on("mouseover", $.Rainbows.handleMouseOver)
                    .on("mouseout", $.Rainbows.handleMouseOut);
            } catch(err) { }
        }
    });

    var ctx = $.Rainbows;
    $.Rainbows.__init__();
});
