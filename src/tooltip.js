import { select } from 'd3';
/*
 * Creates tooltip with provided id that
 * floats on top of visualization.
 * Most styling is expected to come from CSS
 * so check out bubble_chart.css for more details.
 */
export function floatingTooltip(tooltipId, width) {
    // Local variable to hold tooltip div for
    // manipulation in other functions.
    var tooltip = select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', tooltipId)
        .style('pointer-events', 'none');

    // Set a width if it is provided.
    if (width) {
        tooltip.style('width', width);
    }

    // Initially it is hidden.
    hideTooltip();

    /*
     * Display tooltip with provided content.
     *
     * content is expected to be HTML string.
     *
     * event is d3.event for positioning.
     */
    function showTooltip(content, event) {
        tooltip.style('opacity', 1.0)
            .html(content);

        updatePosition(event);
    }

    /*
     * Hide the tooltip div.
     */
    function hideTooltip() {
        tooltip.style('opacity', 0.0);
    }

    /*
     * Figure out where to place the tooltip
     * based on d3 mouse event.
     */
    function updatePosition(event) {
        let xOffset = 20;
        let yOffset = 10;

        let tooltipWidth = tooltip.style('width');
        let tooltipHeight = tooltip.style('height');

        let wscrY = window.scrollY;
        let wscrX = window.scrollX;

        let curX = (document.all) ? event.clientX + wscrX : event.pageX;
        let curY = (document.all) ? event.clientY + wscrY : event.pageY;
        let ttleft = ((curX - wscrX + xOffset * 2 + tooltipWidth) > window.innerWidth) ?
            curX - tooltipWidth - xOffset * 2 : curX + xOffset;

        if (ttleft < wscrX + xOffset) {
            ttleft = wscrX + xOffset;
        }

        let tttop = ((curY - wscrY + yOffset * 2 + tooltipHeight) > window.innerHeight) ?
            curY - tooltipHeight - yOffset * 2 : curY + yOffset;

        if (tttop < wscrY + yOffset) {
            tttop = curY + yOffset;
        }

        tooltip
            .style('top', tttop + 'px')
            .style('left', ttleft + 'px');
    }

    return {
        showTooltip: showTooltip,
        hideTooltip: hideTooltip,
        updatePosition: updatePosition
    };
}
