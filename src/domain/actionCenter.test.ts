import{describe,expect,it}from'vitest';
import type{AnalyticsRecord}from'../../shared/analytics';
import{actionMatches,actionReportCsv,buildActionCards,inventoryHealth,severityFor,sortActionCards}from'./actionCenter';
const now=new Date('2026-07-20T12:00:00Z');
const item=(overrides:Partial<AnalyticsRecord>={}):AnalyticsRecord=>({id:1,sku:'A-1',title:'Jacket',brand:'Metro',category:'Coats',gender:'',size:'M',color:'Blue',condition:'Good',purchasePrice:20,listPrice:60,shippingCost:8,ebayFees:6,profit:26,roi:130,quantity:1,bin:'B1',rack:'R1',shelf:'',drawer:'',supplier:'',purchaseDate:'2026-07-01',listingDate:'',soldDate:'',ebayItemId:'',status:'Active',notes:'',createdAt:'2026-07-01T00:00:00Z',updatedAt:'2026-07-01T00:00:00Z',photoCount:2,...overrides});
describe('Action Center',()=>{
 it('calculates severity thresholds',()=>expect([severityFor(0),severityFor(2),severityFor(5),severityFor(10)]).toEqual(['complete','attention','elevated','urgent']));
 it('scores complete and empty inventory deterministically',()=>{expect(inventoryHealth([])).toMatchObject({score:null,label:'No inventory'});expect(inventoryHealth([item()])).toMatchObject({score:100,label:'Excellent',affectedRecords:0})});
 it('weights higher impact issues',()=>expect(inventoryHealth([item({listPrice:0,photoCount:0})]).score).toBeLessThan(inventoryHealth([item({brand:''})]).score!));
 it('sorts open blocking issues first and complete issues last',()=>{const cards=sortActionCards(buildActionCards([item({listPrice:0})]),'priority');expect(cards[0].kind).toBe('price');expect(cards.at(-1)?.count).toBe(0)});
 it('calculates impacts only for financially qualified records',()=>{const card=buildActionCards([item({photoCount:0}),item({id:2,photoCount:0,listPrice:0})]).find(c=>c.kind==='photos')!;expect(card.impact).toMatchObject({qualified:1,total:2,value:60,profit:26})});
 it('maps every issue to a workflow destination',()=>expect(new Set(buildActionCards([item()]).map(c=>c.destination))).toEqual(new Set(['photos','inventory','listings'])));
 it('recognizes stale and readiness issues',()=>{expect(actionMatches('stale',item({purchaseDate:'2026-01-01'}),now)).toBe(true);expect(actionMatches('readiness',item({photoCount:0,brand:'',category:'',listPrice:0}),now)).toBe(true)});
 it('exports rows with escaping and incomplete financial states',()=>{const r=item({photoCount:0,title:'Jacket, "Blue"',listPrice:0});const csv=actionReportCsv(buildActionCards([r],now),[r],now);expect(csv).toContain('"Jacket, ""Blue"""');expect(csv).toContain('Insufficient data')});
});
