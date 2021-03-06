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

/// <reference path="alertCenter.spec.ts"/>

module protractor.testing {
  declare var browser: any;
  declare var describe: any;
  declare var it: any;
  declare var expect: any;
  declare var beforeEach: any;

  /**
   }
   * jasmine spec for alert center
   */
  describe('alert center tests', () => {
    const alertCenter = new AlertCenter();

    it('should go to alert center page trough navbar', () => {
      alertCenter.clickOnAlertCenter();
      expect(browser.getLocationAbsUrl()).toContain(AlertCenter.ALERT_CENTER_URL);
    });

  });

  /**
   * jasmine tests for navigation tests in alert center
   */
  describe('alert center navigation tests', () => {
    const alertCenter = new AlertCenter();
    beforeEach(() => {
      alertCenter.clickOnAlertCenter();
    });

    it('should click on definitions in alerts tab', () => {
      alertCenter.clickOnDefinitions();
      expect(browser.getLocationAbsUrl()).toContain(AlertCenter.TRIGGERS_URL);
    });

    it('should click on alerts in alerts tab', () => {
      alertCenter.clickOnAlertCenter();
      alertCenter.clickOnAlerts();
      expect(browser.getLocationAbsUrl()).toContain(AlertCenter.ALERT_CENTER_URL);
    })
  });
}
