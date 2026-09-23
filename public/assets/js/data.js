import {seedCatalog,stories,photos,categories,categoryIcons} from './fixtures/catalog.js';
export {stories,photos,categories,categoryIcons};
export const config={schema:1,minDonation:1000,maxDonation:10000000,refundDays:7,maxFileBytes:5*1024*1024,timezone:'Asia/Seoul'};
export function makeSeed(now=new Date().toISOString()){
 const fundraisers=seedCatalog(now);
 return {schema:config.schema,revision:0,clock:now,role:'guest',userId:'user-1',adminRole:'super',uiState:'normal',
 users:[{id:'user-1',name:'마음이',email:'demo@example.test',interests:['환경'],public:true},{id:'user-2',name:'나눔이',email:'neighbor@example.test',interests:['어르신'],public:true}],
 organizations:[{id:'org-1',name:'온기나눔',category:'어르신',status:'approved',description:'이웃의 일상에 따뜻함을 전하는 가상 단체입니다.'},{id:'org-2',name:'내일을잇다',category:'아동·청소년',status:'approved',description:'아이들의 배움과 내일을 응원하는 가상 단체입니다.'},{id:'org-3',name:'함께하는지구',category:'환경',status:'approved',description:'모든 생명이 함께하는 일상을 꿈꾸는 가상 단체입니다.'},{id:'org-demo',name:'우리동네나눔',category:'지역사회',status:'draft',description:'직접 신청하고 심사를 체험하는 데모 단체입니다.'}],
 fundraisers:fundraisers.map(({seedAmount,...f})=>f),donations:fundraisers.map(f=>({id:`seed-${f.id}`,key:`seed-${f.id}`,fundraiserId:f.id,userId:'seed-user',amount:f.seedAmount,status:'success',kind:'donation',anonymous:true,message:'함께 응원합니다.',createdAt:now})),
 recurringPlans:[],recurringPayments:[],corporatePartners:[{id:'company-1',name:'초록내일 컴퍼니',description:'함께 성장하는 가치를 응원하는 가상 기업입니다.'}],
 campaigns:[{id:'campaign-1',partnerId:'company-1',title:'함께하면 두 배가 되는 마음',description:'여러분의 나눔에 초록내일 컴퍼니가 같은 마음을 보탭니다.',type:'matching',fundraiserId:'fund-1',limit:1000000,rate:1,review:'approved',start:fundraisers[0].start,end:fundraisers[0].end,image:photos.community},{id:'campaign-2',partnerId:'company-1',title:'지구를 위한 작은 약속',description:'오늘 한 번, 일회용품 줄이기를 함께 약속해요. 응원은 금전 기부로 환산되지 않습니다.',type:'cheer',fundraiserId:'fund-4',limit:0,review:'approved',start:fundraisers[0].start,end:fundraisers[0].end,image:photos.forest}],
 participations:[],matchingContributions:[],payouts:[],impactReports:[],comments:[{id:'comment-1',fundraiserId:'fund-1',userId:'user-2',text:'따뜻한 식탁이 오래 이어지길 응원합니다.',hidden:false,createdAt:now}],bookmarks:[],notifications:[],inquiries:[],moderationReports:[],auditLogs:[],refundRequests:[],drafts:{},content:[{id:'notice-1',type:'notice',title:'퀸만덕의 첫 번째 나눔에 함께해주세요',body:'기부부터 결과보고까지, 퀸만덕 데모에서 체험해보세요.',published:true}],settings:{categories:categories.slice(1),regions:['서울','경기','제주']}};
}
