///
/// Copyright 2015-2016 Red Hat, Inc. and/or its affiliates
/// and other contributors as indicated by the @author tags.
///
/// Licensed under the Apache License, Version 2.0 (the "License");
/// you may not use this file except in compliance with the License.
/// You may obtain a copy of the License at
///
///    http://www.apache.org/licenses/LICENSE-2.0
///
/// Unless required by applicable law or agreed to in writing, software
/// distributed under the License is distributed on an "AS IS" BASIS,
/// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
/// See the License for the specific language governing permissions and
/// limitations under the License.
///

/// <reference path="../metricsPlugin.ts"/>
/// <reference path="../../includes.ts"/>

module HawkularMetrics {

  export class HawkularAlertsManager implements IHawkularAlertsManager {
    constructor(private HawkularAlert: any,
      private $q: ng.IQService,
      private $log: ng.ILogService,
      private $moment: any,
      private ErrorsManager: IErrorsManager) {
    }

    private static createQueryParams(criteria): any {
      let queryParams = {};
      if (criteria) {
        _.forEach(Object.keys(AlertCriteriaEnum), (key) => {
          if (AlertCriteriaEnum.hasOwnProperty(key.toString()) && AlertCriteriaEnum[key].value) {
            queryParams[key.toString()] = AlertCriteriaEnum[key].value;
          }
        });
      }
      return queryParams;
    }

