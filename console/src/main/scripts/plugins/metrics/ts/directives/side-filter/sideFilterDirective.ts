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
  export class HkSideFilterContainer {
    public controller = SideContainerController;
    public controllerAs = 'vm';
    public replace = 'true';
    public scope = {};
    public bindToController = {
      filtersConfig: '='
    };
    public templateUrl = 'plugins/metrics/html/directives/side-filter/container.html';

    public static Factory() {
      let directive = () => {
        return new HkSideFilterContainer();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkAppliedFiltersDirective {
    public replace = 'true';
    public scope = {
      filters: '=',
      removeFilter: '&',
      clearAll: '&'
    };
    public templateUrl = 'plugins/metrics/html/directives/side-filter/applied-filters.html';

    public static Factory() {
      let directive = () => {
        return new HkAppliedFiltersDirective();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkTextFilterDirective {
    public link: any = ($scope: any, element: ng.IAugmentedJQuery, attrs: ng.IAttributes) => {
      $scope.textModel = '';
      $scope.keyPressed = (keyEvent) => {
        if (keyEvent.which === 13) {
          $scope.filterClicked({
            name: $scope.textFilter.id,
            value: $scope.textModel,
            type: $scope.textFilter.filterType
          });
          $scope.textModel = '';
        }
      };
    };
    public replace = 'true';
    public scope = {
      textFilter: '=',
      filterClicked: '&'
    };
    public templateUrl = 'plugins/metrics/html/directives/side-filter/text.html';

    public static Factory() {
      let directive = () => {
        return new HkTextFilterDirective();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  export class HkCollapseFilterDirective {
    public replace = 'true';
    public scope = {
      filterClicked: '&',
      selectedFilters: '=',
      filterConfig: '=',
    };
    public templateUrl = 'plugins/metrics/html/directives/side-filter/collapse.html';

    public static Factory() {
      let directive = () => {
        return new HkCollapseFilterDirective();
      };

      directive['$inject'] = [];

      return directive;
    }
  }

  _module.directive('hkSideFilterContainer', [HawkularMetrics.HkSideFilterContainer.Factory()]);
  _module.directive('hkAppliedFilters', [HawkularMetrics.HkAppliedFiltersDirective.Factory()]);
  _module.directive('hkTextFilter', [HawkularMetrics.HkTextFilterDirective.Factory()]);
  _module.directive('hkCollapseFilter', [HawkularMetrics.HkCollapseFilterDirective.Factory()]);
}
