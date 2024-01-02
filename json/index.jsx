import { Fragment, memo, useEffect, useMemo, useState } from 'react';
import { Button, Checkbox, Tabs, Spin, Table, Tooltip } from 'antd';
import { useMemoizedFn, useDebounceFn } from 'ahooks';
import { useAppStore } from '../../../hox/app';
import useDynamicMenu from '@utils/useDynamicMenu';
import ChartView from '../components/chart-view';
import Card from '@components/card';
import DateHeadPanel from '../components/date-head-panel';
import PowerStationOverview from '../components/overview';
import RMKRealTime from './components/RMK_real-time';
import SNParseUtil from '@admin/views/device/components/config/direct/SNParseUtil';
import {isGridInverter,isStorageInverter} from '@admin/views/power-station/helper';
import classnames from 'classnames';
import { tzh } from '@utils/i18n';
import dayjs from 'dayjs';
import { PAGE_SIZE } from '@utils/constant';
import { useSearchParams, useNavigate } from 'react-router-dom';
import useUserBaseInfo from '@utils/useBaseUserInfo';
import useDeviceTypes from '@utils/useDeviceTypes';
import { getXAxisPointerLabel } from '@utils';
import { getDeviceStatusName } from '@utils';
import store from 'store';
import { translation } from '@utils/tools/base';
// api
import { queryCurrentInfo, queryPowerGenerate, queryRunningHistory, queryParametersMenu, getSubDevices } from '@api/inverter';

// icon
import PhotovoltaicIcon from '@assets/svg/power-station-detail/station-photovoltaic.svg';
import PhotovoltaicGrayIcon from '@assets/svg/power-station-detail/station-photovoltaic-gray.svg';
import ElectricitIcon from '@assets/svg/power-station-detail/station-electric.svg';
import ElectricitGryIcon from '@assets/svg/power-station-detail/station-electric-gray.svg';
import ConsumptionIcon from '@assets/svg/power-station-detail/station-consumption.svg';
import ConsumptionGrayIcon from '@assets/svg/power-station-detail/station-consumption-gray.svg';
import BetteryIcon from '@assets/svg/power-station-detail/station-bettery.svg';
import BetteryGrayIcon from '@assets/svg/power-station-detail/station-bettery-gray.svg';
import InvertIcon from '@assets/svg/power-station-detail/station-inverter.svg';
import InvertGrayIcon from '@assets/svg/power-station-detail/station-inverter-gray.svg';
import EmptyDevice from '@assets/svg/power-station-detail/emptyDevice.svg';
// style
import './index.less';
import { InverterTypeEnum } from '@admin/views/device/components/config/direct/InverterTypeEnum';

const DeviceStateEnum = {
    OFFLINE: 'state.offline',
    NORMAL: 'state.normal',
    STANDBY: 'state.standby',
    FAULT: 'state.fault'
};

