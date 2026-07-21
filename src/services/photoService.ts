import type { InventoryPhoto, PhotoImportInput, PhotoMimeType } from '../../shared/photos';
import { unwrap } from './inventoryService';

const supported = new Set(['image/jpeg', 'image/png', 'image/webp']);
const readDataUrl = (file: Blob) => new Promise<string>((resolve, reject) => { const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result)); reader.onerror=()=>reject(new Error('The image could not be read.')); reader.readAsDataURL(file); });
const loadImage = (url: string) => new Promise<HTMLImageElement>((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error('The image is unreadable.'));image.src=url;});
const base64Part=(url:string)=>url.slice(url.indexOf(',')+1);

async function thumbnail(file: File) {
  const url=await readDataUrl(file); const image=await loadImage(url); const size=320;
  const scale=Math.min(size/image.width,size/image.height,1); const width=Math.max(1,Math.round(image.width*scale)); const height=Math.max(1,Math.round(image.height*scale));
  const canvas=document.createElement('canvas');canvas.width=size;canvas.height=size;const context=canvas.getContext('2d');if(!context)throw new Error('Thumbnail generation is unavailable.');
  context.fillStyle='#f1f4f9';context.fillRect(0,0,size,size);context.drawImage(image,(size-width)/2,(size-height)/2,width,height);
  const blob=await new Promise<Blob|null>((resolve)=>canvas.toBlob(resolve,'image/jpeg',.82));if(!blob)throw new Error('Thumbnail generation failed.');
  return { dataBase64:base64Part(url), thumbnailBase64:base64Part(await readDataUrl(blob)) };
}
async function fingerprint(file: File) { const bytes=await file.arrayBuffer(); const digest=await crypto.subtle.digest('SHA-256',bytes); return Array.from(new Uint8Array(digest),byte=>byte.toString(16).padStart(2,'0')).join(''); }
export async function preparePhoto(inventoryId:number,file:File):Promise<PhotoImportInput>{
  if(!supported.has(file.type))throw new Error(`${file.name}: only JPEG, PNG, and WebP files are supported.`);if(!file.size)throw new Error(`${file.name}: the file is empty.`);if(file.size>20*1024*1024)throw new Error(`${file.name}: the 20 MB limit was exceeded.`);
  const encoded=await thumbnail(file);return{inventoryId,originalFileName:file.name,mimeType:file.type as PhotoMimeType,fileSize:file.size,fingerprint:await fingerprint(file),...encoded};
}
export const photoService={
  async list(inventoryId:number):Promise<InventoryPhoto[]>{if(!window.metro){const colors=['#355c7d','#6c5b7b','#c06c84'];return inventoryId===2?[]:colors.map((color,index)=>{const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="700"><rect width="100%" height="100%" fill="#f4f1ea"/><rect x="180" y="80" width="540" height="540" rx="32" fill="${color}"/><text x="450" y="345" text-anchor="middle" fill="white" font-family="Arial" font-size="46">Metro Product ${index+1}</text><text x="450" y="405" text-anchor="middle" fill="white" font-family="Arial" font-size="25">Listing photo preview</text></svg>`;const imageUrl=`data:image/svg+xml,${encodeURIComponent(svg)}`;return{id:inventoryId*10+index,inventoryId,fileName:`demo-${index+1}.jpg`,originalFileName:`metro-product-${index+1}.jpg`,mimeType:'image/jpeg' as const,fileSize:128000,filePath:'',thumbnailPath:'',position:index,isPrimary:index===0,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),imageUrl,thumbnailUrl:imageUrl};});}return unwrap(await window.metro.photos.list(inventoryId));},
  async import(input:PhotoImportInput){if(!window.metro)throw new Error('Photo storage is unavailable.');return unwrap(await window.metro.photos.import(input));},
  async reorder(inventoryId:number,ids:number[]){if(!window.metro)throw new Error('Photo storage is unavailable.');return unwrap(await window.metro.photos.reorder(inventoryId,ids));},
  async setPrimary(inventoryId:number,photoId:number){if(!window.metro)throw new Error('Photo storage is unavailable.');return unwrap(await window.metro.photos.setPrimary(inventoryId,photoId));},
  async delete(inventoryId:number,photoId:number){if(!window.metro)throw new Error('Photo storage is unavailable.');return unwrap(await window.metro.photos.delete(inventoryId,photoId));}
};
