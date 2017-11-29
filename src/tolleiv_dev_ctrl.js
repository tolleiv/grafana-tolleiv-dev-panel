import {MetricsPanelCtrl} from 'app/plugins/sdk';

import _ from 'lodash';
import moment from 'moment';
import angular from 'angular';

import TimeSeries from 'app/core/time_series2';

export class TolleivDevCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector) {

    var default_cfg = {
      tableColumnOne: '',
      tableColumnTwo: '',
      tableColumnThree: '',

      prefix: '',
      prefixFontSize: '50%',
      postfix: '',
      postfixFontSize: '50%',
      valueMaps: [
        { value: 'null', op: '=', text: 'N/A' }
      ],
      colorValue: false
    }

    super($scope, $injector);
    _.defaults(this.panel, default_cfg);

    this.tableColumnOptions = {}
    this.events.on('init-edit-mode', this.onInitEditMode.bind(this));
    this.events.on('data-received', this.onDataReceived.bind(this));
  }

  onInitEditMode() {
     this.fontSizes = ['20%', '30%','50%','70%','80%','100%', '110%', '120%', '150%', '170%', '200%'];
     this.addEditorTab('Options', 'public/plugins/tolleiv-dev-panel/editor.html', 2);
  }

  onDataReceived(dataList) {
	  var data = {};
    
    this.dataType = 'table';
    var tableData = dataList.map(this.tableHandler.bind(this));
    this.setTableValues(tableData, data);
    this.data = data;
    this.render();
  }

  tableHandler(tableData) {
    var datapoints_1 = [];
    var columnNames_1 = {};
    tableData.columns.forEach(function (column, columnIndex) {
        columnNames_1[columnIndex] = column.text;
    });
    this.tableColumnOptions = columnNames_1;
    if (!_.find(tableData.columns, ['text', this.panel.tableColumn])) {
        this.setTableColumnToSensibleDefault(tableData);
    }
    tableData.rows.forEach(function (row) {
        var datapoint = {};
        row.forEach(function (value, columnIndex) {
            var key = columnNames_1[columnIndex];
            datapoint[key] = value;
        });
        datapoints_1.push(datapoint);
    });
    return datapoints_1;
  }

  setTableColumnToSensibleDefault(tableData) {
      if (this.tableColumnOptions.length === 1) {
          this.panel.tableColumn = this.tableColumnOptions[0];
      }
      else {
          this.panel.tableColumn = _.find(tableData.columns, function (col) { return col.type !== 'time'; }).text;
      }
  }

  setTableValues(tableData, data) {
      if (!tableData || tableData.length === 0) {
          return;
      }
      if (tableData[0].length === 0 || tableData[0][0][this.panel.tableColumn] === undefined) {
          return;
      }
      var datapoint = tableData[0][0];
      data.valueOne = datapoint[this.panel.tableColumnOne];
      if (_.isString(data.valueOne)) {
          data.valueOneFormatted = _.escape(data.valueOne);
          data.valueOne = 0;
          data.valueOneRounded = 0;
      }
      data.valueTwo = datapoint[this.panel.tableColumnTwo];
      if (_.isString(data.valueTwo)) {
          data.valueTwoFormatted = _.escape(data.valueTwo);
          data.valueTwo = 0;
          data.valueTwoRounded = 0;
      }
      data.valueThree = datapoint[this.panel.tableColumnThree];
      if (_.isString(data.valueThree)) {
          data.valueThreeFormatted = _.escape(data.valueThree);
          data.valueThree = 0;
          data.valueThreeRounded = 0;
      }


      this.setValueMapping(data);
  }
  setValueMapping(data) {
    for (var i = 0; i < this.panel.valueMaps.length; i++) {
        var map = this.panel.valueMaps[i];
        // special null case
        if (map.value === 'null') {
            if (data.value === null || data.value === void 0) {
                data.valueFormatted = map.text;
                return;
            }
            continue;
        }
        // value/number to text mapping
        var value = parseFloat(map.value);
        if (value === data.valueRounded) {
            data.valueFormatted = map.text;
            return;
        }
    }
    
    if (data.value === null || data.value === void 0) {
        data.valueFormatted = "no value";
    }
  }
  link(scope, elem, attrs, ctrl) {
    var data = {}
    var panel = ctrl.panel;
    var templateSrv = this.templateSrv;
    elem = elem.find('.tolleiv-dev-panel');

    function applyColoringThresholds(value, valueString) {
      if (!panel.colorValue) {
        return valueString;
      }

      var color = getColorForValue(data, value);
      if (color) {
        return '<span style="color:' + color + '">'+ valueString + '</span>';
      }

      return valueString;
    }

    function getSpan(className, fontSize, value)  {
      value = templateSrv.replace(value, data.scopedVars);
      return '<span class="' + className + '" style="font-size:' + fontSize + '">' +
        value + '</span><br/>';
    }

    function getBigValueHtml() {
      var body = '<div class="tolleiv-dev-panel-value-container singlestat-panel-value-container">';

      if (panel.prefix) { body += getSpan('tolleiv-dev-panel-prefix singlestat-panel-prefix', panel.prefixFontSize, panel.prefix); }

      var value = applyColoringThresholds(data.valueOne, data.valueOneFormatted);
      body += getSpan('tolleiv-dev-panel-value', panel.valueOneFontSize, value);
      var value = applyColoringThresholds(data.valueTwo, data.valueTwoFormatted);
      body += getSpan('tolleiv-dev-panel-value', panel.valueTwoFontSize, value);
      var value = applyColoringThresholds(data.valueThree, data.valueThreeFormatted);
      body += getSpan('tolleiv-dev-panel-value', panel.valueThreeFontSize, value);

      if (panel.postfix) { body += getSpan('tolleiv-dev-panel-postfix  singlestat-panel-postfix', panel.postfixFontSize, panel.postfix); }

      body += '</div>';

      return body;
    }

    function render() {
      if (!ctrl.data) { return; }
      data = ctrl.data;
      elem.html(getBigValueHtml());
    }

    this.events.on('render', function() {
      render();
      ctrl.renderingCompleted();
    });
  }

}

TolleivDevCtrl.templateUrl = 'module.html';
