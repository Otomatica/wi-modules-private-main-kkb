
import componentTemplate from './eventTimeLine.html';
import * as bryntum from './../../../web/lib/scheduler-3.0.4/scheduler.module.min.js';
import moment from 'moment-timezone';
import angular from 'angular';

import './eventTimeLine.css';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', '$interval', 'maUiDateBar', 'maEvents', 'maUserNotes', 'maTranslate', 'maUiSettings', 'maCssInjector', '$mdBottomSheet', 'wiUserNotesSocket']);
class eventTimeLineController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, $interval, maUiDateBar, maEvents, maUserNotes, maTranslate, maUiSettings, maCssInjector, $mdBottomSheet, wiUserNotesSocket) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$interval = $interval;
        this.$scope.dateBar = maUiDateBar;
        this.maEvents = maEvents;
        this.maUserNotes = maUserNotes;
        this.maTranslate = maTranslate;
        this.maUiSettings = maUiSettings;
        this.maCssInjector = maCssInjector;
        this.$mdBottomSheet = $mdBottomSheet;
        this.wiUserNotesSocket = wiUserNotesSocket;

        this.notRealTimePresets = ['YEAR_SO_FAR', 'PREVIOUS_DAY', 'PREVIOUS_WEEK', 'PREVIOUS_MONTH', 'PREVIOUS_YEAR'];
        this.disableRealtime = !this.$scope.dateBar.preset || this.notRealTimePresets.includes(this.$scope.dateBar.preset);
    }

    $onInit() {
        this.setLocale();
        this.injectCss();
        this.subscribeEvents();
        this.subscribeNotes();

        this.$scope.$maSubscribe('maWatchdog/LOGGED_IN', (event, maWatchdog) => {
            $timeout(() => this.getEvents(), 5000);
        });
    }

    init() {
        this.initEngine();
        this.changeMoveInterval();
        this.$scope.$watchGroup(['$ctrl.acknowledged','$ctrl.alarmLevel','$ctrl.activeStatus'], this.getEvents.bind(this, null));
        this.$scope.$watch('$ctrl.points', (nV, oV) => {
            if(nV == oV) return;
            if(nV.length != oV.length) return this.getEvents();
            let newIds = nV.map(x => x.id);
            let oldIds = oV.map(x => x.id);
            !newIds.every(id => oldIds.includes(id)) && this.getEvents();
        }, true);

        this.$scope.$watch('dateBar.preset', (nV, oV) => {
            if(nV == oV) return;
            this.disableRealtime = !nV || this.notRealTimePresets.includes(nV);
            this.getEvents();
        });

        this.$scope.$watchGroup(['dateBar.from','dateBar.to'], (nV, oV) => {
            if(nV == oV || this.$scope.dateBar.preset) return;
            this.getEvents();
        });
    }

    $onDestroy() {
        this.$scope.engine.destroy();
        this.$interval.cancel(this.timer);
        this.$mdBottomSheet.hide();
    }

    highlight(element, schEvent, color) {
        let engine = this.$scope.engine;
        color = color || (schEvent ? this.calculateColor(schEvent.acknowledged, schEvent.active) : 'primary');
        let selector = 'wi-' + color + '-highlight';

        element && element.classList.remove(selector);
        this.promise = new Promise(resolve => {
            window.setTimeout(() => {
                if(engine.isDestroyed) return;
                element = element || engine.element.querySelector('[data-event-id="'+schEvent.id+'"]');
                element && element.classList.add(selector);
            }, 0);
        });
    }

    zoomToSpan(span) {
        this.lastSpan = span || this.lastSpan;
        if(!this.lastSpan) return;
        let left = this.$scope.engine.scrollLeft;
        this.$scope.engine.zoomToSpan(this.lastSpan);
        this.mode && (this.$scope.engine.scrollLeft = left);
    }

    subscribeEvents() {
        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            if(mangoEvent.id < 0) return;
            if(mangoEvent.eventType.eventType != 'DATA_POINT') return;
            let engine = this.$scope.engine;
            if(!engine) return;

            let schEvent = engine.eventStore.getById(mangoEvent.id);
            let filterMatch = this.eventMatchesFilters(mangoEvent);

            if(schEvent && !filterMatch) {
                engine.events = engine.events.filter(x => x.id != mangoEvent.id);
                this.filterResources();
                this.totalUnAcknowledged = engine.events.filter(x => !x.acknowledged).length;
                return;
            }

            if(engine && filterMatch) {
                let newEvent = this.formatEventforScheduler(mangoEvent);
                schEvent && Object.assign(schEvent, newEvent)
                if(!schEvent) {
                    engine.eventStore.add(newEvent);
                    this.filterResources();
                }
                this.highlight(null, newEvent);
                this.totalUnAcknowledged = engine.events.filter(x => !x.acknowledged).length;
            }
        }, this.$scope, ['RAISED', 'ACKNOWLEDGED', 'RETURN_TO_NORMAL', 'DEACTIVATED']);
    }

    subscribeNotes() {
        this.wiUserNotesSocket.notificationManager.subscribe((event, mangoNote) => {
            if(mangoNote.commentType != 'EVENT') return;
            let schEvent = this.$scope.engine.events.find(x => x.id == mangoNote.referenceId);
            if(!schEvent) return;
            schEvent.maEvent.comments = schEvent.maEvent.comments || [];
            schEvent.maEvent.comments.push(mangoNote);
            schEvent.active && (schEvent.endDate = new Date()) //fix highlight not working for active events
            this.highlight(null, schEvent, 'comment'); 
        }, this.$scope, ['create']);
    }

    eventMatchesFilters(mangoEvent) {
        if(!this.points.find(p => p.id == mangoEvent.eventType.referenceId1)) return false;

        if(this.acknowledged != 'any' && this.acknowledged != mangoEvent.acknowledged) return false;
        if(this.alarmLevel != 'any' && this.alarmLevel != mangoEvent.alarmLevel) return false;
        if(this.activeStatus == 'active' && !mangoEvent.active) return false;
        if(this.activeStatus == 'normal' && mangoEvent.active) return false;
        if(this.activeStatus == 'noRtn' && mangoEvent.rtnApplicable) return false; 

        let activeTs = mangoEvent.activeTimestamp;
        let rtnTs = mangoEvent.rtnTimestamp;
        let fromTime = this.$scope.engine.startDate.getTime();
        let toTime = this.$scope.engine.endDate.getTime();

        let condition1 = activeTs >= fromTime && activeTs < toTime;
        let condition2 = rtnTs >= fromTime && rtnTs < toTime;
        let condition3 = mangoEvent.active && activeTs < toTime; // TODO && mangoEvent.rtnApplicable 

        return condition1 || condition2 || condition3;
    }

    openBottomSheet(eventRecord) {
        let me = this;
        me.$scope.acknowledge = (eventRecord) => {
            !eventRecord.acknowledged && eventRecord.maEvent.$acknowledge().then(e => {
                me.$mdBottomSheet.hide();
            });
        };

        me.$scope.addNote = (event, eventRecord) => {
            me.maUserNotes.addNote(event, 'Event', eventRecord.id).then(c => me.$mdBottomSheet.hide(), err => {});
        };

        me.$mdBottomSheet.show({
            controller: function () {
                this.parent = me.$scope;
                this.eventRecord = eventRecord;
                this.point = me.points.find(x => x.id == eventRecord.resourceId);
                this.showDialog = (tab) => {
                    me.$mdBottomSheet.hide().then( () => me.$scope.$root.popupPoint(null, this.point, tab) );
               }
            },
            parent: me.$element[0],
            controllerAs: '$ctrl',
            disableParentScroll: true,
            bindToController: true,
            clickOutsideToClose: true,
            escapeToClose: true,
            template: 
            `<md-bottom-sheet class="md-list wi-bottom-sheet" style="bottom: 80px; padding: 16px; position:fixed;">
                <div layout="column" style="max-width: none;"
                    class="b-sch-event-tooltip b-widget b-container b-panel b-popup b-tooltip b-floating b-visible-scrollbar b-chrome b-focus-trapped b-text-content b-html b-resize-monitored">
                    <div class="b-panel-content b-popup-content b-tooltip-content b-content-element">
                        ${me.$scope.engine.features.eventTooltip.tooltip.html}
                    </div>
                    <div layout="column" layout-gt-sm="row">
                        <a flex="100" flex-gt-sm="33" class="md-button md-primary md-raised" ng-style="{'background-color': $ctrl.eventRecord.acknowledged ? 'silver' : '#8BC34A'}" ng-click="$ctrl.parent.acknowledge($ctrl.eventRecord)">
                            <md-icon style="margin-top: -2px;">done</md-icon>
                            <span ma-tr="events.acknowledge"></span>
                        </a>
                        <a flex="100" flex-gt-sm="33" class="md-button md-warn md-raised" ng-click="$ctrl.parent.addNote($event, $ctrl.eventRecord)">
                            <md-icon style="margin-top: -2px;">speaker_notes</md-icon>
                            <span ma-tr="notes.addNote"></span>
                        </a>
                        <a flex="100" flex-gt-sm="33" class="md-button md-accent md-raised" ng-click="$ctrl.showDialog('events')">
                            <md-icon style="margin-top: -2px;">alarm</md-icon>
                            <span ng-bind="$ctrl.point.formatLabel()"></span>
                        </a>
                        <a flex="100" flex-gt-sm="33" class="md-button md-primary md-raised" ng-click="$ctrl.showDialog('chart')">
                            <md-icon style="margin-top: -2px;">trending_up</md-icon>
                            <span ng-bind="$ctrl.point.formatLabel()"></span>
                        </a>
                    </div>
                </div>
            </md-bottom-sheet>`
        }).then(() => {
            //hide
            me.$scope.engine.clearEventSelection && me.$scope.engine.clearEventSelection();
        }).catch(() => {
            //cancel
            me.$scope.engine.clearEventSelection && me.$scope.engine.clearEventSelection();
        });
    }

    acknowledgeAll() {
        let unAcknowledgedIds = this.$scope.engine.events.filter(x => !x.acknowledged).map(x => x.id);
        let rqlQuery = this.maEvents.buildQuery().in('id', unAcknowledgedIds).toString();
        this.maEvents.acknowledgeViaRql({rqlQuery}, null).$promise.then((data) => {});
    }

    createQuery(start, end) {
        if(!this.points.length) return;
        let pointIds = this.points.map(p => p.id.toString());
        let eventQuery = this.maEvents.buildQuery();
        if(this.acknowledged != 'any') eventQuery.eq('acknowledged', this.acknowledged);
        if(this.alarmLevel != 'any') eventQuery.eq('alarmLevel', this.alarmLevel);

        if(this.activeStatus == 'active') eventQuery.eq('active', true);
        if(this.activeStatus == 'normal') eventQuery.eq('active', false);
        if(this.activeStatus == 'noRtn') eventQuery.eq('rtnApplicable', false);

        return eventQuery.eq('eventType', 'DATA_POINT')
            .limit(500)
            .sort('-activeTimestamp')
            .in('referenceId1', pointIds)
            .or()
                .and()
                .ge('activeTimestamp', start.getTime())
                .lt('activeTimestamp', end.getTime())
            .up()
                .and()
                .ge('rtnTimestamp', start.getTime())
                .lt('rtnTimestamp', end.getTime())
            .up()
                .and()
                .eq('active', true)
                .eq('rtnApplicable', true)
                .lt('activeTimestamp', end.getTime())
    }

    getEvents() {
        let engine = this.$scope.engine;

        this.totalUnAcknowledged = 0;
        let selectedEventId = engine.selectedEvents.length && engine.selectedEvents[0].id;

        engine.events = [];
        this.zoomToSpan({
            startDate: this.$scope.dateBar.from,
            endDate: this.disableRealtime ? this.$scope.dateBar.to : new Date(this.$scope.dateBar.to.getTime() + 30 * 1000),
            rightMargin: 30
        });

        let devices = this.points.map(p => p.deviceName);
        let uniqueDevices = devices.filter((v, i, a) => a.indexOf(v) === i);
        let sameDevice = uniqueDevices.length <= 1;
        this.points.forEach(p => p.label = sameDevice ? p.name : p.formatLabel());

        engine.resources = this.points;
        let eventQuery = this.createQuery(this.lastSpan.startDate, this.lastSpan.endDate);
        eventQuery && eventQuery.query().then(events => {
            engine.events = events.map(e => this.formatEventforScheduler(e));
            this.filterResources();
            this.totalUnAcknowledged = engine.events.filter(x => !x.acknowledged).length;
            selectedEventId && engine.selectEvent(engine.events.find(x => x.id == selectedEventId));
            engine.restartInitialAnimation('slide-from-left');
        });
    }

    calculateColor(ack, active) {
        if(ack) return active ? 'orange' : 'green';
        return active ? 'red' : 'yellow';
    }

    formatEventforScheduler(mangoEvent) {
        return {
            id: mangoEvent.id,
            name: mangoEvent.message,
            resourceId: mangoEvent.eventType.referenceId1,
            startDate: new Date(mangoEvent.activeTimestamp),
            endDate: new Date(mangoEvent.activeTimestamp + (!mangoEvent.rtnApplicable ? 1000 : mangoEvent.duration )),
            eventColor: this.calculateColor(mangoEvent.acknowledged, mangoEvent.active),
            iconCls: 'b-fa b-fa-flag alarm-flag '+ mangoEvent.alarmLevel,
            acknowledged: mangoEvent.acknowledged,
            active: mangoEvent.active,
            rtnApplicable: mangoEvent.rtnApplicable,
            rtnMessage: mangoEvent.rtnMessage,
            maEvent: mangoEvent
        }
    }

    changeMoveInterval() { //update durations && endDate && currentTimeLine
        this.$interval.cancel(this.timer);
        this.timer = this.$interval(() => this.moveScheduler(), 100);
    }

    moveScheduler() {
        let now = new Date();

        let second = now.getSeconds();
        if(second == this.lastSecond || second % 5) return;
        this.lastSecond = now.getSeconds();

        let engine = this.$scope.engine;
        engine.features.timeRanges.updateCurrentTimeLine();

        engine.events.forEach(e => {
            if(e.active) {
                e.endDate = now;
                this.highlight(null, e);
            }
        });

        if(this.realtime && !this.disableRealtime) {
            let headerSelector = this.mode ? '.b-grid-subgrid-locked' : '.b-schedulerheader';
            let timeHeader = engine.element.querySelector(headerSelector);
            timeHeader && this.highlight(timeHeader);

            let diff = this.$scope.dateBar.to.getTime() - this.$scope.dateBar.from.getTime();

            this.zoomToSpan({
                startDate: new Date(now.getTime() - diff),
                endDate: new Date(now.getTime() + 30 * 1000),
                rightMargin: 30
            });

            if(engine.selectedEvents.length) {
                let activeEventId =  engine.selectedEvents[0].id;
                let closeBottomSheet = engine.events.find(x => x.endDate < engine.startDate && x.id == activeEventId);
                closeBottomSheet && this.$mdBottomSheet.hide();
            }

            engine.events = engine.events.filter(x => x.endDate >= engine.startDate);
            this.filterResources();
        }
    }

    filterResources() {
        let engine = this.$scope.engine;
        let filtered = engine.resourceStore.filtered;
        if(!this.filter) return filtered && engine.resourceStore.clearFilters();

        let eventResources = engine.events.map(x => x.resourceId);
        let uniqEventResources = eventResources.filter((v, i, a) => a.indexOf(v) === i);

        if(!filtered) {
            engine.resourceStore.filter(x => uniqEventResources.includes(x.id));
            this.mode && engine.subGrids.normal.refreshFakeScroll();
            return;
        }

        let newResource = !uniqEventResources.every(x => engine.resources.find(y => y.id == x));
        let removedResorce = !engine.resources.every(x => uniqEventResources.includes(x.id) );
        if(newResource || removedResorce) {
            engine.resourceStore.clearFilters();
            engine.resourceStore.filter(x => uniqEventResources.includes(x.id));
            this.mode && engine.subGrids.normal.refreshFakeScroll();
        }
    }

    initEngine() {
        this.$scope.engine && this.$scope.engine.destroy();
        this.$scope.engine = new bryntum.Scheduler({
            appendTo   : this.$element[0].querySelector('.sch-container'),
            readOnly   : true,
            height: '100%',
            mode       : this.mode ? 'vertical' : 'horizontal',
            selectionMode: {
                cell: false,
                row: false
            },
            displayDateFormat: this.shortDateTimeSecondsFormat,
            eventLayout : this.mode ? 'mixed' : 'stack',
            eventStyle  : 'border',
            features   : {
                eventTooltip : {
                    template : ({eventRecord, startClockHtml, endClockHtml}) => {
                        let level = this.maEvents.levels.find(x => x.key == eventRecord.maEvent.alarmLevel);
                        let start = eventRecord.maEvent.activeTimestamp;
                        let end =  eventRecord.maEvent.rtnTimestamp || new Date().getTime();
                        return `<dt>
                                    <i class="fa fa-lg ${level.classes}"></i>
                                    <span>${this.maTranslate.trSync(level.translation)}</span>
                                </dt>
                                <dl>${eventRecord.name}</dl>
                                ${eventRecord.maEvent.comments ? 
                                        eventRecord.maEvent.comments.map(c => 
                                            '<dt><i class="b-icon b-fa b-fa-fw b-fa-comment-lines"></i><span> <strong>' + 
                                                c.comment + '</strong> (' + c.username + ' - ' + moment(c.timestamp).format(this.shortDateTimeSecondsFormat) + 
                                            ')</span></dt>'
                                        ).join('') : ''
                                }
                                <dt>${startClockHtml}</dt>
                                <dt>
                                    ${eventRecord.active ?
                                        this.maTranslate.trSync('common.active') : 
                                        (!eventRecord.rtnApplicable ? 
                                            this.maTranslate.trSync('common.nortn') + ' (' + this.maTranslate.trSync('ui.app.instantaneous')  + ')' 
                                            : endClockHtml)
                                    }
                                    ${eventRecord.rtnMessage ? eventRecord.rtnMessage + ' ('+ moment.duration(end-start).humanize() + ')' : ''}
                                </dt>
                                <dl>
                                    ${eventRecord.acknowledged ? 
                                        this.maTranslate.trSync('ui.app.acknowledgedByAt', [(eventRecord.maEvent.acknowledgedByUsername || ''), moment(eventRecord.maEvent.acknowledgedTimestamp).format(this.shortDateTimeSecondsFormat)]) : 
                                        this.maTranslate.trSync('ui.app.unAcknowledged')
                                    }
                                </dl>`;
                    }
                },
                //stripe: true,
                //nonWorkingTime : true, weekends
                group: false,
                timeRanges : {
                    currentDateFormat: this.timeSecondsFormat,
                    updateCurrentTimeLineInterval: 60 * 1000 *60, //1 hour for not change automatically
                    showCurrentTimeLine : true
                },
                regionResize: !this.mode,
                contextMenu : {
                    processHeaderItems : () => false,
                    processCellItems   : () => false
                }
            },
            listeners: {
                timelineViewportResize: ({source}) => {
                    if(this.mode) return;
                    source.timeAxisViewModel.availableSpace = source.timeAxisSubGrid.width;
                    this.zoomToSpan();
                },
                navigate: () => this.$scope.engine.clearFocus(),
                eventClick: ({eventRecord}) => this.openBottomSheet(eventRecord)
            },
            resourceColumns : {
                columnWidth : 250,
                fitWidth: false,
                fillWidth: false,
                headerRenderer : ({ resourceRecord }) => resourceRecord.label
            },
            columns    : [
                { 
                    type : 'resourceInfo',
                    text : this.maTranslate.trSync('ui.app.dataPoint'), 
                    field : 'label',
                    width : 250, 
                    showImage : false,
                    hidden: true,
                    responsiveLevels:{ 
                        small: { hidden: true },
                        '*': { hidden: false }
                    } 
                }
            ],
            responsiveLevels : {
                small  : 550,
                normal : '*'
            },
            barMargin: 10,
            rowHeight: 50,
            zoomOnMouseWheel: false,
            zoomOnTimeAxisDoubleClick: false,
            useInitialAnimation : 'fade-in',
            forceFit: true,
            scrollable: {overflowX:this.mode, overflowY:!this.mode}
        });
    }

    injectCss() {
        //TODO user theme names not working
        this.isDark = this.maUiSettings.themes[this.maUiSettings.activeTheme].dark;
        const styleDefault = document.querySelector('head > link[ma-style-name="bryntum-default"]');
        const styleDark = document.querySelector('head > link[ma-style-name="bryntum-dark"]');
        let changeStyle = (this.isDark && styleDefault) || (!this.isDark && styleDark);
        let noStyle = !(styleDefault || styleDark);

        if (!noStyle && !changeStyle) return this.init();

        if (changeStyle) { 
            let oldStyles = this.isDark ? styleDefault : styleDark;
            oldStyles.parentNode.removeChild(oldStyles);
        }

        let theme = this.isDark ? 'dark' : 'default';
        let path = '/modules/pointList/web/lib/scheduler-3.0.4/scheduler.' + theme + '.css'
        this.maCssInjector.injectLink(path, 'bryntum-' + theme, null, true);
        const linkElement = document.querySelector('head > link[ma-style-name="bryntum-' + theme + '"]');
        linkElement.addEventListener("load", () => this.init());
    }

    setLocale() {
        this.shortDateFormat = moment.localeData().longDateFormat('l');
        this.timeSecondsFormat = moment.localeData().longDateFormat('LTS');
        this.shortDateTimeSecondsFormat = this.shortDateFormat + ' ' + this.timeSecondsFormat; 

        this.schLocale = this.$scope.$root.User.locale;
        this.schLocale = this.schLocale.toLowerCase().includes('tr') ? 'Tr' : 'En';

        if(this.schLocale == 'Tr' && !bryntum.LocaleManager._locales['Tr']) {
            window.bryntum = window.bryntum || {};
            window.bryntum.locales = {};
            window.bryntum.locales.Tr = {
                ResourceInfoColumn : {
                    //TODO data event s 
                    eventCountText : (data) => `${data} ${this.maTranslate.trSync('ui.app.events')}`
                },
                GridBase : {
                    noRows : this.maTranslate.trSync('ui.components.noItemsToList')
                },
                DateHelper: {
                    locale: "tr-Tr",
                    shortWeek: "H",
                    shortQuarter: "Ç",
                    week: "Hafta",
                    weekStartDay: 1,
                    unitNames: [
                        {single: "milisaniye", plural: "milisaniye", abbrev: "ms"},
                        {single: "saniye", plural: "saniye", abbrev: "sn"},
                        {single: "dakika", plural: "dakika", abbrev: "dk"},
                        {single: "saat", plural: "saat", abbrev: "sa"},
                        {single: "gün", plural: "gün", abbrev: "g"},
                        {single: "hafta", plural: "hafta", abbrev: "h"},
                        {single: "ay", plural: "ay", abbrev: "a"},
                        {single: "çeyrek", plural: "çeyrek", abbrev: "ç"},
                        {single: "yıl", plural: "yıl", abbrev: "y"}
                    ],
                    unitAbbreviations: [
                        ["mil"],
                        ["s", "sec"],
                        ["m", "min"],
                        ["h", "hr"],
                        ["d"],
                        ["w", "wk"],
                        ["mo", "mon", "mnt"],
                        ["q", "quar", "qrt"],
                        ["y", "yr"]
                    ],
                    parsers: {
                        l  : this.shortDateFormat,
                        LTS: this.timeSecondsFormat
                    }
                }
            };

            bryntum.LocaleManager.registerLocale('Tr', { desc : 'Türkçe', locale : window.bryntum.locales.Tr} );
        }

        let hourFormat = this.schLocale == 'Tr' ? 'ddd D.M' : 'ddd M/D';
        let minuteFormat = this.schLocale == 'Tr' ? 'ddd D.M LT' : 'ddd M/D LT';
        bryntum.PresetManager.allRecords.filter(x => x.name == 'Minutes').forEach(y => y.headers[0].dateFormat = minuteFormat);
        bryntum.PresetManager.allRecords.filter(x => x.name == 'Hours').forEach(y => y.headers[0].dateFormat = hourFormat);
        bryntum.LocaleManager.applyLocale(this.schLocale, false, true);
    }
}

export default {
    bindings: {
        alarmLevel : '<?',
        activeStatus : '<?',
        acknowledged : '<?',
        points : '<?',
        overviewSetting: '<?'
    },
    require: {},
    controller: eventTimeLineController,
    template: componentTemplate
};