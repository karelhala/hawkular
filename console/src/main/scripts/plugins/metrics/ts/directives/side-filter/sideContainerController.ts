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

/// <reference path="../../metricsPlugin.ts"/>
/// <reference path="../../../includes.ts"/>
module HawkularMetrics {
  export class SideContainerController {
    public filtersConfig: any;
    public appliedFilters: any[] = [];
    constructor() {
      this.initFilters();
    }

    /**
     * Method which takes array of values and transfers them to object and sets unchecked.
     * [value1, value2, value3] => {value1: false, value2: false, value3: false}
     * This is useful for checkboxes and radio boxes.
     */
    private initFilters() {
      _.forEach(this.filtersConfig.filters, (filter: any) => {
        filter.selectedValues = _.transform(filter.filterValues, (result: any , value: string) => {
          result[value] = false;
        }, {});
      });
    }

    /**
     * Method for changing current active filters. It will first remove old values (for checkboxes and rabio boxes) and
     * then stores new values to this.appliedFilters, it will also change filterValues to true (if any options are
     * provided to filter)
     * @see {@HawkularMetrics.SideContainerController.initFilters()} for more info how values are changed to object.
     * @param name id of filter.
     * @param value value which will be set and filtered upon.
     * @param type what type of filter is used.
     * @param checked [true, false] checkbox send either true or false.
     */
    public changeFilter(name, value, type, checked?): void {
      if (type === 'radio') {
        this.removeFromFilters({id: name, type: type});
      }
      if (type === 'checkbox' && !checked) {
        this.removeFromFilters({id: name, value: value});
      } else {
        const currentFilter: any = _.find(this.filtersConfig.filters, {id: name});
        currentFilter.selectedValues[value] = true;
        this.appliedFilters.push({
          id: name,
          value: value,
          title: currentFilter.title,
          type: type
        });
        this.filtersConfig.filterBy(this.appliedFilters);
      }
    }

    /**
     * Method for removing filter from active filters.
     * @param filter this filter will be removed from active filters.
     */
    private removeFromFilters(filter: any): void {
      const index = _.findIndex(this.appliedFilters, filter);
      if (index !== -1) {
        this.appliedFilters.splice(index, 1);
      }
      this.flushFilter(filter);
      this.filtersConfig.filterBy(this.appliedFilters);
    }

    /**
     * Set in filter config that this filter is not active anymore.
     * @param filter this will be inactived in filter config.
     */
    public flushFilter(filter: any) {
      const currentFilter: any = _.find(this.filtersConfig.filters, {id: filter.id});
      if (filter.hasOwnProperty('value')) {
        currentFilter.selectedValues[filter.value] = false;
      }

      if (filter.hasOwnProperty('type') && filter.type === 'radio') {
        const activeKey = _.findKey(currentFilter.selectedValues, (val) => {return val === true;});
        if (activeKey) {
          currentFilter.selectedValues[activeKey] = false;
        }
      }
    }

    /**
     * Method for removing all filters.
     */
    public removeAllFilters() {
      _.each(this.appliedFilters, (oneFilter) => {
        this.flushFilter(oneFilter);
      });
      this.appliedFilters.length = 0;
      this.filtersConfig.filterBy(this.appliedFilters);

    }
  }

  _module.controller('SideContainerController', SideContainerController);
}
