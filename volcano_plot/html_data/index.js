/**
 * 
 * @returns d3 chart representing a volcano plot
 */
function volcanoPlot() {
    /** below are the variables used to track positioning of different chart components:
     

        width = 960,                                                                        // default for sizing
        height = 500,                                                                       // default for sizing
        margin = { top: 20, right: 20, bottom: 40, left: 50 },                              // default for sizing
        
        xColumn = "log2FoldChange",                                                         // TODO: name column in data file for plotting X-axis
        yColumn = "padj",                                                                   // TODO: name column in data file for plotting Y-axis
        
        xAxisLabel = d3.select("#plotxaxis").property("value"),                             // TODO: label for x axis                                                                                       
        yAxisLabel = d3.select("#plotyaxis").property("value"),                             // TODO: label for y axis
                                                                                            // x&y axis label currently have defaults established in html. moving to here requires some more work

        xAxisLabelOffset,                                                                   // offset for the label of the axis (not customizable)
        yAxisLabelOffset,
        
        xTicks,                                                                             // number of ticks on the axis (not customizable)
        yTicks,
        
        sampleID = "GeneId",                                                                  // TODO: named according to workflow. is column name for getting 'name' of each data point (which gene)       
        
        significanceThreshold = parseFloat(d3.select("#fdrthreshold").property("value")),   // significance threshold to colour by
        foldChangeThreshold = parseFloat(d3.select("#foldchange").property("value")),       // fold change level to colour by
                                                                                            // threshholds currently have default coming from html. more work to have them settable here
        
                                                                                            colorRange,                                                                         // colour range to use in the plot (probably deprecated)

        xScale = d3.scaleLinear(),                                                          // the values for the x-axes will be continuous
        yScale = d3.scaleLog(),                                                             // values for y-axis will be logarithmic
                                                                                            // both should be settable 
        plotTitle = d3.select('#plottitle').property("value"),
        
        plotDotSize = parseInt(d3.select("#plotdotsize").property("value")),
        plotDotTransparency = parseFloat(d3.select("#plotdotopacity").property("value")),
        
        acceptedColorXpos = d3.select("#acceptedxcolorpos").property("value"),
        acceptedColorXneg = d3.select("#acceptedxcolorneg").property("value"),
        rejectedColorX = d3.select("#rejectedxcolor").property("value"),
        rejectedColorY = d3.select("#rejectedycolor").property("value"),
        rejectedColorBoth = d3.select("#rejectedbothcolor").property("value");
    
     */
    
    // pretty much every var with a d3.select needs to have work done to make it settable according to workflow
    var width = 960,                                                                    
        height = 500,                                                                   
        margin = { top: 20, right: 20, bottom: 40, left: 50 },                          
        xColumn = "log2FoldChange",                                                     
        yColumn = "padj",                                                               
        xAxisLabel = d3.select("#plotxaxis").property("value"),
        yAxisLabel = d3.select("#plotyaxis").property("value"),
        xAxisLabelOffset, 
        yAxisLabelOffset,
        xTicks, 
        yTicks,
        sampleID = "GeneId", 
        significanceThreshold = parseFloat(d3.select("#fdrthreshold").property("value")), 
        foldChangeThreshold = parseFloat(d3.select("#foldchange").property("value")), 
        colorRange, 
        xScale = d3.scaleLinear(),
        yScale = d3.scaleLog(),
        plotTitle = d3.select('#plottitle').property("value"),
        plotDotSize = parseInt(d3.select("#plotdotsize").property("value")),
        plotDotTransparency = parseFloat(d3.select("#plotdotopacity").property("value")),
        acceptedColorXpos = d3.select("#acceptedxcolorpos").property("value"),
        acceptedColorXneg = d3.select("#acceptedxcolorneg").property("value"),
        rejectedColorX = d3.select("#rejectedxcolor").property("value"),
        rejectedColorY = d3.select("#rejectedycolor").property("value"),
        rejectedColorBoth = d3.select("#rejectedbothcolor").property("value");



    function chart(selection) {
        var innerWidth = width - margin.left - margin.right, 
            innerHeight = height - margin.top - margin.bottom; // set the size of the chart according to its container

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
            // append the svg object to the selection. svg object is what is exported as svg/png/pdf
            var svg = d3.select(this).append('svg')
                .attr('id', 'svg')
                .attr('height', height)
                .attr('width', width)
                //.style('color', 'white') // make background setting part of the 'advanced plot options' tab (not working?)
                .style('background-color', 'white')
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
            var thresholdLines = svg.append('g').attr('class', 'thresholdLines');

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

            d3.select('#apply').on('click', updatePlot);


            d3.select('#savesvg').on('click', exportSVG);

            // setup export btn
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
                        '<p style="fill: #666;font-weight: 700;font-size: 12px;">' +
                        '<strong>' + sampleID + '</strong>: ' + d[sampleID] + '<br/>' +
                        '<strong>' + xColumn + '</strong>: ' + d3.format('.2f')(d[xColumn]) + '<br/>' +
                        '<strong>' + yColumn + '</strong>: ' + d[yColumn] +
                        '</p>'
                    )
                    .style("top", (event.pageY - 5) + "px")
                    .style("left", (event.pageX + 20) + "px");
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

            /**
             * @deprecated
             * returned a css class name to use according to a data points position in relation to threshold lines
             */
            function circleClass(d) {
                if (d[yColumn] <= significanceThreshold && Math.abs(d[xColumn]) >= foldChangeThreshold) return 'dot sigfold';
                else if (d[yColumn] <= significanceThreshold) return 'dot sig';
                else if (Math.abs(d[xColumn]) >= foldChangeThreshold) return 'dot fold';
                else return 'dot';
            }

            /**
             * returns a color hex color according to a data points position in relation to threshold lines
             * hex color based on what the user has selected in 'advanced plot options' tab
             */
            function circleStyle(d) {
                // where color scheme toggle can be set
                // colors used should be able to be set by user
                //if (d[yColumn] <= significanceThreshold && Math.abs(d[xColumn]) >= foldChangeThreshold) return "#00ff00";//'green';
                if(d[yColumn] <= significanceThreshold && d[xColumn] >= foldChangeThreshold) return acceptedColorXpos;
                else if(d[yColumn] <= significanceThreshold && Math.abs(d[xColumn]) >= foldChangeThreshold) return acceptedColorXneg;
                else if (d[yColumn] <= significanceThreshold) return rejectedColorX; //"#ff0000"//'red';
                else if (Math.abs(d[xColumn]) >= foldChangeThreshold) return rejectedColorY; //'#cccccc';
                else return rejectedColorBoth; //'#000000';
            }

            function resetZoom() {
                var ease = d3.easePolyIn.exponent(4.0);
                svg.transition().duration(750)
                    .ease(ease)
                    .call(zoom.transform, d3.zoomIdentity);
            }

            /**
             * updates plot according to form values
             * steps:
             * 1. get form values
             * 2. reset relevant plot components
             * 3. redraw plot
             */
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
                acceptedColorXpos = d3.select("#acceptedxcolorpos").property("value");
                acceptedColorXneg = d3.select("#acceptedxcolorneg").property("value");
                rejectedColorX = d3.select("#rejectedxcolor").property("value");
                rejectedColorY = d3.select("#rejectedycolor").property("value");
                rejectedColorBoth = d3.select("#rejectedbothcolor").property("value");
                var genesToHighlist = d3.select('#highlightlistford3').each(function (p, j) {
                    console.log(`genes to highlight. p: ${p}, j: ${j}`);
                    d3.select(this)
                        .selectAll("li")
                        .each(function (ele, ctx) {
                            tempD = d3.select(this);
                            console.log('tempD.node().value', tempD.node().value);
                        })
                });

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
                    .style('fill', '#666')
                    .style('font-weight', '700')
                    .style('font-size', '12px')
                    .attr('transform', 'translate(' + width / 2 + ',' + (margin.bottom - 6) + ')')
                    .attr('text-anchor', 'middle')
                    .html(xAxisLabel || xColumn);
    
                gyLabel = gY.append('text')
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
                    .attr('r', plotDotSize) 
                    .attr('cx', function (d) { return xScale(d[xColumn]); })
                    .attr('cy', function (d) { return yScale(d[yColumn]); })
                    .style('fill', circleStyle)
                    .style('opacity', plotDotTransparency)
                    .on('mouseenter', tipEnter)
                    //.on("mousemove", tipMove)
                    .on('mouseleave', function (d) {
                        return tooltip.style('visibility', 'hidden');
                    });

                thresholdLines = svg.append('g').attr('class', 'thresholdLines');

                // add horizontal line at significance threshold
                thresholdLines.append("svg:line")
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

    // all functions below are used to set aspects of the plot

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