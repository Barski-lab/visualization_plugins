function volcanoPlot() {
    var width = 960,
        height = 500,
        margin = { top: 20, right: 20, bottom: 40, left: 50 },
        xColumn, // name of the variable to be plotted on the axis
        yColumn,
        xAxisLabel = d3.select("#plotxaxis").property("value"),
        yAxisLabel = d3.select("#plotyaxis").property("value"),
        xAxisLabelOffset, // offset for the label of the axis
        yAxisLabelOffset,
        xTicks, // number of ticks on the axis
        yTicks,
        sampleID = "Gene",
        significanceThreshold = parseFloat(d3.select("#fdrthreshold").property("value")), // significance threshold to colour by
        foldChangeThreshold = parseFloat(d3.select("#foldchange").property("value")), // fold change level to colour by
        colorRange, // colour range to use in the plot
        xScale = d3.scaleLinear(), // the values for the axes will be continuous
        yScale = d3.scaleLog(),
        plotTitle = d3.select('#plottitle').property("value"),
        plotDotSize = parseInt(d3.select("#plotdotsize").property("value")),
        plotDotTransparency = parseFloat(d3.select("#plotdotopacity").property("value"));



    function chart(selection) {
        var innerWidth = width - margin.left - margin.right, // set the size of the chart within its container
            innerHeight = height - margin.top - margin.bottom;

        selection.each(function (data) {

            // set up the scaling for the axes based on the inner width/height of the chart and also the range
            // of value for the x and y axis variables. This range is defined by their min and max values as
            // calculated by d3.extent()
            xScale.range([0, innerWidth])
                .domain(d3.extent(data, function (d) { return d[xColumn]; }))
                .nice();

            // normally would set the y-range to [height, 0] but by swapping it I can flip the axis and thus
            // have -log10 scale without having to do extra parsing
            yScale.range([0, innerHeight])
                .domain(d3.extent(data, function (d) { return d[yColumn]; }))
                .nice(); // adds "padding" so the domain extent is exactly the min and max values

            /*
                        var zoom = d3.zoom()
                            .scaleExtent([1, 20])
                            .translateExtent([[0, 0], [width, height]])
                            .on('zoom', zoomFunction);
            */
            // append the svg object to the selection
            var svg = d3.select(this).append('svg')
                .attr('id', 'svg')
                .attr('height', height)
                .attr('width', width)
                .style('color', 'white') // make background setting part of the 'advanced plot options' tab
                .append('g')
                .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
            //                .call(zoom);

            // position the reset button and attach reset function
            d3.select('#resetBtn')
                .style('top', margin.top * 1.5 + 'px')
                .style('left', margin.left * 1.25 + 'px')
                .on('click', resetZoom);

            svg.append('defs').append('clipPath')
                .attr('id', 'clip')
                .append('rect')
                .attr('height', innerHeight)
                .attr('width', innerWidth);

            var curPlotTitle = svg.append("text")
                .attr('transform', 'translate(' + width / 2 + ',' + (margin.top - 25) + ')')
                //.attr("x", (width / 2))             
                //.attr("y", 0 - (margin.top / 2))
                .attr("text-anchor", "middle")  
                .style("font-size", "16px") 
                .style("text-decoration", "underline")  
                .text(plotTitle);
            // add the axes
            var xAxis = d3.axisBottom(xScale);
            var yAxis = d3.axisLeft(yScale)
                .ticks(5)
                .tickFormat(yTickFormat);

            var gX = svg.append('g')
                .attr('class', 'x axis')
                .attr('transform', 'translate(0,' + innerHeight + ')')
                .call(xAxis);

            var gxLabel = gX.append('text')
                //.attr('class', 'label')
                .style('fill', '#666')
                .style('font-weight', '700')
                .style('font-size', '12px')
                .attr('transform', 'translate(' + width / 2 + ',' + (margin.bottom - 6) + ')')
                .attr('text-anchor', 'middle')
                .html(xAxisLabel || xColumn);

            var gY = svg.append('g')
                .attr('class', 'y axis')
                .call(yAxis);

            var gyLabel = gY.append('text')
                //.attr('class', 'label')
                .style('fill', '#666')
                .style('font-weight', '700')
                .style('font-size', '12px')
                .attr('transform', 'translate(' + (0- margin.left / 1.25) + ',' + (height / 2) + ') rotate(-90)')
                .style('text-anchor', 'middle')
                .html(yAxisLabel || yColumn);

            // this rect acts as a layer so that zooming works anywhere in the svg. otherwise, if zoom is called on
            // just svg, zoom functionality will only work when the pointer is over a circle.
            // var zoomBox = svg.append('rect')
            //     .attr('class', 'zoom')
            //     .attr('height', innerHeight)
            //     .attr('width', innerWidth);

            var circles = svg.append('g')
                .attr('class', 'circlesContainer');

            /*            circles.selectAll(".dot")
                            .data(data)
                          .enter().append('circle')
                            .attr('r', 3)
                            .attr('cx', function(d) { return xScale(d[xColumn]); })
                            .attr('cy', function(d) { return yScale(d[yColumn]); })
                            .attr('class', circleClass)
                            .on('mouseenter', tipEnter)
                            .on("mousemove", tipMove)
                            .on('mouseleave', function(d) {
                               return tooltip.style('visibility', 'hidden');
                            });
            */
            var thresholdLines = svg.append('g')
                .attr('class', 'thresholdLines');

            // add horizontal line at significance threshold
            /*            thresholdLines.append("svg:line")
                            .attr('class', 'threshold')
                            .attr("x1", 0)
                            .attr("x2", innerWidth)
                            .attr("y1", yScale(significanceThreshold))
                            .attr("y2", yScale(significanceThreshold));
            
                        // add vertical line(s) at fold-change threshold (and negative fold-change)
                        [foldChangeThreshold, -1 * foldChangeThreshold].forEach(function(threshold) {
                            thresholdLines.append("svg:line")
                                .attr('class', 'threshold')
                                .attr("x1", xScale(threshold))
                                .attr("x2", xScale(threshold))
                                .attr("y1", 0)
                                .attr("y2", innerHeight);
                        });
            */

            d3.select('#apply')
                .on('click', updatePlot);


            d3.select('#savesvg')
                .on('click', exportSVG);

            d3.select("#generate").on("click", writeDownloadLinkV1);
        
            function writeDownloadLinkV1(){
                try {
                    var isFileSaverSupported = !!new Blob();
                    console.log(`is FileSaver Supported: ${isFileSaverSupported}`)
                } catch (e) {
                    alert("blob not supported");
                }
                
                
                var html = d3.select("#svg")
                    .attr("title", "test2")
                    .attr("version", 1.1)
                    .attr("xmlns", "http://www.w3.org/2000/svg")
                    .node().outerHTML; // .parentNode.innerHTML;
                
                if(!html){console.log('issue getting html: ', html);}
                //var tempTypeForDownlaod = "image/png";
                var blob = new Blob([html], {type: "image/svg+xml;charset=utf-8"}); 
                console.log('blob: ', blob);
                saveAs(blob, "exampleSVG.svg");
            }       

            var tooltip = d3.select("body")
                .append("div")
                .attr('class', 'tooltip');
                
            function tipEnter(d) {
                tooltip.style('visibility', 'visible')
                    .style('font-size', '11px')
                    .html(
                        '<p>' +
                        '<strong>' + sampleID + '</strong>: ' + d[sampleID] + '<br/>' +
                        '<strong>' + xColumn + '</strong>: ' + d3.format('.2f')(d[xColumn]) + '<br/>' +
                        '<strong>' + yColumn + '</strong>: ' + d[yColumn] +
                        '</p>'
                    );
            }

            function tipMove() {
                tooltip.style("top", (event.pageY - 5) + "px")
                    .style("left", (event.pageX + 20) + "px");
            }

            function yTickFormat(n) {
                return d3.format(".2r")(getBaseLog(10, n));
                function getBaseLog(x, y) {
                    return Math.log(y) / Math.log(x);
                }
            }

            function zoomFunction() {
                var transform = d3.zoomTransform(this);
                d3.selectAll('.dot')
                    .attr('transform', transform)
                    .attr('r', 3 / Math.sqrt(transform.k));
                gX.call(xAxis.scale(d3.event.transform.rescaleX(xScale)));
                gY.call(yAxis.scale(d3.event.transform.rescaleY(yScale)));
                svg.selectAll('.threshold')
                    .attr('transform', transform)
                    .attr('stroke-width', 1 / transform.k);
            }

            function circleClass(d) {
                if (d[yColumn] <= significanceThreshold && Math.abs(d[xColumn]) >= foldChangeThreshold) return 'dot sigfold';
                else if (d[yColumn] <= significanceThreshold) return 'dot sig';
                else if (Math.abs(d[xColumn]) >= foldChangeThreshold) return 'dot fold';
                else return 'dot';
            }
            function circleStyle(d) {
                // where color scheme toggle can be set
                // colors used should be able to be set by user
                if (d[yColumn] <= significanceThreshold && Math.abs(d[xColumn]) >= foldChangeThreshold) return 'green';
                else if (d[yColumn] <= significanceThreshold) return 'red';
                else if (Math.abs(d[xColumn]) >= foldChangeThreshold) return 'grey';
                else return 'black';
            }


            function resetZoom() {
                var ease = d3.easePolyIn.exponent(4.0);
                svg.transition().duration(750)
                    .ease(ease)
                    .call(zoom.transform, d3.zoomIdentity);
            }

            function updatePlot() {

                /* 
                    var ease = d3.easePolyIn.exponent(4.0);
                    svg.transition().duration(750)
                        .ease(ease)
                        .call(zoom.transform, d3.zoomIdentity);
                */

                // get values from form 
                plotDotSize = parseInt(d3.select("#plotdotsize").property("value"));
                plotDotTransparency = parseFloat(d3.select("#plotdotopacity").property("value"));
                foldChangeThreshold = parseFloat(d3.select("#foldchange").property("value"));
                significanceThreshold = parseFloat(d3.select("#fdrthreshold").property("value"));
                plotTitle = d3.select('#plottitle').property("value");
                xAxisLabel = d3.select("#plotxaxis").property("value");
                yAxisLabel = d3.select("#plotyaxis").property("value");

                // reset the plot
                thresholdLines.remove();
                circles.remove();
                curPlotTitle.remove();
                gxLabel.remove();
                gyLabel.remove();
                // redraw the plot

                curPlotTitle = svg.append("text")
                    .attr('transform', 'translate(' + width / 2 + ',' + (margin.top - 25) + ')')
                    .attr("text-anchor", "middle")  
                    .style("font-size", "16px") 
                    .style("text-decoration", "underline")  
                    .text(plotTitle);

                gxLabel = gX.append('text')
                    //.attr('class', 'label')
                    .style('fill', '#666')
                    .style('font-weight', '700')
                    .style('font-size', '12px')
                    .attr('transform', 'translate(' + width / 2 + ',' + (margin.bottom - 6) + ')')
                    .attr('text-anchor', 'middle')
                    .html(xAxisLabel || xColumn);
    
                gyLabel = gY.append('text')
                    //.attr('class', 'label')
                    .style('fill', '#666')
                    .style('font-weight', '700')
                    .style('font-size', '12px')
                    .attr('transform', 'translate(' + (0 - margin.left / 1.25) + ',' + (height / 2) + ') rotate(-90)')
                    .style('text-anchor', 'middle')
                    .html(yAxisLabel || yColumn);

                circles = svg.append('g')
                    .attr('class', 'circlesContainer');

                circles.selectAll(".dot")
                    .data(data)
                    .enter().append('circle')
                    .attr('r', plotDotSize) // SIZE OF DOT
                    .attr('cx', function (d) { return xScale(d[xColumn]); })
                    .attr('cy', function (d) { return yScale(d[yColumn]); })
                    //.attr('class', circleClass)
                    .style('fill', circleStyle)
                    .style('opacity', plotDotTransparency);
                    /*.on('mouseenter', tipEnter)
                    .on("mousemove", tipMove)
                    .on('mouseleave', function (d) {
                        return tooltip.style('visibility', 'hidden');
                    });*/

                thresholdLines = svg.append('g')
                    .attr('class', 'thresholdLines');
                // add horizontal line at significance threshold
                thresholdLines.append("svg:line")
                    //.attr('class', 'threshold') // styles instead of class
                    .style('stroke', '#333')
                    .style('stroke-dasharray', '5px 10px')
                    .style('stroke-opacity', '0.35')
                    .attr("x1", 0)
                    .attr("x2", innerWidth)
                    .attr("y1", yScale(significanceThreshold))
                    .attr("y2", yScale(significanceThreshold));

                // add vertical line(s) at fold-change threshold (and negative fold-change)
                [foldChangeThreshold, -1 * foldChangeThreshold].forEach(function (threshold) {
                    thresholdLines.append("svg:line")
                        //.attr('class', 'threshold') // styles instead of class
                        .style('stroke', '#333')
                        .style('stroke-dasharray', '5px 10px')
                        .style('stroke-opacity', '0.35')
                        .attr("x1", xScale(threshold))
                        .attr("x2", xScale(threshold))
                        .attr("y1", 0)
                        .attr("y2", innerHeight);
                });

            } 

            function exportSVG(){
                var svgEle = document.getElementById("svg");
                var serializer = new XMLSerializer();
                try{
                    var source = serializer.serializeToString(svgEle);
                

                    source = source.replace(/(\w+)?:?xlink=/g, 'xmlns:xlink='); // Fix root xlink without namespace

                    source = source.replace(/ns\d+:href/g, 'xlink:href'); // Safari NS namespace fix.


                    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
                        console.log('matched xmlns tag to format')
                        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
                    }
                    if (!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
                        console.log('matched svg tag to format')
                        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
                    }


                    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
                    var svgBlob = new Blob([preface, source], { type: "image/svg+xml;charset=utf-8" });
                    console.log('blob: ', svgBlob);
                    var svgUrl = URL.createObjectURL(svgBlob);
                    var downloadLink = document.createElement("a");
                    downloadLink.href = svgUrl;
                    downloadLink.download = "exampleSvg.svg";
                    document.body.appendChild(downloadLink);
                    //downloadLink.setAttribute('onClick', window.open(this.href,'popUpWindow'));//onclick = "window.open(this.href,'popUpWindow')"
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                }catch(err){console.log('Error creating serializer from svg element', 'svgElement: ', svgEle, 'err: ', err)}
            }        

            updatePlot();
        });
    }

    chart.width = function (value) {
        if (!arguments.length) return width;
        width = value;
        return chart;
    };

    chart.height = function (value) {
        if (!arguments.length) return height;
        height = value;
        return chart;
    };

    chart.margin = function (value) {
        if (!arguments.length) return margin;
        margin = value;
        return chart;
    };

    chart.xColumn = function (value) {
        if (!arguments.length) return xColumn;
        xColumn = value;
        return chart;
    };

    chart.yColumn = function (value) {
        if (!arguments.length) return yColumn;
        yColumn = value;
        return chart;
    };

    chart.xAxisLabel = function (value) {
        if (!arguments.length) return xAxisLabel;
        xAxisLabel = value;
        return chart;
    };

    chart.yAxisLabel = function (value) {
        if (!arguments.length) return yAxisLabel;
        yAxisLabel = value;
        return chart;
    };

    chart.xAxisLabelOffset = function (value) {
        if (!arguments.length) return xAxisLabelOffset;
        xAxisLabelOffset = value;
        return chart;
    };

    chart.yAxisLabelOffset = function (value) {
        if (!arguments.length) return yAxisLabelOffset;
        yAxisLabelOffset = value;
        return chart;
    };

    chart.xTicks = function (value) {
        if (!arguments.length) return xTicks;
        xTicks = value;
        return chart;
    };

    chart.yTicks = function (value) {
        if (!arguments.length) return yTicks;
        yTicks = value;
        return chart;
    };

    chart.significanceThreshold = function (value) {
        if (!arguments.length) return significanceThreshold;
        significanceThreshold = value;
        return chart;
    };

    chart.foldChangeThreshold = function (value) {
        if (!arguments.length) return foldChangeThreshold;
        foldChangeThreshold = value;
        return chart;
    };

    chart.colorRange = function (value) {
        if (!arguments.length) return colorRange;
        colorRange = value;
        return chart;
    };

    chart.sampleID = function (value) {
        if (!arguments.length) return sampleID;
        sampleID = value;
        return chart;
    };
    
    chart.plotTitle = function (value) {
        if (!arguments.length) return plotTitle;
        plotTitle = value;
        return chart;
    };

    return chart;
}