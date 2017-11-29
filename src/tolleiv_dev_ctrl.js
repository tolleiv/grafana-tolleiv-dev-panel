import {MetricsPanelCtrl} from 'app/plugins/sdk';

import _ from 'lodash';
import moment from 'moment';
import angular from 'angular';

import TimeSeries from 'app/core/time_series2';

export class TolleivDevCtrl extends MetricsPanelCtrl {

  constructor($scope, $injector) {

    var default_cfg = {
      containerStyle: '',
      prefixColumn: '',
      prefixFontSize: '50%',
      prefixBreak: false,
      valueColumn: '',
      valueFontSize: '100%',
      postfixColumn: '',
      postfixFontSize: '50%',
      postfixBreak: false,
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
    var columnNames_1 = { '': 'None' };
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
      data.prefix = datapoint[this.panel.prefixColumn];
      data.value = datapoint[this.panel.valueColumn];
      data.postfix = datapoint[this.panel.postfixColumn];
  }

  link(scope, elem, attrs, ctrl) {
    var data = {}
    var panel = ctrl.panel;
    var templateSrv = this.templateSrv;
    elem = elem.find('.tolleiv-dev-panel');

    function getSpan(className, fontSize, value)  {
      if (!_.isString(value)) {
          return
      }
      value = templateSrv.replace(value, data.scopedVars);
      return '<span class="' + className + '" style="font-size:' + fontSize + '">' +
        value + '</span> ';
    }

    function getBigValueHtml() {
      var body = '<div class="tolleiv-dev-panel-value-container singlestat-panel-value-container">';
      if (data.prefix) { body += getSpan('tolleiv-dev-panel-prefix singlestat-panel-prefix', panel.prefixFontSize, data.prefix); }
      if (panel.prefixBreak) { body += '<br/>' }
      if (data.value) {  body += getSpan('tolleiv-dev-panel-value', panel.valueFontSize,   data.value); }
      if (panel.postfixBreak) { body += '<br/>' }
      if (data.postfix) { body += getSpan('tolleiv-dev-panel-postfix  singlestat-panel-postfix', panel.postfixFontSize, data.postfix); }

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
