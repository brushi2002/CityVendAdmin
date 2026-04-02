// Enums — matching CityVend.Services.Common.EnumWrapper

export enum Status {
  Active = 1,
  InActive = 2,
  Delete = 3,
}

export enum Role {
  Superadmin = 1,
  Vendor = 2,
  User = 3,
}

export enum BusinessGroup {
  Mobile = 1,
  Shop = 2,
  Online = 3,
}

export enum SubscriptionStatus {
  Active = 1,
  Inactive = 2,
  androidActive = 21,
  androidPending = 22,
  androidCanceled = 23,
  androidExpired = 24,
}

// Status description helper
const statusDescriptions: Record<number, string> = {
  [Status.Active]: 'Active',
  [Status.InActive]: 'Inactive',
  [Status.Delete]: 'Deleted',
};

const businessGroupDescriptions: Record<number, string> = {
  [BusinessGroup.Mobile]: 'Mobile',
  [BusinessGroup.Shop]: 'Shop',
  [BusinessGroup.Online]: 'Online',
};

export function getStatusText(status: number): string {
  return statusDescriptions[status] ?? 'Unknown';
}

export function getBusinessGroupName(groupId: number): string {
  return businessGroupDescriptions[groupId] ?? 'Unknown';
}

// Models — matching CityVend.Services.Model

export interface User {
  Id: number;
  Email: string;
  Password: string;
  Phone: string | null;
  FirstName: string | null;
  LastName: string | null;
  DOB: Date | null;
  ProfilePic: string | null;
  PasswordResetCode: string | null;
  EmailVerificationCode: string | null;
  IsEmailVerified: boolean | null;
  RoleId: number;
  Status: number | null;
  CreatedOn: Date | null;
  UpdatedOn: Date | null;
  BusinessId: number | null;
  AccountDeletedOn: Date | null;
  AccountDeleteReason: string | null;
}

export interface UserViewModel {
  Id: number;
  UserName: string;
  Email: string;
  Phone: string;
  Role: number;
  Status: number;
  StatusText: string;
  CreatedOn: Date;
  BusinessId: number;
  BusinessName: string;
  BusinessPhoneNumber: string;
  BusinessCategory: string;
  BusinessType: string;
}

export interface BusinessHour {
  Id: number;
  BusinessId: number | null;
  StartTime: string | null;
  EndTime: string | null;
  DayId: number | null;
  UpdatedOn: Date | null;
}

export interface UserFile {
  Id: number;
  FileName: string | null;
  FilePath: string | null;
  Type: number | null;
  UserId: number | null;
  AddedOn: Date | null;
}

export interface BusinessDetails {
  Name: string;
  PhoneNumber: string;
  Email: string;
  Website: string;
  Category: string;
  BusinessSubCategory: string;
  Type: string;
  CategoryId: number;
  TypeId: number;
  AdditionalInformation: string;
  MessageFromOwner: string;
  Status: number;
  StatusText: string;
  Lat: number;
  Lng: number;
  Address1: string;
  Address2: string;
  City: string;
  State: string;
  Zip: string;
  StartTime: Date | null;
  EndTime: Date | null;
  CurrentAddress1: string | null;
  CurrentAddress2: string | null;
  CurrentCity: string | null;
  CurrentState: string | null;
  CurrentZip: string | null;
  CurrentLat: number;
  CurrentLng: number;
  GroupId: number;
  GroupName: string;
  Hours: BusinessHour[];
  Files: UserFile[];
  AccountDeletedOn: Date | null;
  AccountDeleteReason: string | null;
  IsHotspot: boolean;
  HotspotMessage: string;
  IsFollowing: boolean;
  IsSubscribed: boolean | null;
}

export interface BusinessTypeMaster {
  Id: number;
  TypeName: string;
  GroupId: number;
}

export interface BusinessCategoryMaster {
  Id: number;
  CategoryName: string;
}

// Search / Pagination

export interface BaseFilter {
  PageIndex?: number;
  PageSize?: number;
  OrderBy?: string;
  OrderByDirection?: number;
  IsPaging?: number;
}

export interface UserSearchFiltration extends BaseFilter {
  Role?: number;
  UserName?: string;
  UserEmail?: string;
  Status?: number;
}

export interface SearchResult<T> {
  ResultData: T[];
  RowCount: number;
  TotalPages: number;
  StartRow: number;
  EndRow: number;
}

// JWT

export interface JWTAuthPayload {
  UserId: number;
  Email: string;
  RoleId: number;
  Status: number | null;
  BusinessId: number;
  TokenIssuedOn: string;
  Issuer: string;
}
