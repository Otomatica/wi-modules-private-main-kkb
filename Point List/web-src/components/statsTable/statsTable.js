
import componentTemplate from './statsTable.html';
import moment from 'moment-timezone';
import angular from 'angular';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar', 'maStatistics', 'maEvents', 'maUserNotes', 'maTranslate']);
class statsTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar, maStatistics, maEvents, maUserNotes, maTranslate) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;
        this.maStatistics = maStatistics;
        this.maEvents = maEvents;
        this.maUserNotes = maUserNotes;
        this.maTranslate = maTranslate;

        this.$scope.$watch('$ctrl.points', (nV, oV) => {
            let newIds = nV && nV.map(x => x.id) || [];
            let oldIds = this.$scope.selectedStats && this.$scope.selectedStats.map(x => x.id) || [];
            let changed = (newIds.length != oldIds.length) || !newIds.every(id => oldIds.includes(id));
            changed && (this.$scope.selectedStats = nV.map(p => angular.copy(p)));
        }, true);

        $scope.$watchGroup([
            'showEvents',
            'showNotes',
            'dateBar.from',
            'dateBar.to',
            'selectedStats'
        ], this.getStats.bind(this, null));

        $scope.$watch('pie.values', (nV, oV) => {
            this.$scope.pie = this.$scope.pie || {};
            this.$scope.pie.chartValues = nV && nV.map(x => ({
                text: x.text, 
                value: x.value, 
                color: x.color,
                name: x.point.name,
                deviceName: x.point.deviceName,
                preset: x.preset,
                rollupType: x.rollupType
            }));
        }, true);

        $scope.formatTimestamp = (ts) => {
            const m = moment(ts);
            return m.format(this.$scope.$root.mangoDateFormats.dateTime);
        };

        $scope.greaterThan = (prop, val) => (item) => item[prop] > val;
    }

    addNote(event, point) {
        this.maUserNotes.addNote(event, 'Point', point.id).then(c => {
            //callback if needed
        }, err => {
            //rejection
        });
    };

    getStats() {
        this.$scope.selectedStats.forEach(point => {
            this.maStatistics.getStatisticsForXid(point.xid, {
                from: this.$scope.dateBar.from,
                to: this.$scope.dateBar.to,
                rendered: false
            }).then(stats => {
                stats.count = {rendered:stats.count, value:stats.count};
                point.stats = stats;
                this.$scope.showEvents && this.getEvents(point);
                this.$scope.showNotes && this.getNotes(point);
            });
        });
    }

    getEvents(point) {
        this.maEvents.buildQuery()
            .eq('eventType', 'DATA_POINT')
            .eq('referenceId1', point.id)
            .ge('activeTimestamp', this.$scope.dateBar.from.getTime())
            .lt('activeTimestamp', this.$scope.dateBar.to.getTime())
            .limit(0).query().then(events => point.stats.events = {rendered:events.$total, value:events.$total});
    }

    getNotes(point) {
        this.maUserNotes.buildQuery()
            .eq('commentType', 'POINT')
            .eq('referenceId', point.id)
            .ge('timestamp', this.$scope.dateBar.from.getTime())
            .lt('timestamp', this.$scope.dateBar.to.getTime())
            .limit(0).query().then(notes => point.stats.notes = {rendered:notes.$total, value:notes.$total});
    }

    $onInit() {
        this.$scope.query = {
            limit: 10,
            page: 1,
            order: 'deviceName',
            filter: ''
        };
    }

    removePoint(point) {
        let index = this.$scope.selectedStats.indexOf(point);
        this.points.splice(index, 1);
    }

    pieVal(point, stat, rollupTranslation, runTimeStat, count) {
        this.$scope.pie = this.$scope.pie || {};
        this.$scope.pie.values = this.$scope.pie.values || [];
        let preset = this.$scope.$root.dateRangePresets.find(x => x.type == this.$scope.dateBar.preset);
        preset = preset ? this.maTranslate.trSync(preset.translation, preset.translationArgs) : this.maTranslate.trSync('ui.app.dateRangePreset');
        let rollupText = this.maTranslate.trSync(rollupTranslation);
        
        if(runTimeStat) {
            !count && runTimeStat.forEach(x => {
                this.$scope.pie.values.push({
                    time: true,
                    key: x.value,
                    value: x.runtime,
                    text: point.formatLabel() + '(' + x.rendered + ') — ' + preset + ' — ' + rollupText,
                    point: point,
                    stat: runTimeStat,
                    preset: preset,
                    rollupType: rollupText,
                    color: point._textRenderer.values[x.value].color || this.randomColor()
                });
            });
            let countTr = this.maTranslate.trSync('ui.app.count');
            count && runTimeStat.forEach(x => {
                this.$scope.pie.values.push({
                    key: x.value,
                    rendered: x.starts,
                    value: x.starts,
                    text: point.formatLabel() + '(' + x.rendered + ') — ' + preset + ' — ' + countTr ,
                    point: point,
                    stat: runTimeStat,
                    preset: preset,
                    rollupType: countTr,
                    color: point._textRenderer.values[x.value].color || this.randomColor()
                });
            });
            return;
        }
        if(!stat || stat.value == undefined ) return;

        let color = undefined;
        let nonNumeric = point.dataType != 'NUMERIC';
        let nonNumericStat = stat == point.stats.start || stat == point.stats.first || stat == point.stats.last;
        if(nonNumeric && nonNumericStat)
            color = point._textRenderer && point._textRenderer.values[stat.value] && point._textRenderer.values[stat.value].color;

        this.$scope.pie.values.push({
            nonNumeric: color,
            rendered: stat.rendered,
            value: stat.value,
            text: point.formatLabel() + ' — ' + preset + ' — ' + rollupText,
            point: point,
            stat: stat,
            preset: preset,
            rollupType: rollupText,
            color: color || this.randomColor()
        });
    }

    removeVal(val) {
        let index = this.$scope.pie.values.indexOf(val);
        this.$scope.pie.values.splice(index, 1);
    }

    randomColor() {
        return '#'+(Math.random()*0xfff|0).toString(16);
    }

    updateColor() {
        this.$scope.pie.values = angular.copy(this.$scope.pie.values);
    }
}

export default {
    bindings: {
        points : '<?'
    },
    require: {},
    controller: statsTableController,
    template: componentTemplate
};