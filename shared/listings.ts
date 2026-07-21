import type { IpcResult } from './inventory.js';

export const LISTING_STATUSES=['Purchased','Cleaned','Photographed','Ready','Listed','Sold','Packed','Shipped','Delivered','Archived'] as const;
export type ListingStatus=typeof LISTING_STATUSES[number];
export type ListingChecklist={photosComplete:boolean;primaryPhotoSelected:boolean;titleComplete:boolean;descriptionComplete:boolean;itemSpecificsComplete:boolean;pricingComplete:boolean;shippingComplete:boolean;readyToList:boolean};
export type ListingRecord={id:number;inventoryId:number;listingTitle:string;description:string;category:string;condition:string;brand:string;department:string;size:string;color:string;material:string;style:string;type:string;model:string;mpn:string;upc:string;countryOfManufacture:string;listPrice:number;minimumOffer:number;shippingService:string;shippingCharge:number;handlingTime:number;returnPolicy:string;ebayItemId:string;listingUrl:string;status:ListingStatus;internalNotes:string;checklist:ListingChecklist;createdAt:string;updatedAt:string};
export type ListingInput=Omit<ListingRecord,'id'|'inventoryId'|'createdAt'|'updatedAt'>&Partial<Pick<ListingRecord,'id'|'inventoryId'|'createdAt'|'updatedAt'>>;
export type ListingQueueItem={inventoryId:number;sku:string;title:string;brand:string;category:string;condition:string;size:string;color:string;purchasePrice:number;listPrice:number;bin:string;rack:string;shelf:string;drawer:string;photoCount:number;primaryPhotoUrl?:string;listing:ListingRecord;readiness:number;missing:string[]};
export type ListingApi={queue:()=>Promise<IpcResult<ListingQueueItem[]>>;save:(inventoryId:number,input:ListingInput)=>Promise<IpcResult<ListingRecord>>};
