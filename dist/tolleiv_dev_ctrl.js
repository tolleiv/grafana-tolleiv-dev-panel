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
                        containerStyle: '',
                        prefixColumn: '',
                        prefixFontSize: '50%',
                        prefixBreak: false,
                        valueColumn: '',
                        valueFontSize: '100%',
                        postfixColumn: '',
                        postfixFontSize: '50%',
                        postfixBreak: false
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
                        this.data = data;
                        this.render();
                    }
                }, {
                    key: 'tableHandler',
                    value: function tableHandler(tableData) {
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
                        data.prefix = datapoint[this.panel.prefixColumn];
                        data.value = datapoint[this.panel.valueColumn];
                        data.postfix = datapoint[this.panel.postfixColumn];
                    }
                }, {
                    key: 'link',
                    value: function link(scope, elem, attrs, ctrl) {
                        var data = {};
                        var panel = ctrl.panel;
                        var templateSrv = this.templateSrv;
                        elem = elem.find('.tolleiv-dev-panel');

                        function getSpan(className, fontSize, value) {
                            if (!_.isString(value)) {
                                return;
                            }
                            value = templateSrv.replace(value, data.scopedVars);
                            return '<span class="' + className + '" style="font-size:' + fontSize + '">' + value + '</span> ';
                        }

                        function getBigValueHtml() {
                            var body = '<div class="tolleiv-dev-panel-value-container singlestat-panel-value-container">';
                            console.log(panel.prefixBreak);
                            if (data.prefix) {
                                body += getSpan('tolleiv-dev-panel-prefix singlestat-panel-prefix', panel.prefixFontSize, data.prefix);
                            }
                            if (panel.prefixBreak) {
                                body += '<br/>';
                            }
                            if (data.value) {
                                body += getSpan('tolleiv-dev-panel-value', panel.valueFontSize, data.value);
                            }
                            if (panel.postfixBreak) {
                                body += '<br/>';
                            }
                            if (data.postfix) {
                                body += getSpan('tolleiv-dev-panel-postfix  singlestat-panel-postfix', panel.postfixFontSize, data.postfix);
                            }

                            body += '</div>';

                            return body;
                        }

                        function render() {
                            if (!ctrl.data) {
                                return;
                            }
                            data = ctrl.data;
                            elem.html(getBigValueHtml());
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