    public queryAlerts(criteria: IHawkularAlertCriteria): ng.IPromise<IHawkularAlertQueryResult> {
      let alertList = [];
      let headers;

      /* Format of Alerts:

       alert: {
       type: 'THRESHOLD' or 'AVAILABILITY',
       avg: Average value based on the evalSets 'values',
       start: The time of the first data ('dataTimestamp') in evalSets,
       threshold: The threshold taken from condition.threshold,
       end: The time when the alert was sent ('ctime')
       }

       */

      const queryParams = HawkularAlertsManager.createQueryParams(criteria);
      Object.freeze(queryParams);

      return this.HawkularAlert.Alert.query(queryParams, (serverAlerts: any, getHeaders: any) => {

        headers = getHeaders();
        let momentNow = this.$moment();

        for (let i = 0; i < serverAlerts.length; i++) {
          let serverAlert = serverAlerts[i];
          let consoleAlert: any = serverAlert;

          consoleAlert.id = serverAlert.id;

          consoleAlert.triggerId = serverAlert.triggerId;

          if (serverAlert.evalSets && serverAlert.evalSets[0] && serverAlert.evalSets[0][0]) {
            consoleAlert.dataId = serverAlert.evalSets[0][0].condition.dataId;
          }

          consoleAlert.end = serverAlert.ctime;

          let sum: number = 0.0;
          let count: number = 0.0;

          if (serverAlert.evalSets) {

            if (serverAlert.context.triggerType !== 'Event') {

              for (let j = 0; j < serverAlert.evalSets.length; j++) {
                let evalItem = serverAlert.evalSets[j][0];

                if (!consoleAlert.start && evalItem.dataTimestamp) {
                  consoleAlert.start = evalItem.dataTimestamp;
                }

                if (!consoleAlert.threshold && evalItem.condition.threshold) {
                  consoleAlert.threshold = evalItem.condition.threshold;
                }

                if (!consoleAlert.type && evalItem.condition.type) {
                  consoleAlert.type = evalItem.condition.type;
                }

                let momentAlert = this.$moment(consoleAlert.end);

                if (momentAlert.year() === momentNow.year()) {
                  consoleAlert.isThisYear = true;
                  if (momentAlert.dayOfYear() === momentNow.dayOfYear()) {
                    consoleAlert.isToday = true;
                  }
                }

                if (undefined !== evalItem.rate) {
                  // handle rate conditions
                  sum += evalItem.rate;
                } else {
                  // handle 'value' conditions and also compare conditions ('value1')
                  sum += ((undefined !== evalItem.value) ? evalItem.value : evalItem.value1);
                }
                count++;
              }

              consoleAlert.avg = sum / count;
              consoleAlert.durationTime = consoleAlert.end - consoleAlert.start;

            } else {
              let evalItem = serverAlert.evalSets[0][0];
              let event = evalItem.value;
              consoleAlert.message = event.context.Message;
            }
          }

          alertList.push(consoleAlert);
        }
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise.then((): IHawkularAlertQueryResult => {
        return {
          alertList: alertList,
          headers: headers
        };
      });
    }

    public getAlert(alertId: string): ng.IPromise<IAlert> {
      return this.HawkularAlert.Alert.get({ alertId: alertId }).$promise;
    }

    public queryActionsHistory(criteria?: IHawkularActionCriteria): ng.IPromise<any> {
      const queryParams = HawkularAlertsManager.createQueryParams(criteria);
      Object.freeze(queryParams);
      if (criteria) {
        queryParams['thin'] = criteria.thin;
      } else {
        queryParams['thin'] = true;
      }

      return this.HawkularAlert.Action.queryHistory(queryParams, (serverActionsHistory: any, getHeaders: any) => {
        return {
          actionsList: serverActionsHistory,
          headers: getHeaders()
        };
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise;
    }

    public resolveAlerts(resolvedAlerts: any): ng.IPromise<any> {
      return this.HawkularAlert.Alert.resolvemany(resolvedAlerts, {}).$promise;
    }

    public addNote(alertNote: any): ng.IPromise<any> {
      return this.HawkularAlert.Alert.note(alertNote).$promise;
    }

    public ackAlerts(ackAlerts: any): ng.IPromise<any> {
      return this.HawkularAlert.Alert.ackmany(ackAlerts, {}).$promise;
    }

    public existTrigger(triggerId: TriggerId): any {
      return this.HawkularAlert.Trigger.get({ triggerId: triggerId }).$promise;
    }

    public getTrigger(triggerId: TriggerId): any {
      let deferred = this.$q.defer();
      let trigger = {};

      this.HawkularAlert.Trigger.get({ triggerId: triggerId }).$promise.then((triggerData) => {
        trigger['trigger'] = triggerData;
        return this.HawkularAlert.Dampening.query({ triggerId: triggerId }).$promise;
      }).then((dampeningData) => {
        trigger['dampenings'] = dampeningData;
        return this.HawkularAlert.Conditions.query({ triggerId: triggerId }).$promise;
      }).then((conditionData) => {
        trigger['conditions'] = conditionData;
        deferred.resolve(trigger);
      });

      return deferred.promise;
    }

    public getTriggerConditions(triggerId: TriggerId): ng.IPromise<any> {
      return this.HawkularAlert.Conditions.query({ triggerId: triggerId }).$promise;
    }

    public createTrigger(fullTrigger: any, errorCallback: any): ng.IPromise<void> {

      let triggerDefaults = {
        description: 'Created on ' + Date(),
        firingMatch: 'ALL',
        autoResolveMatch: 'ALL',
        enabled: true,
        autoResolve: true,
        actions: {}
      };

      let trigger = angular.extend(triggerDefaults, fullTrigger.trigger);

      return this.HawkularAlert.Trigger.save(trigger).$promise.then((savedTrigger) => {

        let dampeningPromises = [];
        for (let i = 0; fullTrigger.dampenings && i < fullTrigger.dampenings.length; i++) {
          if (fullTrigger.dampenings[i]) {
            let dampeningPromise = this.HawkularAlert.Dampening.save({ triggerId: savedTrigger.id },
              fullTrigger.dampenings[i]).$promise.then(null, (error) => {
                return this.ErrorsManager.errorHandler(error, 'Error creating dampening.', errorCallback);
              });
            dampeningPromises.push(dampeningPromise);
          }
        }

        let firingConditions = [];
        let autoResolveConditions = [];
        for (let j = 0; fullTrigger.conditions && j < fullTrigger.conditions.length; j++) {
          if (fullTrigger.conditions[j]) {
            if (fullTrigger.conditions[j].triggerMode && fullTrigger.conditions[j].triggerMode === 'AUTORESOLVE') {
              autoResolveConditions.push(fullTrigger.conditions[j]);
            } else {
              // A condition without triggerMode is treated as FIRING
              firingConditions.push(fullTrigger.conditions[j]);
            }
          }
        }

        let conditionPromises = [];
        if (firingConditions.length > 0) {
          let conditionPromise = this.HawkularAlert.Conditions.save({
            triggerId: savedTrigger.id,
            triggerMode: 'FIRING'
          },
            firingConditions).$promise.then(null, (error) => {
              return this.ErrorsManager.errorHandler(error, 'Error creating firing conditions.', errorCallback);
            });
          conditionPromises.push(conditionPromise);
        }
        if (autoResolveConditions.length > 0) {
          let conditionPromise = this.HawkularAlert.Conditions.save({
            triggerId: savedTrigger.id,
            triggerMode: 'AUTORESOLVE'
          },
            autoResolveConditions).$promise.then(null, (error) => {
              return this.ErrorsManager.errorHandler(error, 'Error creating autoresolve conditions.', errorCallback);
            });
          conditionPromises.push(conditionPromise);
        }

        return this.$q.all(Array.prototype.concat(dampeningPromises, conditionPromises));
      });

    }

    public deleteTrigger(triggerId: TriggerId): ng.IPromise<void> {
      return this.HawkularAlert.Trigger.delete({ triggerId: triggerId }).$promise;
    }

    public updateTrigger(fullTrigger: any, errorCallback: any, backupTrigger?: any): ng.IPromise<any> {

      let emailPromise = this.addEmailAction(fullTrigger.trigger.actions.email[0]).then(() => {
        if (angular.equals(fullTrigger.trigger, backupTrigger.trigger) || !fullTrigger.trigger) {
          return;
        }
        return this.HawkularAlert.Trigger.put({ triggerId: fullTrigger.trigger.id }, fullTrigger.trigger).$promise;
      }, (error) => {
        return this.ErrorsManager.errorHandler(error, 'Error saving email action.', errorCallback);
      });

      let triggerId = fullTrigger.trigger.id;

      let dampeningPromises = [];
      for (let i = 0; fullTrigger.dampenings && i < fullTrigger.dampenings.length; i++) {
        if (fullTrigger.dampenings[i] && !angular.equals(fullTrigger.dampenings[i], backupTrigger.dampenings[i])) {
          let dampeningId = fullTrigger.dampenings[i].dampeningId;
          let dampeningPromise = this.HawkularAlert.Dampening.put({ triggerId: triggerId, dampeningId: dampeningId },
            fullTrigger.dampenings[i]).$promise.then(null, (error) => {
              return this.ErrorsManager.errorHandler(error, 'Error saving dampening.', errorCallback);
            });

          dampeningPromises.push(dampeningPromise);
        }
      }

      let firingConditions = [];
      let autoResolveConditions = [];
      for (let j = 0; fullTrigger.conditions && j < fullTrigger.conditions.length; j++) {
        if (fullTrigger.conditions[j]) {
          if (fullTrigger.conditions[j].triggerMode && fullTrigger.conditions[j].triggerMode === 'AUTORESOLVE') {
            autoResolveConditions.push(fullTrigger.conditions[j]);
          } else {
            // A condition without triggerMode is treated as FIRING
            firingConditions.push(fullTrigger.conditions[j]);
          }
        }
      }

      let conditionPromises = [];
      if (firingConditions.length > 0) {
        let conditionPromise = this.HawkularAlert.Conditions.save({
          triggerId: triggerId,
          triggerMode: 'FIRING'
        },
          firingConditions).$promise.then(null, (error) => {
            return this.ErrorsManager.errorHandler(error, 'Error creating firing conditions.', errorCallback);
          });
        conditionPromises.push(conditionPromise);
      }
      if (autoResolveConditions.length > 0) {
        let conditionPromise = this.HawkularAlert.Conditions.save({
          triggerId: triggerId,
          triggerMode: 'AUTORESOLVE'
        },
          autoResolveConditions).$promise.then(null, (error) => {
            return this.ErrorsManager.errorHandler(error, 'Error creating autoresolve conditions.', errorCallback);
          });
        conditionPromises.push(conditionPromise);
      }

      return this.$q.all(Array.prototype.concat(emailPromise, dampeningPromises, conditionPromises));
    }

    public queryTriggers(criteria: IHawkularTriggerCriteria): ng.IPromise<IHawkularTriggerQueryResult> {
      let triggerList = [];
      let headers;
      const queryParams = HawkularAlertsManager.createQueryParams(criteria);
      Object.freeze(queryParams);

      return this.HawkularAlert.Trigger.query(queryParams, (serverTriggers: any, getHeaders: any) => {

        headers = getHeaders();
        triggerList.push(serverTriggers);
      }, (error) => {
        this.$log.debug('querying data error', error);
      }).$promise.then((): IHawkularTriggerQueryResult => {
        return {
          triggerList: triggerList,
          headers: headers
        };
      });
    }

    private getEmailAction(email: EmailType): ng.IPromise<void> {
      return this.HawkularAlert.Action.get({
        pluginId: 'email',
        actionId: email
      }).$promise;
    }

    private createEmailAction(email: EmailType): ng.IPromise<void> {
      return this.HawkularAlert.Action.save({
        actionPlugin: 'email',
        actionId: email,
        description: 'Created on ' + Date(),
        to: email
      }).$promise;
    }

    public addEmailAction(email: EmailType): ng.IPromise<void> {
      return this.getEmailAction(email).then((promiseValue: any) => {
        return promiseValue;
      }, (reason: any) => {
        // Create a default email action
        if (reason.status === 404) {
          this.$log.debug('Action does not exist, creating one');
          return this.createEmailAction(email);
        }
      });
    }

    public updateAction(email: EmailType): ng.IPromise<void> {
      return this.HawkularAlert.Action.put({
        actionPlugin: 'email',
        actionId: email,
        description: 'Created on ' + Date(),
        to: email
      }).$promise;
    }
  }

  _module.service('HawkularAlertsManager', HawkularAlertsManager);
}
