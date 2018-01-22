/* Tooltip inspired by Jim Vallandingham
 * http://vallandingham.me/
 */

import { select } from 'd3';
/*
 * Creates tooltip with provided id that
 * floats on top of visualizations.
 * Most styling is expected to come from CSS
 */
export function floatingTooltip(tooltipId, width) {
    // Local variable to hold tooltip div for
    // manipulation in other functions.
    let tooltip = select('body')
        .append('div')
        .attr('class', 'tooltip')
        .attr('id', tooltipId)
        .style('pointer-events', 'none');

    // Set a width if it is provided.
    tooltip.style('width', width);


    // Initially it is hidden.
    hideTooltip();

    /*
     * Display tooltip with provided content
     * content is expected to be HTML string.
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

        let windowScrollY = window.scrollY;
        let windowScrollX = window.scrollX;

        let currentX = (document.all) ? event.clientX + windowScrollX : event.pageX;
        let currentY = (document.all) ? event.clientY + windowScrollY : event.pageY;
        let tooltipLeft = ((currentX - windowScrollX + xOffset * 2 + tooltipWidth) > window.innerWidth) ?
            currentX - tooltipWidth - xOffset * 2 : currentX + xOffset;

        if (tooltipLeft < windowScrollX + xOffset) {
            tooltipLeft = windowScrollX + xOffset;
        }

        let tooltipTop = ((currentY - windowScrollY + yOffset * 2 + tooltipHeight) > window.innerHeight) ?
            currentY - tooltipHeight - yOffset * 2 : currentY + yOffset;

        if (tooltipTop < windowScrollY + yOffset) {
            tooltipTop = currentY + yOffset;
        }

        tooltip
            .style('top', tooltipTop + 'px')
            .style('left', tooltipLeft + 'px');
    }

    return {
        showTooltip: showTooltip,
        hideTooltip: hideTooltip,
        updatePosition: updatePosition
    };
}
