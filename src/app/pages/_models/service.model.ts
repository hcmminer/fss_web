import {NgbDate} from '@ng-bootstrap/ng-bootstrap';

export class ServiceModel{
  serviceId?: number;
  systemId?: number;
  parentId?: number;
  serviceType?: string;
  serviceCode?: string;
  serviceName?: string;
  serviceURL?: string;
  ipPort?: string;
  endDate?: string;
  ivalidEndate?: NgbDate;
  orderNo?: number;
  numChildLevel?: number;
  description?: string;
  status?: string;
  // add
  systemName?: string;
  parentService?: string;
}

export class ServiceMap{
  mapId?: number;
  serviceId?: number;
  secondServiceId?: number;
  orderNo?: number;
  status?: string;

  // add
  serviceCode?: string;
  serviceName?: string;
  secondServiceCode?: string;
  secondServiceName?: string;
}

export class TotalSeverity {
  severityName?: string;
  total?: number;
}
