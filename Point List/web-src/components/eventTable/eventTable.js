import moment from 'moment-timezone';
import componentTemplate from './eventTable.html';
import './eventTable.css';

const $inject = Object.freeze(['$scope', '$mdMedia','$element', '$state', 'maUiDateBar', 'maTranslate', '$sanitize', 'maUserNotes', 'maEvents', 'wiUserNotesSocket', 'maPoint']);
class eventTableController {

    static get $inject() { return $inject; }
    static get $$ngIsClass() { return true; }

    constructor($scope, $mdMedia, $element, $state, maUiDateBar, Translate, $sanitize, maUserNotes, maEvents, wiUserNotesSocket, maPoint) {
        this.$scope = $scope;
        this.$mdMedia = $mdMedia;
        this.$element = $element;
        this.$state = $state;
        this.$scope.dateBar = maUiDateBar;
        this.Translate = Translate;
        this.$sanitize = $sanitize;
        this.maUserNotes = maUserNotes;
        this.maEvents = maEvents;
        this.wiUserNotesSocket = wiUserNotesSocket;
        this.maPoint = maPoint;

        this.$scope.$watch('$ctrl.points', (nV, oV) => this.pointIds = nV && nV.map(x => x.id));
    }

    $onInit() {
        this.$scope.query = {
            limit : 10,
            page : 1,
            order :  '-activeTimestamp',
            filter : ''
        };

        this.subscribeEvents();
        this.subscribeNotes();

        this.$scope.$maSubscribe('maWatchdog/LOGGED_IN', (event, maWatchdog) => {
            $timeout(() => this.refresh = !this.refresh, 5000);
        });
    }

    subscribeEvents() {
        this.maEvents.notificationManager.subscribe((event, mangoEvent) => {
            if(mangoEvent.id < 0) return;
            if(mangoEvent.eventType.eventType != 'DATA_POINT') return;

            let events = this.$scope.page.events && this.$scope.page.events.items;
            let query = this.$scope.query;
            if(!events) return;

            //decrase, increase alarmLevel counts
            let summaries = this.$scope.page.events.summaries;
            if(this.eventMatchesFilters(mangoEvent,true) && summaries) {
                (event.name === 'RETURN_TO_NORMAL' || event.name === 'DEACTIVATED') && summaries[mangoEvent.alarmLevel]--;
                event.name === 'RAISED' && summaries[mangoEvent.alarmLevel]++
            }

            if (this.eventMatchesFilters(mangoEvent)) {
                // if event is already in current page replace it
                this.removeEvent(mangoEvent.id, mangoEvent);
                if (event.name === 'RAISED' && !this.dateFilter) {
                    if (query.order === '-activeTimestamp' && (query.page-1)*query.limit === 0) {
                        // sorted by descending time and on the first page
                        events.unshift(mangoEvent);
                    } else if (query.order === 'activeTimestamp' && events.length < query.limit) {
                        // sorted by ascending time and on the last page
                        events.push(mangoEvent);
                    }
                    
                    // ensure that we don't have more items than items per page
                    if (events.length > query.limit) {
                        events.pop();
                    }
                    
                    this.$scope.page.events.total++;
                }

            } else {
                // event may no longer match the filters, remove it if so
                this.removeEvent(mangoEvent.id);
            }

        }, this.$scope, ['RAISED', 'ACKNOWLEDGED', 'RETURN_TO_NORMAL', 'DEACTIVATED']);
    }

    eventMatchesFilters(mangoEvent, summary) {
        if(!this.$scope.page.events.pointIds.includes(mangoEvent.eventType.referenceId1)) return false;
        if(summary) return true;

        if(this.acknowledged != 'any' && this.acknowledged != mangoEvent.acknowledged) return false;
        if(this.alarmLevel != 'any' && this.alarmLevel != mangoEvent.alarmLevel) return false;
        if(this.activeStatus == 'active' && !mangoEvent.active) return false;
        if(this.activeStatus == 'normal' && mangoEvent.active) return false;
        if(this.activeStatus == 'noRtn' && mangoEvent.rtnApplicable) return false;

        if(this.dateFilter) {
            let activeTs = mangoEvent.activeTimestamp;
            let rtnTs = mangoEvent.rtnTimestamp;
            let fromTime = this.$scope.engine.startDate.getTime();
            let toTime = this.$scope.engine.endDate.getTime();
            let condition1 = activeTs >= fromTime && activeTs < toTime;
            let condition2 = rtnTs >= fromTime && rtnTs < toTime;
            let condition3 = mangoEvent.active && activeTs < toTime; // TODO && mangoEvent.rtnApplicable 
            return condition1 || condition2 || condition3;
        }

        return true;
    }

    removeEvent(eventId, replacement) {
        let events = this.$scope.page.events && this.$scope.page.events.items;
        const index = events.findIndex(item => item.id === eventId);
        if (index >= 0) {
            let removed;
            if (replacement) {
                removed = events.splice(index, 1, replacement);
                replacement.point = removed[0].point;
            } else {
                removed = events.splice(index, 1);
            }
            return removed[0];
        }
    }

    subscribeNotes() {
        this.wiUserNotesSocket.notificationManager.subscribe((event, mangoNote) => {
            if(mangoNote.commentType != 'EVENT') return;
            let item = this.$scope.page.events.items.find(x => x.id == mangoNote.referenceId);
            if(!item) return;
            item.comments = item.comments || [];
            item.comments.push(mangoNote);
        }, this.$scope, ['create']);
    }

    formatDuration(duration) {
        if (duration < 1000) {
            return this.Translate.trSync('ui.time.milliseconds', [duration]);
        } else if (duration < 5000) {
            return this.Translate.trSync('ui.time.seconds', [Math.round(duration / 100) / 10]);
        } else if (duration < 60000) {
            return this.Translate.trSync('ui.time.seconds', [Math.round(duration / 1000)]);
        }
        return moment.duration(duration).humanize();
    }

    addNote($event, event) {
        this.maUserNotes.addNote($event, 'Event', event.id);
    }

    acknowledgeEvent(event) {
        event.$acknowledge();
    }

    filter(alarmLevel, activeStatus = 'active') {
        this.alarmLevel = alarmLevel;
        this.activeStatus = activeStatus;
        this.acknowledged = 'any';
        this.dateFilter = false;
    }

    getPoint(event) {
        if(event.point) return;
        event.point = this.maPoint.getById({id: event.eventType.referenceId1})
    }
}

export default {
    bindings: {
        disableDevicePopup: '<?',
        alarmLevel : '<?',
        activeStatus : '<?',
        acknowledged : '<?',
        pointQuery: '<?',
        points: '<?'
    },
    require: {},
    controller: eventTableController,
    template: componentTemplate
};