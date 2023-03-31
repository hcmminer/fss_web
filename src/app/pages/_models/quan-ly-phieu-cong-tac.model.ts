export class OptionSetDTO {
    optionSetId?: number;
    optionSetCode?: string;
    description?: string;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    status?: number;
    language?: string;
    optionSetValueId?: number;
    name?: string;
    value?: string;
    optionSetValueDesc?: string;
}

export class JobRequestDTO {
    jobRequestId?: number;
    code?: string;
    name?: string;
    description?: string;
    purpose?: string;
    sourceExpense?: string;
    documentName?: string;
    advanceStaffId?: number;
    fromDate?: string;
    toDate?: string;
    realAmount?: number;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    status?: number;
    note?: string;
    realBusinessAmount?: number;
    realRoutingAmount?: number;
    realOtherAmount?: number;
    realHotelAmount?: number;
    type?: number;
    numberDayBusiness?: number;
    numberDayHotel?: number;
    purposeName?: string;
    advanceStaffName?: string;
    hotelEstimateAmount?: number;
    businessEstimateAmount?: number;
    otherEstimateAmount?: number;
    routingEstimateAmount?: number;
    signVofficeStatus?: number;
    signVofficeStatusName?: string;
    listJobRoutingDTO?: JobRoutingDTO[];
    isSign?:boolean;
    nameShop?: string;
}

export class JobRoutingDTO {
    id?: number;
    jobRequestId?: number;
    fromShopId?: number;
    toShopId?: number;
    partnerStaffId?: number;
    partnerShopId?: number;
    startProvinceId?: number;
    endProvinceId?: number;
    createdDatetime?: string;
    createdBy?: string;
    routingName?: string;
    type?: number;
    name?: string;
    note?: string;
    startProvinceName?: string;
    endProvinceName?: string;
    partnerStaffName?: string;
    fromShopName?: string;
    toShopName?: string;
    partnerShopName?: string;
    partnerName?: string;
    routingId?: number;
    listJobRoutingDetailDTO?: JobRoutingDetailDTO[];
    listJobAttachDTO?: JobAttachDTO[];
    totalAmount?: number;
    fromDate?: string;
    toDate?: string;
    numberDayBusiness?: number;
    numberDayHotel?: number;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    hotelEstimateAmount?: number;
    businessEstimateAmount?: number;
    otherEstimateAmount?: number;
    routingEstimateAmount?: number;
}

export class JobRoutingDetailDTO {
    id?: number;
    jobRoutingId?: number;
    fromProvinceId?: number;
    toProvinceId?: number;
    vehicleType?: string;
    price?: number;
    fromProvinceName?: string;
    toProvinceName?: string;
    vehicleTypeName?: string;
    note?: string;
    createdDatetime?: string;
    createdBy?: string;
    routingId?: number;
}

export class JobStaffDTO {
    id?: number;
    jobRoutingId?: number;
    staffId?: number;
    note?: string;
    price?: number;
    staffCode?: string;
    staffName?: string;
    email?: string;
    mobile?: string;
    titleName?: string;
    createdDatetime?: string;
    createdBy?: string;
    title?: string;
}

export class JobHotelDTO {
    id?: number;
    jobRoutingId?: number;
    hotelId?: number;
    numberOfDay?: number;
    numberOfRoom?: number;
    note?: string;
    hotelName?: string;
    hotelPhone?: string;
    provinceCode?: string;
    provinceName?: string;
    roomType?: string;
    roomTypeName?: string;
    price?: number;
    createdDatetime?: string;
    createdBy?: string;
}

export class JobOtherDTO {
    id?: number;
    jobRoutingId?: number;
    otherType?: string;
    estimateAmount?: number;
    note?: string;
    otherTypeName?: string;
    createdDatetime?: string;
    createdBy?: string;
}

export class JobAttachDTO {
    id?: number;
    jobRoutingId?: number;
    type?: string;
    typeName?: string;
    fileName?: string;
    filePath?: string;
    createdDatetime?: string;
    createdBy?: string;
    status?: number;
    note?: string;
    file?: any;
    serverFileName?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
}

export class RoutingDTO {
    routingId?: number | string;
    name?: string;
    startProvinceId?: number;
    endProvinceId?: number;
    totalAmount?: number;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    status?: number;
    startProvinceName?: string;
    endProvinceName?: string;
    listRoutingDetailDTO?: RoutingDetailDTO[];
    note?: string;
}

export class RoutingDetailDTO {
    id?: number;
    routingId?: number;
    fromProvinceId?: number;
    toProvinceId?: number;
    vehicleType?: string;
    price?: number;
    fromProvinceName?: string;
    toProvinceName?: string;
    vehicleTypeName?: string;
    ord?: number;
    isNew?:boolean;
}
export class VehicleDTO{
    optionSetId?: number;
    optionSetCode?: string;
    name?: string;
    createdBy?: string;
    value?: number;
    optionSetValueId?: number;
}

export class StaffDTO {
    staffId?: number | string;
    shopId?: number;
    staffCode?: string;
    staffName?: string;
    staffCodeNumber?: string;
    mobile?: string;
    provinceId?: number;
    email?: string;
    gender?: string;
    title?: string;
    umoneyAccount?: string;
    note?: string;
    status?: number;
    staffType?: string;
    shopCode?: string;
    shopName?: string;
    shopPath?: string;
    provinceCode?: string;
    provinceName?: string;
    titleName?: string;
    orderSign?: number;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    staffTypeName?: string;
    genderName?: string;
    shopStaffEmail?: string;
}

export class ShopDTO {
    shopId?: number | string;
    shopCode?: string;
    shopName?: string;
    parentShopId?: number;
    provinceId?: number;
    status?: number;
    shopType?: string;
    shopPath?: string;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    provinceCode?: string;
    provinceName?: string;
    shopTypeName?: string;
}

export class ProvinceDTO {
    provinceId?: number | string;
    provinceCode?: string;
    provinceName?: string;
    type?: number;
}

export class HotelDTO {
    hotelId?: number | string;
    hotelName?: string;
    telephone?: string;
    provinceId?: number;
    status?: number;
    listHotelDetailDTO?: HotelDetailDTO[];
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    provinceName?: string;
}

export class HotelDetailDTO {
    id?: number;
    hotelId?: number;
    roomType?: string;
    roomTypeName?: string;
    price?: number;
    isNew?:boolean;
}

export class BusinessFeeDTO {
    id?: number;
    type?: number;
    title?: string;
    fromDate?: string;
    toDate?: string;
    note?: string;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    status?: number;
    amount?: number;
    titleName?: string;
}

export class RoutingPriceDTO {
    id?: number;
    fromProvinceId?: number;
    toProvinceId?: number;
    vehicleType?: string;
    price?: number;
    status?: number;
    createdDatetime?: string;
    createdBy?: string;
    lastUpdatedDatetime?: string;
    lastUpdatedBy?: string;
    fromProvinceName?: string;
    toProvinceName?: string;
    vehicleTypeName?: string;
}