const PowerStation = memo(() => {
    const navigate = useNavigate();
    const { showSubMenu } = useAppStore();
    const { setDynamicMenuItems } = useDynamicMenu();
    const [searchParams] = useSearchParams();
    const [chartData, setChartData] = useState([]);
    const [deviceState, steDeviceState] = useState('');
    const [records, setRecords] = useState([]);
    const { getDeviceTypeName } = useDeviceTypes();
    const sn = useMemo(() => searchParams.get('sn'), [searchParams.get('sn')]);
    const stationId = useMemo(() => searchParams.get('stationId'), [searchParams.get('stationId')]);
    const stationName = useMemo(() => searchParams.get('stationName'), [searchParams.get('stationName')]);
    const meterType = useMemo(() => searchParams.get('meterType'), [searchParams.get('meterType')]);
    const emptyDevice = store.get('emptyDeviceFlag');
    const tabs = useMemo(() => {
        const sNParseUtil = new SNParseUtil();
        const snInfo = sNParseUtil.parse(sn);

        return [
            {
                key: 'real-time-info',
                label: tzh('实时信息')
            },
            {
                key: 'power-chart',
                label: `${tzh('功率')}/${tzh('电量')}`
            },
            {
                key: 'pro-chart',
                label: tzh('专业参数')
            },
            ...(snInfo?.productType === InverterTypeEnum.SMART_DEVICE_COLLECTOR ||
            (snInfo?.productType === InverterTypeEnum.SMART_DEVICE_METER && meterType === 'onlineMeter')
                ? [
                      {
                          key: 'sub-device',
                          label: tzh('子设备')
                      }
                  ]
                : [])
        ];
    }, [sn]);
    const isStorage = useMemo(() => {
        return isStorageInverter(sn);
    }, [sn]);
    const isGrid = useMemo(() => {
        return isGridInverter(sn);
    }, [sn]);
    const [currentTab, setCurrentTab] = useState(tabs[0].key);
    const [loading, setLoading] = useState({
        chartData: false,
        proChartData: false,
        parameters: false,
        table: false
    });

    const [realTime, setRealTime] = useState({
        pvInfo: [],
        inverterInfo: {},
        batteryInfo: {},
        netInfo: {},
        loadInfo: {}
    });
    const [realTimeInfo, setRealTimeInfo] = useState([]);
    const [parameters, setParameters] = useState([]);
    const [typeIds, setTypeIds] = useState([]);
    const [SNInfo, setSNInfo] = useState({});
    const [isFollower, setIsFollower] = useState(false);
    const [isMaster, setIsMaster] = useState(false);
    const [clearTemplateFlag, setClearTemplateFlag] = useState(false);
    const [proParams, setProParams] = useState({
        date: '',
        typeIdMap: {}
    });
    const [chartViewKey, setChartViewKey] = useState(0);
    const {
        baseUserSetting: { dateFormatStr }
    } = useUserBaseInfo();

    const meterTypeEnum = {
        onlineMeter: tzh('上网电表'),
        tripartiteMeter: tzh('三方发电电表')
    };

    const overviewData = useMemo(
        () => [
            {
                icon: 'power',
                items: [
                    {
                        label: `${tzh('当前功率')}(${realTimeInfo[1]?.contents.find(item => item.order == 10)?.unit})`,
                        value: realTimeInfo[1]?.contents.find(item => item.order == 10)?.value ?? '--'
                    }
                ]
            },
            {
                icon: 'today-generation',
                items: [
                    {
                        label: `${tzh('今日发电')}(${realTimeInfo[1]?.contents.find(item => item.order === 11)?.unit})`,
                        value: realTimeInfo[1]?.contents.find(item => item.order == 11)?.value ?? '--'
                    }
                ]
            },
            {
                icon: 'generation',
                items: [
                    {
                        label: `${tzh('累计发电')}(${realTimeInfo[1]?.contents.find(item => item.order === 12)?.unit})`,
                        value: realTimeInfo[1]?.contents.find(item => item.order == 12)?.value ?? '--'
                    }
                ]
            }
        ],
        [realTimeInfo]
    );

    const chartViewProps = useMemo(() => {
        let startAxisName = '';
        let startAxisIndex;
        let endAxisName = '';
        let endAxisIndex;
        const showEndAxis = chartData.some(({ unit }, index) => {
            if (index === 0) {
                startAxisName = unit;
                startAxisIndex = index;
            } else if (unit !== startAxisName) {
                // 只第二个不同的单位曲线作为右侧Y轴
                endAxisIndex = index;
                endAxisName = unit;
                return true;
            }
            return false;
        });
        const hasData = chartData.some(({ data }) => data.some(item => item[1]));
        const yAxisMax = !hasData ? 100 : undefined;

        return {
            yAxisMax,
            showEndAxis,
            startAxisName,
            startAxisIndex,
            endAxisName,
            endAxisIndex,
            axisLabelInterval: chartData.dateType === 'date' ? 11 : undefined,
            tooltipFormat: chartData.tooltipFormat,
            xAxisPointerLabelFormatter: chartData.xAxisPointerLabelFormatter
        };
    }, [chartData]);

    const [subDeviceParams, setSubDeviceParams] = useState({
        pageNo: 1,
        pageSize: PAGE_SIZE,
        sortField: '',
        sortRule: 'ASC',
        total: 0
    });

    useEffect(() => {
        setChartViewKey(Date.now());
    }, [showSubMenu, chartData]);

    const handleTabClick = useMemoizedFn(tab => {
        setCurrentTab(tab);
        location.hash = tab;
    });

    const getDataValue = useMemoizedFn((item, dataIndex) => {
        const lastIndex = item.length - 1;
        const index = dataIndex > lastIndex ? lastIndex : dataIndex;

        return (item[index] || {}).value;
    });
    // 填充拆线或柱状图
    const getChartData = useMemoizedFn((chartData, dateType, date) => {
        const {
            data,
            legend, // 拆线的KEY
            legendDesc, // 折线的名字
            unit, // 单位
            xaxis, // x轴刻度
            xaxisDesc // x轴刻度显示名
        } = chartData;
        const timeQuickMap = {};

        xaxisDesc.forEach((key, index) => {
            timeQuickMap[key] = xaxis[index];
        });
        let nextData = [];

        nextData = data.map((item, index) => ({
            name: legendDesc[index] ?? legend[index] ?? '--',
            data: xaxisDesc.map((time, dataIndex) => [time, getDataValue(item, dataIndex)]),
            unit: unit[index],
            type: dateType === 'date' ? 'line' : 'bar'
        }));
        nextData.dateType = dateType;
        nextData.xAxisPointerLabelFormatter = rawValue => {
            return getXAxisPointerLabel({
                value: dateType === 'date' ? timeQuickMap[rawValue] : rawValue,
                date,
                dateType,
                defaultDateFormat: dateFormatStr
            });
        };
        nextData.tooltipFormat = list => {
            const htmlStrList = [];
            const rawValue = list[0].axisValue;
            // 标题
            const title = getXAxisPointerLabel({
                value: dateType === 'date' ? timeQuickMap[rawValue] : rawValue,
                date,
                dateType,
                defaultDateFormat: dateFormatStr
            });

            htmlStrList.push(title);
            list.forEach((item, index) => {
                const {
                    marker,
                    seriesName,
                    value: [, data]
                } = item;

                htmlStrList.push(`
          ${marker}
          ${seriesName}
          <span style="float: right">${data ?? '--'}${unit[index]}</span>
        `);
            });
            return htmlStrList.join('<br />');
        };
        return nextData;
    });

    const handleTemplateClick = useMemoizedFn(typeIds => {
        // console.log('--------', typeIds);
        const typeIdMap = {};

        typeIds.forEach(item => (typeIdMap[item] = true));
        console.log('--------', typeIdMap);
        setProParams({
            ...proParams,
            typeIdMap
        });
        setTypeIds(typeIds);
    });

    const handlePowerChartViewChange = useMemoizedFn(async (dateType, date) => {
        setLoading(loading => ({
            ...loading,
            chartData: true
        }));
        try {
            const chartDateTypeMap = {
                date: 'DAY',
                month: 'MONTH',
                year: 'YEAR',
                sum: 'ALL_YEAR'
            };

            if (currentTab === 'pro-chart') {
                setProParams({ ...proParams, date, dateType });
            }
            const queryChartData = currentTab === 'power-chart' ? loadPowerChart : loadProChart;
            const { body } = await queryChartData({
                date,
                dateType: chartDateTypeMap[dateType],
                sn
            });

            if (body) {
                const chartData = getChartData(body, dateType, date);

                chartData && setChartData(chartData);
            }
        } catch (err) {
            console.error('加载设备数据失败:', err);
        }
        setLoading(loading => ({
            ...loading,
            chartData: false
        }));
    });

    const loadRealTime = useMemoizedFn(async () => {
        setLoading(true);
        try {
            if (emptyDevice === 'UPLOADED') {
                const sNParseUtil = new SNParseUtil();
                const snInfo = sNParseUtil.parse(sn);

                setSNInfo(snInfo);
                console.log('result', snInfo);
                setRealTimeInfo(() => []);
                const { body } = await queryCurrentInfo.memo(sn);

                if (body && body[1] && body[1].contents) {
                    const item = body[1].contents.find(_item => _item.order === 3);

                    if (item) {
                        item.value = dayjs(item?.value).format(`HH:mm:ss ${dateFormatStr}`);
                    }
                }
                console.log('>>>>>>>', body);
                setRealTimeInfo(body);
                if (isStorage) {
                    // 从机
                    if (
                        body?.find(item => item.order === 0)?.contents.find(item => item.order == 2)?.value ==
                        'DEVICE_ROLE_P_FOLLOWER'
                    ) {
                        setIsFollower(true);
                    }
                    // 主机
                    if (
                        body?.find(item => item.order === 0)?.contents.find(item => item.order == 2)?.value ==
                        'DEVICE_ROLE_P_MASTER'
                    ) {
                        setIsMaster(true);
                    }
                }
                steDeviceState(
                    body
                        .find(item => item.order === 1)
                        ?.contents.find(item =>
                            isGrid ? item.order === 13 : item.order === 14
                        )?.value
                );
            }
        } catch (err) {
            console.error('实时信息加载失败：', err);
        }
        setLoading(false);
    });

    const loadPowerChart = useMemoizedFn(({ date, dateType, sn }) => {
        return queryPowerGenerate.memo({
            date,
            dateType,
            sn
        });
    });

    const loadProChart = useMemoizedFn(({ date, sn }) => {
        if (typeIds.length) {
            return queryRunningHistory.memo({
                date,
                sn,
                typeIds
            });
        }
        // 清空图表
        setChartData([]);
        return { body: null };
    });

    const handleInitParameters = useMemoizedFn(async () => {
        setLoading(loading => ({
            ...loading,
            parameters: true
        }));
        try {
            const {
                body: { professShowFields }
            } = await queryParametersMenu.memo(sn);

            setParameters(professShowFields);
        } catch (err) {
            console.error('参数列表加载失败：', err);
        }
        setLoading(loading => ({
            ...loading,
            parameters: false
        }));
    });

    const handleSubDevices = useMemoizedFn(async () => {
        setLoading(loading => ({
            ...loading,
            table: true
        }));
        try {
            const { body } = await getSubDevices.memo(sn, subDeviceParams);

            console.log('获取的结果是？？？？', body);
            setRecords(body?.content || []);
            setSubDeviceParams({
                ...subDeviceParams,
                total: body?.totalEleCount || 0
            });
        } catch (err) {
            console.log('子设备列表加载失败', err);
        }
        setLoading(loading => ({
            ...loading,
            table: false
        }));
    });

    // 清除选择参数
    const handleClearParams = useMemoizedFn(() => {
        setProParams({
            ...proParams,
            typeIdMap: {}
        });
        setTypeIds([]);
    });

    // 确定发起搜索
    const handleConfirmParams = useMemoizedFn(() => {
        console.log('<<<<<<<', proParams.typeIdMap);
        setTypeIds(Object.keys(proParams.typeIdMap).map(key => key));
    });

    // 勾选参数
    const handleParamCheck = useMemoizedFn((e, value) => {
        const typeIdMap = { ...proParams.typeIdMap };

        setClearTemplateFlag(flag => !flag);
        if (e.target.checked) {
            typeIdMap[value] = true;
        } else {
            delete typeIdMap[value];
        }
        setProParams({
            ...proParams,
            typeIdMap
        });
    });

    const { run: handleListenWindowResize } = useDebounceFn(
        () => {
            setChartViewKey(Date.now());
        },
        { wait: 1000 }
    );

    const deviceName = useMemo(() => {
        if (realTime.deviceName) return realTime.deviceName;
        return searchParams.get('deviceName') || '--';
    }, [realTime.deviceName, searchParams.get('deviceName')]);

    const tableColumns = useMemo(
        () => [
            {
                title: tzh('状态'),
                dataIndex: 'status',
                width: 60,
                fixed: 'left',
                ellipsis: true,
                align: 'center',
                render(status) {
                    return (
                        <Tooltip title={getDeviceStatusName(status)}>
                            <span className={classnames('sub-device__status', `sub-device__status--${status}`)}></span>
                        </Tooltip>
                    );
                }
            },
            {
                title: tzh('设备名称'),
                dataIndex: 'deviceName',
                width: 117,
                ellipsis: true,
                render(deviceName, row) {
                    return (
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigate(
                                    `/power-station/detail/device?sn=${row.sn}&deviceName=${encodeURIComponent(
                                        row.deviceName
                                    )}&stationId=${stationId}&stationName=${encodeURIComponent(stationName)}&meterType=${row.meterType}`,
                                    row
                                );
                                location.hash = tabs[0].key;
                            }}
                            className={classnames('device-list__name', `device-list__name--${row.deviceRole}`)}>
                            {deviceName}
                        </span>
                    );
                }
            },
            {
                title: 'SN',
                dataIndex: 'sn',
                width: 139,
                ellipsis: true,
                fixed: 'left',
                render(value, row) {
                    return (
                        <span
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                                navigate(
                                    `/power-station/detail/device?sn=${row.sn}&deviceName=${encodeURIComponent(
                                        row.deviceName
                                    )}&stationId=${stationId}&stationName=${encodeURIComponent(stationName)}&meterType=${row.meterType}`,
                                    row
                                );
                                location.hash = tabs[0].key;
                            }}>
                            {value}
                        </span>
                    );
                }
            },
            {
                title: tzh('设备类型'),
                dataIndex: 'type',
                width: 240,
                ellipsis: true,
                render(type) {
                    return getDeviceTypeName(type);
                }
            },
            {
                title: tzh('设备型号'),
                ellipsis: true,
                dataIndex: 'machineType',
                width: 220
            }
        ],
        []
    );

    // 子设备page参数回调

    const handlePageChange = useMemoizedFn((pageNo, pageSize) => {
        setSubDeviceParams({
            ...subDeviceParams,
            pageNo,
            pageSize
        });
    });
    const disabledDate = useMemoizedFn(current => {
        // Can not select days after today
        return current && current > dayjs().endOf('day');
    });

    const deps = useMemo(
        () =>
            Object.entries(subDeviceParams)
                .filter(([key]) => key !== 'total')
                .map(([_, value]) => value),
        [subDeviceParams]
    );

    useEffect(() => {
        if (currentTab === 'sub-device') {
            handleSubDevices();
        }
    }, [...deps, currentTab]);

    // 监听 tab 变化
    useEffect(() => {
        // 加载实时数据
        if (currentTab === 'real-time-info') {
            loadRealTime();
        } else if (currentTab === 'pro-chart') {
            // 加载参数列表
            handleInitParameters();
        } else if (currentTab === 'sub-device') {
            // handleSubDevices();
        }
    }, [currentTab]);

    useEffect(() => {
        // 重新发起请求
        handlePowerChartViewChange(proParams.dateType, proParams.date);
    }, [typeIds]);

    useEffect(() => {
        // 需要动态设置面包屑
        setDynamicMenuItems([
            null,
            {
                name: stationName ?? '--',
                path: `/power-station/detail?id=${stationId}`
            },
            { name: deviceName ?? '--' }
        ]);
        return () => {
            setDynamicMenuItems([]);
        };
    }, [stationId, deviceName]);

    useEffect(() => {
        const hash = location.hash.replace('#', '');

        if (hash) {
            setCurrentTab(hash);
        }
    }, [location.hash]);
    useEffect(() => {
        window.addEventListener('resize', handleListenWindowResize);
        return () => {
            window.removeEventListener('resize', handleListenWindowResize);
        };
    }, []);

    return (
        <div className="power-station-device">
            <Card className="power-station-device__header">
                <Tabs className="power-station-device__tabs" items={tabs} activeKey={currentTab} onTabClick={handleTabClick} />
            </Card>
            {currentTab === tabs[0].key &&
                (emptyDevice == 'UPLOADED' ? (
                    <>
                        <Spin spinning={loading}>
                            <Card
                                className={classnames({
                                    'power-station-device__header': true,
                                    'power-station-device__base': true
                                })}>
                                {realTimeInfo[0]?.contents[0] ? (
                                    <div className="power-station-device__base-box">
                                        {realTimeInfo[0]?.contents?.map(item => (
                                            <div className="power-station-device__base-item" key={item.label}>
                                                <span className="power-station-device__base-label">{tzh(item.label)}</span>
                                                <span className="power-station-device__base-value">
                                                    {item?.order === 8
                                                        ? dayjs(item?.value).format(`HH:mm:ss ${dateFormatStr}`)
                                                        : SNInfo?.productType === InverterTypeEnum.SMART_DEVICE_METER && item.order === 5
                                                        ? meterTypeEnum[item.value] ?? '--'
                                                        : (item.value ?? '--') + item.unit}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                ) : null}
                            </Card>
                        </Spin>
                        <Spin spinning={loading}>
                            <Card className="power-station-device__detail">
                                {SNInfo.productType == InverterTypeEnum.SMART_DEVICE_COLLECTOR ||
                                SNInfo?.productType === InverterTypeEnum.SMART_DEVICE_METER ? (
                                    !loading && <RMKRealTime data={realTimeInfo}></RMKRealTime>
                                ) : (
                                    <>
                                        <PowerStationOverview data={overviewData} className="power-station-device__overview" />
                                        <div
                                            className={classnames(
                                                'power-station-device__topology',
                                                `power-station-device__topology--${
                                                    isGrid
                                                        ? 'GRID_INVERTER'
                                                        : isStorage
                                                        ? 'STORAGE_INVERTER'
                                                        : ''
                                                }`
                                            )}>
                                            <div className="power-station-device__topology-item">
                                                <div className="power-station-device__topology-item-content">
                                                    <img
                                                        className="power-station-device__topology-icon"
                                                        src={deviceState != 'OFFLINE' ? PhotovoltaicIcon : PhotovoltaicGrayIcon}
                                                    />
                                                </div>
                                                <div
                                                    className={classnames({
                                                        'power-station-device__topology-item-electric': true
                                                    })}
                                                />
                                                {!isFollower && !isMaster && (
                                                    <div className="power-station-device__topology-item-info">
                                                        <div className="power-station-device__topology-item-info-title">PV</div>
                                                        <table className="power-station-device__topology-item-info-table">
                                                            <thead>
                                                                <tr>
                                                                    <td></td>
                                                                    <td>
                                                                        {tzh('电压')}(
                                                                        {
                                                                            realTimeInfo
                                                                                .find(item => item.order == 2)
                                                                                ?.contents.find(item => item.order == 0)?.contents[0]?.unit
                                                                        }
                                                                        )
                                                                    </td>
                                                                    <td>
                                                                        {tzh('电流')}(
                                                                        {
                                                                            realTimeInfo
                                                                                .find(item => item.order == 2)
                                                                                ?.contents.find(item => item.order == 1)?.contents[0]?.unit
                                                                        }
                                                                        )
                                                                    </td>
                                                                    <td>
                                                                        {tzh('功率')}(
                                                                        {
                                                                            realTimeInfo
                                                                                .find(item => item.order == 2)
                                                                                ?.contents.find(item => item.order == 2)?.contents[0]?.unit
                                                                        }
                                                                        )
                                                                    </td>
                                                                </tr>
                                                            </thead>
                                                        </table>
                                                        <div className="power-station-device__topology-item-info-scroll">
                                                            <table className="power-station-device__topology-item-info-table">
                                                                <tbody>
                                                                    {Array(SNInfo?.lu)
                                                                        ?.fill(0)
                                                                        .map((item, index) => (
                                                                            <tr key={index}>
                                                                                <td>{`PV${index + 1}`}</td>
                                                                                <td className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order == 2)
                                                                                        ?.contents.find(item => item.order == 0)
                                                                                        ?.contents?.find(
                                                                                            item => item.label == `PV${index + 1}`
                                                                                        )?.value ?? '--'}
                                                                                </td>
                                                                                <td className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order == 2)
                                                                                        ?.contents.find(item => item.order == 1)
                                                                                        ?.contents?.find(
                                                                                            item => item.label == `PV${index + 1}`
                                                                                        )?.value ?? '--'}
                                                                                </td>
                                                                                <td className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order == 2)
                                                                                        ?.contents.find(item => item.order == 2)
                                                                                        ?.contents?.find(
                                                                                            item => item.label == `PV${index + 1}`
                                                                                        )?.value ?? '--'}
                                                                                </td>
                                                                            </tr>
                                                                        ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="power-station-device__topology-item">
                                                <div className="power-station-device__topology-item-content">
                                                    <img
                                                        className="power-station-device__topology-icon"
                                                        src={deviceState != 'OFFLINE' ? InvertIcon : InvertGrayIcon}
                                                    />
                                                </div>
                                                <div className="power-station-device__topology-item-info">
                                                    <div className="power-station-device__topology-item-info-title">{tzh('逆变器')}</div>
                                                    <table className="power-station-device__topology-item-info-table">
                                                        <tbody>
                                                            <tr>
                                                                <td>{tzh('设备状态')}</td>
                                                                <td className={classnames('dark', `${deviceState}`)}>
                                                                    {deviceState ? translation(DeviceStateEnum[deviceState]) : '--'}
                                                                </td>
                                                                <td>{tzh('总发电时长')}</td>
                                                                <td className="dark">
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item =>
                                                                            isGrid
                                                                                ? item.order == 17
                                                                                : item.order == 19
                                                                        )?.value ?? '--'}
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item =>
                                                                            isGrid
                                                                                ? item.order == 17
                                                                                : item.order == 19
                                                                        )?.unit ?? '--'}
                                                                </td>
                                                                <td>
                                                                    {isGrid ? tzh('相电压') : tzh('交流电压')}(
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item => item.order == 0)?.contents[0]?.unit ?? '--'}
                                                                    )
                                                                </td>
                                                                {Array(SNInfo?.xiang)
                                                                    ?.fill(0)
                                                                    .map((item, index) => (
                                                                        <td key={index}>
                                                                            {`L${index + 1}`}
                                                                            <span className="dark">
                                                                                {realTimeInfo
                                                                                    .find(item => item.order == 1)
                                                                                    ?.contents.find(item => item.order == 0)?.contents[
                                                                                    index
                                                                                ]?.value ?? '--'}
                                                                            </span>
                                                                        </td>
                                                                    ))}
                                                            </tr>
                                                            <tr>
                                                                {isStorage && (
                                                                    <>
                                                                        <td>{tzh('工作模式')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 1)
                                                                                ?.contents.find(item => item.order == 15)?.value ?? '--'}
                                                                        </td>
                                                                    </>
                                                                )}
                                                                {isGrid && (
                                                                    <>
                                                                        <td>{tzh('电网频率')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 1)
                                                                                ?.contents.find(item => item.order == 19)?.value ?? '--'}
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 1)
                                                                                ?.contents.find(item => item.order == 19)?.unit ?? '--'}
                                                                        </td>
                                                                    </>
                                                                )}

                                                                <td>{tzh('逆变器温度')}</td>
                                                                <td className="dark">
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item =>
                                                                            isGrid
                                                                                ? item.order == 18
                                                                                : item.order == 20
                                                                        )?.value ?? '--'}
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item =>
                                                                            isGrid
                                                                                ? item.order == 18
                                                                                : item.order == 20
                                                                        )?.unit ?? '--'}
                                                                </td>
                                                                <td>
                                                                    {isGrid ? tzh('电流') : tzh('交流电流')}(
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 1)
                                                                        ?.contents.find(item => item.order == 1)?.contents[0]?.unit ?? '--'}
                                                                    )
                                                                </td>
                                                                {Array(SNInfo?.xiang)
                                                                    ?.fill(0)
                                                                    .map((item, index) => (
                                                                        <td key={index}>
                                                                            {`L${index + 1}`}
                                                                            <span className="dark">
                                                                                {realTimeInfo
                                                                                    .find(item => item.order == 1)
                                                                                    ?.contents.find(item => item.order == 1)?.contents[
                                                                                    index
                                                                                ]?.value ?? '--'}
                                                                            </span>
                                                                        </td>
                                                                    ))}
                                                            </tr>
                                                            <tr>
                                                                <td>{tzh('电网类型')}</td>
                                                                <td className="dark">
                                                                    {realTimeInfo
                                                                        .find(item => item.order === 1)
                                                                        ?.contents.find(item => item.order === 14)?.value ?? '--'}
                                                                </td>
                                                                <td>{tzh('防逆流状态')}</td>
                                                                <td className="dark">
                                                                    {realTimeInfo
                                                                        .find(item => item.order === 1)
                                                                        ?.contents.find(item =>
                                                                            isGrid
                                                                                ? item.order === 15
                                                                                : item.order === 17
                                                                        )?.value ?? '--'}
                                                                </td>
                                                                {realTimeInfo
                                                                    .find(item => item.order == 1)
                                                                    ?.contents.find(item =>
                                                                        isGrid
                                                                            ? item.order == 15
                                                                            : item.order == 17
                                                                    )?.value == '开启' && (
                                                                    <>
                                                                        <td>{tzh('上行功率百分比')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 1)
                                                                                ?.contents.find(item =>
                                                                                    isGrid
                                                                                        ? item.order == 16
                                                                                        : item.order == 18
                                                                                )?.value ?? '--'}
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 1)
                                                                                ?.contents.find(item =>
                                                                                    isGrid
                                                                                        ? item.order == 16
                                                                                        : item.order == 18
                                                                                )?.unit ?? '--'}
                                                                        </td>
                                                                    </>
                                                                )}
                                                                {isStorage &&
                                                                    !isFollower &&
                                                                    !isMaster && (
                                                                        <>
                                                                            <td>
                                                                                {tzh('交流功率')}(
                                                                                {realTimeInfo
                                                                                    .find(item => item.order == 1)
                                                                                    ?.contents.find(item => item.order == 2)?.contents[0]
                                                                                    ?.unit ?? '--'}
                                                                                )
                                                                            </td>
                                                                            {Array(SNInfo?.xiang)
                                                                                ?.fill(0)
                                                                                .map((item, index) => (
                                                                                    <td key={index}>
                                                                                        {`L${index + 1}`}
                                                                                        <span className="dark">
                                                                                            {realTimeInfo
                                                                                                .find(item => item.order == 1)
                                                                                                ?.contents.find(item => item.order == 2)
                                                                                                ?.contents[index]?.value ?? '--'}
                                                                                        </span>
                                                                                    </td>
                                                                                ))}
                                                                        </>
                                                                    )}
                                                                {realTimeInfo
                                                                    .find(item => item.order === 2147483647)
                                                                    ?.contents.find(item => item.label === 'GRID_TYPE' && item.value === '0') &&
                                                                    isGrid && (
                                                                        <>
                                                                            <td>{tzh('线电压')}(V)</td>
                                                                            <td>
                                                                                L12
                                                                                <span className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order === 1)
                                                                                        ?.contents.find(item => item.order === 5)
                                                                                        ?.contents.find(item => item.order === 26)?.value ??
                                                                                        '--'}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                L23
                                                                                <span className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order === 1)
                                                                                        ?.contents.find(item => item.order === 5)
                                                                                        ?.contents.find(item => item.order === 27)?.value ??
                                                                                        '--'}
                                                                                </span>
                                                                            </td>
                                                                            <td>
                                                                                L31
                                                                                <span className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order === 1)
                                                                                        ?.contents.find(item => item.order === 5)
                                                                                        ?.contents.find(item => item.order === 28)?.value ??
                                                                                        '--'}
                                                                                </span>
                                                                            </td>
                                                                        </>
                                                                    )}
                                                            </tr>
                                                            {isStorage && !isFollower && (
                                                                <tr>
                                                                    <td>{tzh('电表接入状态')}</td>
                                                                    <td className="dark">
                                                                        {realTimeInfo
                                                                            .find(item => item.order == 1)
                                                                            ?.contents.find(item => item.order == 16)?.value ?? '--'}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="power-station-device__topology-item">
                                                <div className="power-station-device__topology-item-content">
                                                    <img
                                                        className="power-station-device__topology-icon"
                                                        src={deviceState != 'OFFLINE' ? ElectricitIcon : ElectricitGryIcon}
                                                    />
                                                </div>
                                                <div
                                                    className={classnames({
                                                        'power-station-device__topology-item-electric': true,
                                                        'power-station-device__topology-item-electric--hide': !realTime.netIconLight,
                                                        'power-station-device__topology-item-electric--reverse':
                                                            realTime.joinNetFlowDirection
                                                    })}
                                                />
                                                {!isFollower && (
                                                    <div className="power-station-device__topology-item-info">
                                                        <div className="power-station-device__topology-item-info-title">{tzh('电表')}</div>
                                                        <table className="power-station-device__topology-item-info-table">
                                                            <tbody>
                                                                <tr>
                                                                    <td>{tzh('电表总功率')}</td>
                                                                    <td className="dark">
                                                                        {isStorage &&
                                                                            (realTimeInfo
                                                                                .find(item => item.order == 5)
                                                                                ?.contents.find(item => item.order == 71)?.value +
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 5)
                                                                                    ?.contents.find(item => item.order == 71)?.unit ??
                                                                                '--')}
                                                                        {isGrid &&
                                                                            (realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 59)?.value +
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 59)?.unit ??
                                                                                '--')}
                                                                    </td>
                                                                </tr>
                                                                {SNInfo?.xiang == 3 && (
                                                                    <>
                                                                        <tr>
                                                                            <td>{tzh('电表L1功率')}</td>
                                                                            <td className="dark">
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 60)?.value
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order === 6)
                                                                                          ?.contents.find(item => item.order === 2)
                                                                                          ?.contents.find(item => item.order === 72)
                                                                                          ?.value ?? '--'}
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 60)?.unit
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order == 6)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 72)?.unit ??
                                                                                      '--'}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>{tzh('电表L2功率')}</td>
                                                                            <td className="dark">
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 61)?.value
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order == 6)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 73)
                                                                                          ?.value ?? '--'}
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 61)?.unit
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order == 6)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 73)?.unit ??
                                                                                      '--'}
                                                                            </td>
                                                                        </tr>
                                                                        <tr>
                                                                            <td>{tzh('电表L3功率')}</td>
                                                                            <td className="dark">
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 62)?.value
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order == 6)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 74)
                                                                                          ?.value ?? '--'}
                                                                                {isGrid
                                                                                    ? realTimeInfo
                                                                                          .find(item => item.order == 3)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 62)?.unit
                                                                                    : realTimeInfo
                                                                                          .find(item => item.order == 6)
                                                                                          ?.contents.find(item => item.order == 2)
                                                                                          ?.contents.find(item => item.order == 74)?.unit ??
                                                                                      '--'}
                                                                            </td>
                                                                        </tr>
                                                                    </>
                                                                )}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="power-station-device__topology-item">
                                                <div className="power-station-device__topology-item-content">
                                                    <img
                                                        className="power-station-device__topology-icon"
                                                        src={deviceState != 'OFFLINE' ? BetteryIcon : BetteryGrayIcon}
                                                    />
                                                </div>
                                                <div
                                                    className={classnames({
                                                        'power-station-device__topology-item-electric': true,
                                                        'power-station-device__topology-item-electric--hide': !realTime.batteryIconLight,
                                                        'power-station-device__topology-item-electric--reverse':
                                                            realTime.batteryChargedFlowDirection
                                                    })}
                                                />
                                                <div className="power-station-device__topology-item-info">
                                                    <div className="power-station-device__topology-item-info-title">{tzh('电池')}</div>
                                                    <table className="power-station-device__topology-item-info-table">
                                                        <tbody>
                                                            <tr>
                                                                <td>{tzh('电池型号')}</td>
                                                                <td className="dark">
                                                                    {realTimeInfo
                                                                        .find(item => item.order == 3)
                                                                        ?.contents.find(item => item.order == 42)?.value ?? '--'}
                                                                </td>
                                                                {realTimeInfo
                                                                    .find(item => item.order == 3)
                                                                    ?.contents.find(item => item.order == 42)?.value !== 'No_Battery' && (
                                                                    <>
                                                                        <td>SOH</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 51)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 51)?.unit
                                                                            }
                                                                        </td>
                                                                    </>
                                                                )}
                                                            </tr>
                                                            {realTimeInfo
                                                                .find(item => item.order == 3)
                                                                ?.contents.find(item => item.order == 42)?.value !== 'No_Battery' && (
                                                                <>
                                                                    <tr>
                                                                        <td>{tzh('电池容量')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 43)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 43)?.unit
                                                                            }
                                                                        </td>
                                                                        <td>SOC</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 50)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 50)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{tzh('充放电状态')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 45)?.value ?? '--'}
                                                                        </td>
                                                                        <td>{tzh('充电电流限值')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 54)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 54)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{tzh('BMS充放电状态')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 46)?.value ?? '--'}
                                                                        </td>
                                                                        <td>{tzh('放电电流限值')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 55)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 55)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{tzh('电池功率')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 47)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 47)?.unit
                                                                            }
                                                                        </td>
                                                                        <td>{tzh('最小电芯电压')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 52)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 52)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{tzh('电池电压')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 49)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 49)?.unit
                                                                            }
                                                                        </td>
                                                                        <td>{tzh('最大电芯电压')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 53)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 53)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                    <tr>
                                                                        <td>{tzh('电池电流')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 48)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 48)?.unit
                                                                            }
                                                                        </td>
                                                                        <td>{tzh('温度')}</td>
                                                                        <td className="dark">
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 3)
                                                                                ?.contents.find(item => item.order == 44)?.value ?? '--'}
                                                                            {
                                                                                realTimeInfo
                                                                                    .find(item => item.order == 3)
                                                                                    ?.contents.find(item => item.order == 44)?.unit
                                                                            }
                                                                        </td>
                                                                    </tr>
                                                                </>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                            <div className="power-station-device__topology-item">
                                                <div className="power-station-device__topology-item-content">
                                                    <img
                                                        className="power-station-device__topology-icon"
                                                        src={deviceState != 'OFFLINE' ? ConsumptionIcon : ConsumptionGrayIcon}
                                                    />
                                                </div>
                                                <div
                                                    className={classnames({
                                                        'power-station-device__topology-item-electric': true,
                                                        'power-station-device__topology-item-electric--hide': !realTime.loadIconLight,
                                                        'power-station-device__topology-item-electric--reverse': realTime.loadFlowDirection
                                                    })}
                                                />
                                                <div className="power-station-device__topology-item-info">
                                                    <div className="power-station-device__topology-item-info-title">{tzh('负载')}</div>
                                                    <table className="power-station-device__topology-item-info-table">
                                                        <tbody>
                                                            {isGrid && (
                                                                <tr>
                                                                    <td>{tzh('负载功率')}</td>
                                                                    <td>
                                                                        {realTimeInfo
                                                                            .find(item => item.order == 4)
                                                                            ?.contents.find(item => item.order == 63)?.value ?? '--'}
                                                                        {realTimeInfo
                                                                            .find(item => item.order == 4)
                                                                            ?.contents.find(item => item.order == 63)?.unit ?? '--'}
                                                                    </td>
                                                                </tr>
                                                            )}
                                                            {isStorage && (
                                                                <>
                                                                    <tr>
                                                                        <td>
                                                                            {tzh('备用侧负载电压')}(
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 4)
                                                                                ?.contents.find(item => item.order == 0)?.contents[0]
                                                                                ?.unit ?? '--'}
                                                                            )
                                                                        </td>
                                                                        {Array(SNInfo?.xiang)
                                                                            ?.fill(0)
                                                                            .map((item, index) => (
                                                                                <td key={index}>
                                                                                    {`L${index + 1}`}
                                                                                    <span className="dark">
                                                                                        {realTimeInfo
                                                                                            .find(item => item.order == 4)
                                                                                            ?.contents.find(item => item.order == 0)
                                                                                            ?.contents[index]?.value ?? '--'}
                                                                                    </span>
                                                                                </td>
                                                                            ))}
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            {tzh('备用侧负载电流')}(
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 4)
                                                                                ?.contents.find(item => item.order == 1)?.contents[0]
                                                                                ?.unit ?? '--'}
                                                                            )
                                                                        </td>
                                                                        {Array(SNInfo?.xiang)
                                                                            ?.fill(0)
                                                                            .map((item, index) => (
                                                                                <td key={index}>
                                                                                    {`L${index + 1}`}
                                                                                    <span className="dark">
                                                                                        {realTimeInfo
                                                                                            .find(item => item.order == 4)
                                                                                            ?.contents.find(item => item.order == 1)
                                                                                            ?.contents[index]?.value ?? '--'}
                                                                                    </span>
                                                                                </td>
                                                                            ))}
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            {tzh('备用侧负载功率')}(
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 4)
                                                                                ?.contents.find(item => item.order == 2)?.contents[0]
                                                                                ?.unit ?? '--'}
                                                                            )
                                                                        </td>
                                                                        {Array(SNInfo?.xiang)
                                                                            ?.fill(0)
                                                                            .map((item, index) => (
                                                                                <td key={index}>
                                                                                    {`L${index + 1}`}
                                                                                    <span className="dark">
                                                                                        {realTimeInfo
                                                                                            .find(item => item.order == 4)
                                                                                            ?.contents.find(item => item.order == 2)
                                                                                            ?.contents[index]?.value ?? '--'}
                                                                                    </span>
                                                                                </td>
                                                                            ))}
                                                                    </tr>
                                                                    <tr>
                                                                        <td>
                                                                            {tzh('备用侧负载频率')}(
                                                                            {realTimeInfo
                                                                                .find(item => item.order == 4)
                                                                                ?.contents.find(item => item.order == 4)?.contents[0]
                                                                                ?.unit ?? '--'}
                                                                            )
                                                                        </td>
                                                                        {Array(SNInfo?.xiang)
                                                                            ?.fill(0)
                                                                            .map((item, index) => (
                                                                                <td key={index}>
                                                                                    {`L${index + 1}`}
                                                                                    <span className="dark">
                                                                                        {realTimeInfo
                                                                                            .find(item => item.order == 4)
                                                                                            ?.contents.find(item => item.order == 4)
                                                                                            ?.contents[index]?.value ?? '--'}
                                                                                    </span>
                                                                                </td>
                                                                            ))}
                                                                    </tr>
                                                                    {/* {!isFollower && !isMaster && (
                                                                        <tr>
                                                                            <td>
                                                                                {tzh('电网侧负载总功率')}(
                                                                                {realTimeInfo
                                                                                    .find(item => item.order == 5)
                                                                                    ?.contents.find(item => item.order == 68)?.unit ?? '--'}
                                                                                )
                                                                            </td>

                                                                            <td>
                                                                                <span className="dark">
                                                                                    {realTimeInfo
                                                                                        .find(item => item.order == 5)
                                                                                        ?.contents.find(item => item.order == 68)?.value ??
                                                                                        '--'}
                                                                                </span>
                                                                            </td>
                                                                        </tr>
                                                                    )} */}
                                                                    {!isFollower && !isMaster && SNInfo?.xiang == 3 && (
                                                                        <tr>
                                                                            <td>
                                                                                {tzh('电网侧负载功率')}(
                                                                                {realTimeInfo
                                                                                    .find(item => item.order == 5)
                                                                                    ?.contents.find(item => item.order == 2)?.contents[0]
                                                                                    ?.unit ?? '--'}
                                                                                )
                                                                            </td>
                                                                            {Array(SNInfo?.xiang)
                                                                                ?.fill(0)
                                                                                .map((item, index) => (
                                                                                    <td key={index}>
                                                                                        {`L${index + 1}`}
                                                                                        <span className="dark">
                                                                                            {realTimeInfo
                                                                                                .find(item => item.order == 5)
                                                                                                ?.contents.find(item => item.order == 2)
                                                                                                ?.contents[index]?.value ?? '--'}
                                                                                        </span>
                                                                                    </td>
                                                                                ))}
                                                                        </tr>
                                                                    )}
                                                                </>
                                                            )}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </Card>
                        </Spin>
                    </>
                ) : (
                    <div className="emptyStation">
                        <img className="emptyStation-icon" src={EmptyDevice} />
                        <span className="emptyStation-desc">{tzh('暂无数据')}</span>
                    </div>
                ))}
            {currentTab === tabs[1].key && (
                <DateHeadPanel
                    onChange={handlePowerChartViewChange}
                    datePickerProps={{ disabledDate }}
                    className="power-station-device__panel">
                    <Spin spinning={loading.chartData}>
                        <ChartView
                            key={chartViewKey}
                            chartData={chartData}
                            {...chartViewProps}
                            className="power-station-device__panel-chart"
                        />
                    </Spin>
                </DateHeadPanel>
            )}
            {currentTab === tabs[2].key && (
                <Card className="power-station-device__pro">
                    <div className="power-station-device__pro-params">
                        <div className="power-station-device__pro-params-head">{tzh('选择参数')}</div>
                        <div className="power-station-device__pro-params-body">
                            <Spin spinning={loading.parameters}>
                                {parameters.map(parameter => (
                                    <Fragment key={parameter.fieldName}>
                                        <div className="power-station-device__pro-params-title">{parameter.fieldName}</div>
                                        {parameter.fields.map(item => (
                                            <div className="power-station-device__pro-params-item" key={item.value}>
                                                <Checkbox
                                                    checked={proParams.typeIdMap[item.value]}
                                                    onChange={e => handleParamCheck(e, item.value)}>
                                                    {item.label}
                                                    {/* {item.label && `(${item.label})`} */}
                                                </Checkbox>
                                            </div>
                                        ))}
                                    </Fragment>
                                ))}
                            </Spin>
                        </div>
                        <div className="power-station-device__pro-params-footer">
                            <Button onClick={handleClearParams}>{tzh('清除')}</Button>
                            <Button type="primary" onClick={handleConfirmParams}>
                                {tzh('确定')}
                            </Button>
                        </div>
                    </div>
                    <DateHeadPanel
                        sn={sn}
                        typeIds={typeIds}
                        pure
                        hideParamsTemplate={false}
                        hideDateType
                        clearTemplateActive={clearTemplateFlag}
                        datePickerProps={{ disabledDate }}
                        onChange={handlePowerChartViewChange}
                        onTemplateClick={handleTemplateClick}
                        className="power-station-device__pro-panel">
                        <ChartView
                            key={chartViewKey}
                            chartData={chartData}
                            {...chartViewProps}
                            className="power-station-device__panel-chart"
                        />
                    </DateHeadPanel>
                </Card>
            )}
            {tabs[3] && currentTab === tabs[3].key && (
                <Card className="power-station-device__sub">
                    <Table
                        loading={loading.table}
                        columns={tableColumns}
                        dataSource={records}
                        rowKey="sn"
                        size="small"
                        tableLayout="fixed"
                        scroll={{ x: '100%' }}
                        pagination={{
                            pageSize: subDeviceParams.pageSize,
                            current: subDeviceParams.pageNo,
                            total: subDeviceParams.total,
                            showSizeChanger: true,
                            showTotal: total => `${tzh('共')} ${total} ${tzh('条')}`,
                            showQuickJumper: true,
                            onChange: handlePageChange
                        }}
                    />
                </Card>
            )}
        </div>
    );
});

export default PowerStation;
