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
  export enum AlertType {
    AVAILABILITY,
    THRESHOLD,
    RANGE
  }

  export interface IHawkularAlertCriteria {
    startTime?: TimestampInMillis;
    endTime?: TimestampInMillis;
    alertIds?: string;
    triggerIds?: string;
    statuses?: string;
    severities?: string;
    tags?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularActionCriteria {
    startTime?: TimestampInMillis;
    endTime?: TimestampInMillis;
    actionPlugins?: string;
    actionIds?: string;
    alertIds?: string;
    results?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularTriggerCriteria {
    triggerIds?: string;
    tags?: string;
    thin?: boolean;
    currentPage?: number;
    perPage?: number;
    sort?: string;
    order?: string;
  }

  export interface IHawkularAlertQueryResult {
    alertList: IAlert[];
    headers: any;
  }

  export interface IHawkularTriggerQueryResult {
    triggerList: IAlertTrigger[];
    headers: any;
  }

  export interface IHawkularAlertsManager {

    // Alerts

    /**
     * @name addEmailAction
     * @desc Check if a previous email action exists, or it creates a new one
     * @param email - recipient of the email action
     */
    addEmailAction(email: EmailType): ng.IPromise<void>;

    /**
     * @name queryAlerts
     * @desc Fetch Alerts with different criterias
     * @param criteria - Filter for alerts query
     * @returns {ng.IPromise} with a list of Alerts
     */
    queryAlerts(criteria?: IHawkularAlertCriteria):
      ng.IPromise<IHawkularAlertQueryResult>;

    /**
     * @name getAlert
     * @desc Single alert fetch
     * @param alertId - Alert to query
     */
    getAlert(alertId: string): ng.IPromise<IAlert>;

    /**
     * @name queryActionsHistory
     * @desc Fetch Actions from history with different criterias
     * @param criteria - Filter for actions query
     */
    queryActionsHistory(criteria?: IHawkularActionCriteria): ng.IPromise<any>;

    /**
     * @name resolveAlerts
     * @desc Mark as resolved a list of alerts*
     * @param resolvedAlerts - An object with the description of the resolution of the alerts, in the form
     *
     *    resolvedAlerts = {
     *      alertIds: A string with a comma separated list of Alert ids,
     *      resolvedBy: The user responsible for the resolution of the alerts,
     *      resolvedNotes: Additional notes to add in the resolved state
     *    }
     *
     * @returns {ng.IPromise}
     */
    resolveAlerts(resolvedAlerts: any): ng.IPromise<any>;

    /**
     * @name addNote
     * @desc Add a note on an alert
     * @param alertNote - An object with the user and the text of the note in the form
     *
     *  alertNote = {
     *    alertId: A string with the alertId to place the note,
     *    user: The user author of the note,
     *    text: the content of the note
     *  }
     */
    addNote(alertNote: any): ng.IPromise<any>;

    /**
     * @name ackAlerts
     * @param ackAlerts
     * @param ackAlerts - An object with the description of the acknowledge of the alerts, in the form
     *
     *    ackAlerts = {
     *      alertIds: A string with a comma separated list of Alert ids,
     *      ackBy: The user responsible for the acknowledgement of the alerts,
     *      ackNotes: Additional notes to add in the acknowledged state
     *    }
     *
     * @returns {ng.IPromise}
     */
    ackAlerts(ackAlerts: any): ng.IPromise<any>;

    // Triggers

    /**
     * @name existTrigger
     * @desc Check if a trigger exists
     * @param {TriggerId} triggerId - The id of the trigger to check
     * @returns {ng.IPromise}
     */
    existTrigger(triggerId: TriggerId): any;

    /**
     * @name getTrigger
     * @desc Fetch a full Trigger with Dampening and Conditions object attached
     * @param {TriggerId} triggerId - The id of the trigger to fetch
     * @returns {ng.IPromise} with value:
     *
     *    promiseValue = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     */
    getTrigger(triggerId: TriggerId): any;

    /**
     * @name queryTriggers
     * @desc Fetch Triggers with different criterias
     * @param criteria - Filter for triggers query
     * @returns {ng.IPromise} with a list of Triggers
     */
    queryTriggers(criteria?: IHawkularTriggerCriteria):
      ng.IPromise<IHawkularTriggerQueryResult>;

    /**
     * @name getTriggerConditions
     * @desc Fetch only Conditions for a specified trigger
     * @param {TriggerId} triggerId - The id of the trigger to fetch Conditions
     * @returns {ng.IPromise} with a list of conditions as a value
     */
    getTriggerConditions(triggerId: TriggerId): ng.IPromise<any>;

    /**
     * @name createTrigger
     * @desc Create a Trigger with Dampenings and Conditions
     * @param fullTrigger - A full trigger representation where
     *
     *    fullTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     *
     * @param errorCallback - Function to be called on error
     */
    createTrigger(fullTrigger: any, errorCallback: any): ng.IPromise<void>;

    /**
     * @name deleteTrigger
     * @desc Delete a Trigger with associated Dampenings and Conditions
     * @param {TriggerId} triggerId - The id of the trigger to delete
     */
    deleteTrigger(triggerId: TriggerId): ng.IPromise<any>;

    /**
     * @name updateTrigger
     * @desc Update an existing Trigger with Dampenings and Conditions
     * @param fullTrigger - An existing full trigger representation where
     *
     *    fullTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     *
     * @param errorCallback - Function to be called on error
     * @param backup - A backup of the fullTrigger, it updates only the trigger, dampenings or conditions
     * that have been changed
     *
     *    backupTrigger = {
     *      trigger: <The trigger object>,
     *      dampenings: <List of dampenings linked with the trigger>,
     *      conditions: <List of conditions linked with the trigger>
     *    }
     */
    updateTrigger(fullTrigger: any, errorCallback: any, backupTrigger?: any): ng.IPromise<any>;
  }

  export class AlertCriteriaEnum {
    constructor(public name: string, public value: string) {
    }

    public static START_TIME = new ServerType('startTime', 'startTime');
    public static END_TIME = new ServerType('endTime', 'endTime');
    public static ALERT_IDS = new ServerType('alertIds', 'alertIds');
    public static ACTION_IDS = new ServerType('actionIds', 'actionIds');
    public static TRIGGER_IDS = new ServerType('triggerIds', 'triggerIds');
    public static STATUSES = new ServerType('statuses', 'statuses');
    public static SEVERITIES = new ServerType('severities', 'severities');
    public static TAGS = new ServerType('tags', 'tags');
    public static THIN = new ServerType('thin', 'thin');
    public static CURRENT_PAGE = new ServerType('currentPage', 'currentPage');
    public static PER_PAGE = new ServerType('per_page', 'per_page');
    public static SORT = new ServerType('sort', 'sort');
    public static ORDER = new ServerType('order', 'order');
    public static ACTION_PLUGINS = new ServerType('actionPlugins', 'actionPlugins');
    public static RESULTS = new ServerType('results', 'results');
    public static PAGE = new ServerType('page', 'page');

    public toString = () => {
      return this.name;
    };
  }
}
