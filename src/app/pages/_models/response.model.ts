export class ResponseModel {
  status: boolean;
  message?: string;
  data?: {} | [] | any;
  pageLimit?: number;
  pageTotal?: number;
  currentPage?: number;
  recordTotal?: number;
  errorCode?: string;
  description?: string;
}
