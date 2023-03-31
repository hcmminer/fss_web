import { JobRequestDTO, OptionSetDTO, RoutingDetailDTO, RoutingDTO } from "./quan-ly-phieu-cong-tac.model";

export class RequestApiModel {
  functionName: string;
  method?: string;
  params?: RequestParamModel;
  isUploadFile?: boolean;
  formData?: FormData | any;
  responseType?: string;
  observe?: string;
  isNotShowSpinner?: boolean;
}

export class RequestParamModel {
  userName?: string;
  optionSetDTO?: OptionSetDTO;
  jobRequestDTO?: JobRequestDTO;
  staffType?: string;
  shopType?: string;
  routingDTO?: RoutingDTO;
  routingDetailDTO?:RoutingDetailDTO;
  shopState?: string;
  isSignVOStaff?: boolean;
  lstEmail?: any[];
  jobRequestId?: number;
  toWhoVi?: string;
  branchVi?: string;
  workingContentVi?: string;
  baseVi?: string;
  toWhoEn?: string;
  branchEn?: string;
  workingContentEn?: string;
  baseEn?: string;
  toWhoLa?: string;
  branchLa?: string;
  workingContentLa?: string;
  baseLa?: string;
  userNameSignVo?: string;
  passwordSignVo?: string;
  listLocale?: string[];
}
