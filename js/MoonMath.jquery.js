// Requires d3

$(function ($) {
    if (typeof ($) !== 'function'
        || typeof ($.MoonMath) !== 'undefined'
    ) {
        return;
    }

    $.MoonMath = $.extend($.MoonMath || {},  {

        __init__: function () {
            $.MoonMath.timeCache = new Date(Date.now()).toISOString().split(":")[0];
            $.MoonMath.BuildMMTable();
            $.MoonMath.BuildSubTable();
        },

        BuildMMTable: function () {
            var ctx = $.MoonMath;
            d3.csv(
                "data/mmData.csv?v=" + ctx.timeCache,
                function(error, data) {
                    if (error){
                        throw error;
                    }
                    var sortAscending = true;
                    var table = d3.select('#mm-calcs').append('table')
                        .attr('class', 'table table-responsive table-striped');
                    var titles = d3.keys(data[0]);
                    var headers = table.append('thead').append('tr')
                        .selectAll('th')
                        .data(titles).enter()
                        .append('th')
                        .text(function (d) {
                    return d;
                })
                .on('click', function (d) {
                    headers.attr('class', 'header');
                    /*
                    if (sortAscending) {
                        rows.sort(function(a, b) { return b[d] < a[d]; });
                        sortAscending = false;
                        this.className = 'aes';
                    } else {
                        rows.sort(function(a, b) { return b[d] > a[d]; });
                        sortAscending = true;
                        this.className = 'des';
                    }
                    */

                });

            var rows = table.append('tbody').selectAll('tr')
                .data(data).enter()
                .append('tr');
            rows
                .selectAll('td')
                .data(function (d) {
                    return titles.map(function (k) {
                        return {
                            'value': d[k],
                            'name': k
                        };
                    });
                })
                .enter()
                .append('td')
                .attr('data-th', function (d) {
                    return d.name;
                })
                .text(function (d) {
                    return d.value;
                });
            });
        },

        BuildSubTable: function () {
            var ctx = $.MoonMath;
            d3.csv(
                "data/subData.csv?v=" + ctx.timeCache,
                function(error, data) {
                    if (error){
                        throw error;
                    }
                    var sortAscending = true;
                    var table = d3.select('#sub-calcs').append('table')
                        .attr('class', 'table table-responsive table-striped');;
                    var titles = d3.keys(data[0]);
                    var headers = table.append('thead').append('tr')
                        .selectAll('th')
                        .data(titles).enter()
                        .append('th')
                        .text(function (d) {
                    return d;
                })
                .on('click', function (d) {
                    headers.attr('class', 'header');
                    /*
                    if (sortAscending) {
                        rows.sort(function(a, b) { return b[d] < a[d]; });
                        sortAscending = false;
                        this.className = 'aes';
                    } else {
                        rows.sort(function(a, b) { return b[d] > a[d]; });
                        sortAscending = true;
                        this.className = 'des';
                    }
                    */

                });

            var rows = table.append('tbody').selectAll('tr')
                .data(data).enter()
                .append('tr');
            rows
                .selectAll('td')
                .data(function (d) {
                    return titles.map(function (k) {
                        return {
                            'value': d[k],
                            'name': k
                        };
                    });
                })
                .enter()
                .append('td')
                .attr('data-th', function (d) {
                    return d.name;
                })
                .text(function (d) {
                    return d.value;
                });
            });
        }
    });

    var ctx = $.MoonMath;
    $.MoonMath.__init__();
});
