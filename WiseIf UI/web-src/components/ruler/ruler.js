const $inject = Object.freeze(['$scope', '$mdMedia','$element']);
class rulerController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
    }

    $onChanges(changes) {
        this.$element.empty();
        __non_webpack_require__(['d3'], d3 => this.createRuler(d3));
    }

    createRuler(d3) {
        let width = 250;
        let height = 40;
        let domain = [this.minValue, this.maxValue];
        let colors = [this.minColor, this.maxColor];

        /* Set up and initiate svg containers */
        let svg = d3.select(this.$element[0])
            .append("svg")
            .attr("width", width + 50)
            .attr("height", height)
            .append("g")
            .attr("transform", "translate(" + (width/2 + 25) + ", 25)");

        //Create the gradient
        svg.append("defs")
            .append("linearGradient")
            .attr("id", "legend-scale")
            .attr("x1", "0%").attr("y1", "0%")
            .attr("x2", "100%").attr("y2", "0%")
            .selectAll("stop") 
            .data(colors)                
            .enter().append("stop") 
            .attr("offset", (d,i) => i ) 
            .attr("stop-color", d => d );

        /*Draw the legend*/
        svg.append("rect")
            .attr("x", -width/2)
            .attr("y", 0)
            .attr("rx", 8/2)
            .attr("width", width)
            .attr("height", 8)
            .style("fill", "url(#legend-scale)");

        //Set scale for x-axis
        let xScale = d3.scaleLinear()
            .range([-width/2, width/2])
            .domain(domain);

        //Define x-axis
        let xAxis = d3.axisTop(xScale)
            .ticks(this.marksCount)
            .tickFormat(d =>  d + (this.unit || '') );

        svg.append("g")
            .call(xAxis);
    }

}
export default {
    bindings: {
        minValue: '<?',
        maxValue: '<?',
        minColor: '@?',
        maxColor: '@?',
        marksCount: '<?',
        unit: '@?'
    },
    designerInfo: {
        icon: 'linear_scale',
        attributes: {
            minValue: { defaultValue: 0 },
            maxValue: { defaultValue: 100 },
            minColor: { type: 'color', defaultValue: '#000000' },
            maxColor: { type: 'color', defaultValue: '#ffffff' },
            marksCount: { defaultValue: 4 }
        }
    },
    require: {},
    controller: rulerController
};