import {environment} from '../../environments/environment';

export const CONFIG = {
  SYSTEM_CODE: 'BGW',
  KEY: {
    TOKEN: `${environment.appVersion}-${environment.USERDATA_KEY}`,
    LOCALIZATION: 'language',
    USER_PERMISSION: 'userPermission',
    RESPONSE_BODY_LOGIN: 'userRes',
    USER_NAME: 'userName'
  },
  USER_ROLE: {
    CMS_CORP_STAFF: 'CMS_CORP_STAFF',
    CMS_PROV_VICE_PRESIDENT: 'CMS_PROV_VICE_PRESIDENT',
    CMS_PROV_INFA_STAFF: 'CMS_PROV_INFA_STAFF',
    CMS_PROV_TECH_STAFF: 'CMS_PROV_TECH_STAFF',
    CMS_BTS_PNO_STAFF: 'CMS_BTS_PNO_STAFF',
    CMS_BTS_CND_STAFF: 'CMS_BTS_CND_STAFF',
    CMS_BTS_TCCN_STAFF: 'CMS_BTS_TCCN_STAFF',
    CMS_BTS_CN_STAFF: 'CMS_BTS_CN_STAFF',
    CMS_BTS_GRAND_TC_STAFF: 'CMS_BTS_GRAND_TC_STAFF',
    CMS_BTS_NOC_STAFF: 'CMS_BTS_NOC_STAFF'

  },
  API_PATH: {
    FUNCTION_CATEGORIES: '/function-categories',
    FUNCTION_CATEGORIES_LIST: '/function-categories/list',
    FUNCTION_CATEGORIES_DELETE: '/function-categories/delete',
    ERROR_TYPE_CATEGORY_LIST: '/error-categories/listType',
    ERROR_TYPE_CATEGORY: '/error-categories/createOrUpdateType',
    ERROR_TYPE_CATEGORY_BY_ID: '/error-categories/errorType',
    ERROR_TYPE_CATEGORY_DELETE: '/error-categories/deleteErrorType',
    SYSTEM_CATEGORY_LIST: '/system-management/listCategory',
    SYSTEM_CATEGORY: '/system-management/createOrUpdateSystemCategory',
    SYSTEM_CATEGORY_BY_ID: '/system-management/systemCategory',
    SYSTEM_CATEGORY_DELETE: '/system-management/deleteSystemCategory',
    SYSTEM_MANAGEMENT_LIST: '/system-management/list',
    SYSTEM_MANAGEMENT_FOR_PARENT_LIST: '/system-management/listForParent',
    SYSTEM_MANAGEMENT_BY_ID: '/system-management/system',
    SYSTEM_MANAGEMENT: '/system-management/createOrUpdateSystem',
    SYSTEM_MANAGEMENT_DELETE: '/system-management/deleteSystem',
    ACTION_CATEGORY_LIST: '/action-management/listCategory',
    ACTION_CATEGORY: '/action-management/createOrUpdateActionCategory',
    ACTION_CATEGORY_BY_ID: '/action-management/ActionCategory',
    ACTION_CATEGORY_DELETE: '/action-management/deleteActionCategory',
    ACTION_MANAGEMENT_LIST: '/action-management/list',
    ACTION_MANAGEMENT_BY_ID: '/action-management/action',
    ACTION_MANAGEMENT: '/action-management/createOrUpdateAction',
    ACTION_MANAGEMENT_DELETE: '/action-management/deleteAction',
    SERVICE_LIST: '/service-management/list',
    SERVICE_FOR_PARENT_LIST: '/service-management/listForParent',
    SERVICE_BY_ID: '/service-management/service',
    SERVICE: '/service-management/createOrUpdateService',
    SERVICE_DELETE: '/service-management/deleteService',
    SERVICE_MAP_LIST: '/service-management/listMap',
    SERVICE_MAP_BY_ID: '/service-management/serviceMap',
    SERVICE_MAP: '/service-management/createOrUpdateServiceMap',
    SERVICE_MAP_DELETE: '/service-management/deleteServiceMap',
    ALARM_SEVERITY_LIST: '/error-categories/listSeverity',
    ALARM_SEVERITY_BY_ID: '/error-categories/alarmSeverity',
    ALARM_SEVERITY: '/error-categories/createOrUpdateSeverity',
    ALARM_SEVERITY_DELETE: '/error-categories/deleteAlarmSeverity',
    ALARM_DICTIONARY_LIST: '/error-categories/listDictionary',
    ALARM_DICTIONARY_BY_ID: '/error-categories/alarmDictionary',
    ALARM_DICTIONARY: '/error-categories/createOrUpdateDictionary',
    ALARM_DICTIONARY_DELETE: '/error-categories/deleteAlarmDictionary',
    ALARM_DASHBOARD_DETAIL: '/dashboard-alarm/listAlarmDetail',
    ALARM_DASHBOARD_GROUP: '/dashboard-alarm/listAlarmGroup',
    REPORT_DASHBOARD_FILE: '/report/reportFile?fileBirt=bao-cao-dashboard',
    REPORT_DASHBOARD_HTML: '/report/reportHtml?fileBirt=bao-cao-dashboard',
    REPORT_SYSTEM_ERROR_FILE: '/report/reportFile?fileBirt=bao-cao-loi-trong-he-thong',
    REPORT_SYSTEM_ERROR_HTML: '/report/reportHtml?fileBirt=bao-cao-loi-trong-he-thong',
    REPORT_ERROR_OCCURRED_RESOLVED_FILE: '/report/reportFile?fileBirt=bao-cao-thong-ke-loi',
    REPORT_ERROR_OCCURRED_RESOLVED_HTML: '/report/reportHtml?fileBirt=bao-cao-thong-ke-loi',
    REPORT_STATION_MONTHLY_FILE: '/reportFile?fileBirt=ReportPaymentOfMonthly.rptdesign',
    REPORT_STATION_MONTHLY_HTML: '/reportHtml?fileBirt=ReportPaymentOfMonthly.rptdesign',
    REPORT_STATION_ANNUAL_FILE: '/reportFile?fileBirt=ReportPaymentOfYearly.rptdesign',
    REPORT_STATION_ANNUAL_HTML: '/reportHtml?fileBirt=ReportPaymentOfYearly.rptdesign',
    REPORT_STATION_MONTHLY_PROVINCE_FILE: '/reportFile?fileBirt=ReportPaymentOfMonthlyByProvince.rptdesign',
    REPORT_STATION_MONTHLY_PROVINCE_HTML: '/reportHtml?fileBirt=ReportPaymentOfMonthlyByProvince.rptdesign',
    REPORT_STATION_PROGRESS_FILE: '/reportFile?fileBirt=GSCT.rptdesign',
    REPORT_STATION_PROGRESS_HTML: '/reportHtml?fileBirt=GSCT.rptdesign',
    REPORT_STATION_ACUMMUL_FILE: '/reportFile?fileBirt=ReportPaymentAccumulatedByTime.rptdesign',
    REPORT_STATION_ACUMMUL_HTML: '/reportHtml?fileBirt=ReportPaymentAccumulatedByTime.rptdesign',
    //NQM-start
    REPORT_GNET_TRACK_FILE: '/reportFile?fileBirt=ExportGnetTrack.rptdesign',
    REPORT_GNET_TRACK_HTML: '/reportHtml?fileBirt=ExportGnetTrack.rptdesign',
    REPORT_SPEED_TEST_FILE: '/reportFile?fileBirt=ExportSpeedTest.rptdesign',
    REPORT_SPEED_TEST_HTML: '/reportHtml?fileBirt=ExportSpeedTest.rptdesign',
    REPORT_NATION_GNET_TRACK_FILE: '/reportFile?fileBirt=ExportNationGnetTrack.rptdesign',
    REPORT_NATION_GNET_TRACK_HTML: '/reportHtml?fileBirt=ExportNationGnetTrack.rptdesign',
    REPORT_PROVINCE_GNET_TRACK_FILE: '/reportFile?fileBirt=ExportProvinceGnetTrack.rptdesign',
    REPORT_PROVINCE_GNET_TRACK_HTML: '/reportHtml?fileBirt=ExportProvinceGnetTrack.rptdesign',
    REPORT_DISTRICT_GNET_TRACK_FILE: '/reportFile?fileBirt=ExportDistrictGnetTrack.rptdesign',
    REPORT_DISTRICT_GNET_TRACK_HTML: '/reportHtml?fileBirt=ExportDistrictGnetTrack.rptdesign',
    REPORT_COMMUNE_GNET_TRACK_FILE: '/reportFile?fileBirt=ExportCommuneGnetTrack.rptdesign',
    REPORT_COMMUNE_GNET_TRACK_HTML: '/reportHtml?fileBirt=ExportCommuneGnetTrack.rptdesign',
    REPORT_NATION_BOD_FILE: '/reportFile?fileBirt=ExportNationBOD.rptdesign',
    REPORT_NATION_BOD_HTML: '/reportHtml?fileBirt=ExportNationBOD.rptdesign',
    REPORT_PROVINCE_BOD_FILE: '/reportFile?fileBirt=ExportProvinceBOD.rptdesign',
    REPORT_PROVINCE_BOD_HTML: '/reportHtml?fileBirt=ExportProvinceBOD.rptdesign',
    REPORT_DISTRICT_BOD_FILE: '/reportFile?fileBirt=ExportDistrictBOD.rptdesign',
    REPORT_DISTRICT_BOD_HTML: '/reportHtml?fileBirt=ExportDistrictBOD.rptdesign',
    REPORT_COMMUNE_BOD_FILE: '/reportFile?fileBirt=ExportCommuneBOD.rptdesign',
    REPORT_COMMUNE_BOD_HTML: '/reportHtml?fileBirt=ExportCommuneBOD.rptdesign',
    //NQM-end
    ALARM_COLOR_LIST: '/error-categories/listAlarmColor',
    ALARM_COLOR_UPDATE: '/error-categories/updateAlarmColor',
    EXPORT_ALARM_DETAIL: '/dashboard-alarm/exportAlarmDetail',
    ALARM_AUDIO_LIST: '/error-categories/listAlarmAudio',
    ALARM_AUDIO_UPDATE_SERVER: '/error-categories/updateAlarmAudioServer',
    ALARM_AUDIO_UPDATE_LOCAL: '/error-categories/updateAlarmAudioLocal',
    ALARM_SERVER_AUDIO_LIST: '/error-categories/getServerAudioList',
    ALARM_SERVER_AUDIO_CONTENT: '/error-categories/getServerAudioContent/',
    LOGIC_MAP: '/service-management/serviceMapBySystem',
    LIST_TOTAL_SEVERITY: '/service-management/totalSeverity',
    ALARM_DASHBOARD_GROUP_DETAIL: '/dashboard-alarm/listAlarmGroup'
  },
  PAGINATION: {
    CURRENT_PAGE_DEFAULT: 1,
    PAGE_LIMIT_DEFAULT: 10
  },

  STATUS: {
   ACTIVE: 'O',
   INACTIVE: 'C'
  },

  LIST_STATUS_EDIT: [
    {
      CODE: 'O',
      NAME: 'ACTIVE',
    },
    {
      CODE: 'C',
      NAME: 'INACTIVE',
    },
  ],

  LIST_STATUS: [
    {
      CODE: -1,
      NAME: 'ALL',
    },
    {
      CODE: 'O',
      NAME: 'ACTIVE',
    },
    {
      CODE: 'C',
      NAME: 'INACTIVE',
    },
  ],
  LINE_COLLECT_TYPE: [
    {
      CODE: '-1',
      NAME: 'ALL',
    },
    {
      CODE: 'A',
      NAME: 'AUTO'
    },
    {
      CODE: 'M',
      NAME: 'MANUAL'
    }
  ],
  COLLECT_TYPE: {
    AUTO: 'A',
    MANUAL: 'M'
  },
  LINE_ACTION_TYPE: [
    {
      CODE: 'A',
      NAME: 'ALL',
    },
    {
      CODE: 'P',
      NAME: 'PRODUCT'
    },
    {
      CODE: 'C',
      NAME: 'ACTION'
    }
  ],
  ACTION_TYPE: {
    PRODUCT: 'P',
    ACTION: 'C'
  },
  LINE_SERVICE_TYPE: [
    {
      CODE: 'A',
      NAME: 'ALL',
    },
    {
      CODE: 'F',
      NAME: 'FRONTEND'
    },
    {
      CODE: 'B',
      NAME: 'BACKEND'
    }
  ],
  LINE_SERVICE_STATUS: [
    {
      CODE: 'A',
      NAME: 'ALL',
    },
    {
      CODE: 'O',
      NAME: 'ACTIVE'
    },
    {
      CODE: 'C',
      NAME: 'INACTIVE'
    },
    {
      CODE: 'D',
      NAME: 'DISCONNECT'
    }
  ],
  STATUS_SERVICE: {
    ACTIVE: 'O',
    INACTIVE: 'C',
    DISCONNECT: 'D'
  },
  SERVICE_TYPE: {
    FRONTEND: 'F',
    BACKEND: 'B'
  },
  LINE_OBJECT_TYPE: [
    {
      CODE: 'T',
      NAME: 'ALL',
    },
    {
      CODE: 'C',
      NAME: 'ACTION_CATEGORY'
    },
    {
      CODE: 'A',
      NAME: 'ACTION'
    }
  ],
  OBJECT_TYPE: {
    ACTION_CATEGORY: 'C',
    ACTION: 'A'
  },
  LINE_CLR_STATUS: [
    {
      CODE: '-1',
      NAME: 'ALL',
    },
    {
      CODE: '1',
      NAME: 'CLEAR'
    },
    {
      CODE: '0',
      NAME: 'NOT_CLEAR'
    }
  ],
  CLR_STATUS: {
    CLEAR: '1',
    NOT_CLEAR: '0'
  },
  FORMAT_DATE: {
    NORMAL: 'dd-MM-yyy'
  },

};

// export const  WEBSOCKET_ENDPOINT = `${environment.WS_BASE_URL}`;
export const  WEBSOCKET_NOTIFY_TOPIC = '/topic/notif';
