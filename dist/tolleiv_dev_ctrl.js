'use strict';

System.register(['app/plugins/sdk', 'lodash', 'moment', 'angular', 'app/core/time_series2'], function (_export, _context) {
    "use strict";

    var MetricsPanelCtrl, _, moment, angular, TimeSeries, _createClass, TolleivDevCtrl;

    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function _possibleConstructorReturn(self, call) {
        if (!self) {
            throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
        }

        return call && (typeof call === "object" || typeof call === "function") ? call : self;
    }

    function _inherits(subClass, superClass) {
        if (typeof superClass !== "function" && superClass !== null) {
            throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
        }

        subClass.prototype = Object.create(superClass && superClass.prototype, {
            constructor: {
                value: subClass,
                enumerable: false,
                writable: true,
                configurable: true
            }
        });
        if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
    }

    return {
        setters: [function (_appPluginsSdk) {
            MetricsPanelCtrl = _appPluginsSdk.MetricsPanelCtrl;
        }, function (_lodash) {
            _ = _lodash.default;
        }, function (_moment) {
            moment = _moment.default;
        }, function (_angular) {
            angular = _angular.default;
        }, function (_appCoreTime_series) {
            TimeSeries = _appCoreTime_series.default;
        }],
        execute: function () {
            _createClass = function () {
                function defineProperties(target, props) {
                    for (var i = 0; i < props.length; i++) {
                        var descriptor = props[i];
                        descriptor.enumerable = descriptor.enumerable || false;
                        descriptor.configurable = true;
                        if ("value" in descriptor) descriptor.writable = true;
                        Object.defineProperty(target, descriptor.key, descriptor);
                    }
                }

                return function (Constructor, protoProps, staticProps) {
                    if (protoProps) defineProperties(Constructor.prototype, protoProps);
                    if (staticProps) defineProperties(Constructor, staticProps);
                    return Constructor;
                };
            }();

            _export('TolleivDevCtrl', TolleivDevCtrl = function (_MetricsPanelCtrl) {
                _inherits(TolleivDevCtrl, _MetricsPanelCtrl);

                function TolleivDevCtrl($scope, $injector) {
                    _classCallCheck(this, TolleivDevCtrl);

                    var default_cfg = {
                        tableColumn: '',
                        prefix: '',
                        prefixFontSize: '50%',
                        postfix: '',
                        postfixFontSize: '50%',
                        valueMaps: [{ value: 'null', op: '=', text: 'N/A' }],
                        colorValue: false
                    };

                    var _this = _possibleConstructorReturn(this, (TolleivDevCtrl.__proto__ || Object.getPrototypeOf(TolleivDevCtrl)).call(this, $scope, $injector));

                    _.defaults(_this.panel, default_cfg);

                    _this.tableColumnOptions = {};
                    _this.events.on('init-edit-mode', _this.onInitEditMode.bind(_this));
                    _this.events.on('data-received', _this.onDataReceived.bind(_this));
                    return _this;
                }

                _createClass(TolleivDevCtrl, [{
                    key: 'onInitEditMode',
                    value: function onInitEditMode() {
                        this.fontSizes = ['20%', '30%', '50%', '70%', '80%', '100%', '110%', '120%', '150%', '170%', '200%'];
                        this.addEditorTab('Options', 'public/plugins/tolleiv-dev-panel/editor.html', 2);
                    }
                }, {
                    key: 'onDataReceived',
                    value: function onDataReceived(dataList) {
                        var data = {};

                        this.dataType = 'table';
                        var tableData = dataList.map(this.tableHandler.bind(this));
                        this.setTableValues(tableData, data);
                        //console.log(tableData)
                        console.log(data);
                        this.data = data;
                        this.render();
                    }
                }, {
                    key: 'tableHandler',
                    value: function tableHandler(tableData) {
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
                }, {
                    key: 'setTableColumnToSensibleDefault',
                    value: function setTableColumnToSensibleDefault(tableData) {
                        if (this.tableColumnOptions.length === 1) {
                            this.panel.tableColumn = this.tableColumnOptions[0];
                        } else {
                            this.panel.tableColumn = _.find(tableData.columns, function (col) {
                                return col.type !== 'time';
                            }).text;
                        }
                    }
                }, {
                    key: 'setTableValues',
                    value: function setTableValues(tableData, data) {
                        if (!tableData || tableData.length === 0) {
                            return;
                        }
                        if (tableData[0].length === 0 || tableData[0][0][this.panel.tableColumn] === undefined) {
                            return;
                        }
                        var datapoint = tableData[0][0];
                        data.value = datapoint[this.panel.tableColumn];
                        if (_.isString(data.value)) {
                            data.valueFormatted = _.escape(data.value);
                            data.value = 0;
                            data.valueRounded = 0;
                        } else {
                            var decimalInfo = this.getDecimalsForValue(data.value);
                            var formatFunc = kbn.valueFormats[this.panel.format];
                            data.valueFormatted = formatFunc(datapoint[this.panel.tableColumn], decimalInfo.decimals, decimalInfo.scaledDecimals);
                            data.valueRounded = kbn.roundValue(data.value, this.panel.decimals || 0);
                        }
                        this.setValueMapping(data);
                    }
                }, {
                    key: 'setValueMapping',
                    value: function setValueMapping(data) {
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
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var data = {};
                        var panel = ctrl.panel;
                        var templateSrv = this.templateSrv;
                        elem = elem.find('.tolleiv-dev-panel');

                        function applyColoringThresholds(value, valueString) {
                            if (!panel.colorValue) {
                                return valueString;
                            }

                            var color = getColorForValue(data, value);
                            if (color) {
                                return '<span style="color:' + color + '">' + valueString + '</span>';
                            }

                            return valueString;
                        }

                        function getSpan(className, fontSize, value) {
                            value = templateSrv.replace(value, data.scopedVars);
                            return '<span class="' + className + '" style="font-size:' + fontSize + '">' + value + '</span>';
                        }

                        function getBigValueHtml() {
                            var body = '<div class="singlestat-panel-value-container">';

                            if (panel.prefix) {
                                body += getSpan('singlestat-panel-prefix', panel.prefixFontSize, panel.prefix);
                            }

                            var value = applyColoringThresholds(data.value, data.valueFormatted);
                            body += getSpan('singlestat-panel-value', panel.valueFontSize, value);

                            if (panel.postfix) {
                                body += getSpan('singlestat-panel-postfix', panel.postfixFontSize, panel.postfix);
                            }

                            body += '</div>';

                            return body;
                        }

                        function render() {
                            console.log('render');
                            if (!ctrl.data) {
                                return;
                            }
                            data = ctrl.data;
                            elem.html(getBigValueHtml());
                            console.log('render - done?');
                        }

                        this.events.on('render', function () {
                            render();
                            ctrl.renderingCompleted();
                        });
                    }
                }]);

                return TolleivDevCtrl;
            }(MetricsPanelCtrl));

            _export('TolleivDevCtrl', TolleivDevCtrl);

            TolleivDevCtrl.templateUrl = 'module.html';
        }
    };
});
//# sourceMappingURL=tolleiv_dev_ctrl.js.map
