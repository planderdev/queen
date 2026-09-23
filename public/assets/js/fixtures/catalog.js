export const categories = ['전체','아동·청소년','어르신','장애인','위기가정','동물','환경','재난·긴급지원','지역사회'];
export const categoryIcons = ['layout-grid','baby','hand-heart','accessibility','house','paw-print','leaf','heart-pulse','users-round'];
export const photos = {
 meal:'/assets/images/meal.jpg',
 child:'/assets/images/child.jpg',
 dog:'/assets/images/dog.jpg',
 forest:'/assets/images/forest.jpg',
 community:'/assets/images/community.jpg',
 ocean:'/assets/images/ocean.jpg'
};
export const stories = [
 {id:'story-1',fundraiserId:'fund-9',title:'여러분의 마음이, 따뜻한 한 끼가 되었습니다',category:'어르신',image:photos.meal,body:'동네 식탁에 다시 이야기꽃이 피었습니다. 이웃들이 함께 준비한 식사를 나누고 안부를 묻는 시간을 가졌습니다. 이 이야기는 플랫폼의 결과보고를 설명하기 위한 가상 사례입니다.'},
 {id:'story-2',fundraiserId:'fund-2',title:'새로운 책과 함께, 더 넓어진 아이들의 세상',category:'아동·청소년',image:photos.child,body:'책을 매개로 마음을 나누는 작은 도서관. 앞으로도 아이들의 속도에 맞춰 배움의 시간을 이어가겠습니다. 가상 활동 예시입니다.'},
 {id:'story-3',fundraiserId:'fund-4',title:'함께 심은 작은 나무, 우리 동네의 내일',category:'환경',image:photos.forest,body:'이웃과 함께 나무를 심고 돌보는 날. 오래도록 이어질 푸른 변화를 응원합니다. 가상 활동 예시입니다.'}
];
export function seedCatalog(now){
 const date=(days)=>new Date(new Date(now).getTime()+days*86400000).toISOString();
 const specs=[
 ['어르신','어르신의 하루에\n따뜻한 한 끼를 전해주세요','meal',5000000,3240000,12],
 ['아동·청소년','아이들의 배움이\n멈추지 않도록','child',8000000,5720000,23],
 ['동물','다시 가족을 만날 때까지,\n유기견들의 든든한 울타리','dog',4000000,1860000,8],
 ['환경','우리의 작은 실천으로\n숲의 내일을 지켜요','forest',6000000,4620000,18],
 ['위기가정','다시 시작하는 가족에게\n안전한 일상을 선물해요','community',5000000,2180000,6],
 ['장애인','누구나 편안하게\n함께하는 동네 만들기','community',3000000,3090000,30],
 ['재난·긴급지원','갑작스러운 재난 이후,\n일상으로 돌아가는 길','ocean',9000000,2010000,4],
 ['지역사회','서로의 안부를 묻는\n우리 동네 작은 식탁','meal',2500000,790000,16],
 ['어르신','이웃과 나눈 따뜻한 식탁,\n그 이후의 이야기','meal',2000000,2100000,-2,{publication:'ended'}],
 // 관리자 심사 데모용: 지급 완료 후 결과보고 검토 요청 상태 (data.js의 payouts·impactReports와 연결)
 ['아동·청소년','겨울방학에도 멈추지 않는\n아이들의 든든한 한 끼','child',3000000,3000000,-10,{publication:'ended',startDays:-40}],
 // 관리자 심사 데모용: 새로 검토 요청된 모금함 (공개 전, 시작일 미도래)
 ['지역사회','우리 동네 작은 도서관,\n빈 책장을 채워주세요','community',1500000,0,45,{review:'submitted',publication:'scheduled',startDays:5}]
 ];
 return specs.map((s,i)=>{const o=s[6]||{};return {id:`fund-${i+1}`,organizationId:`org-${i%3+1}`,category:s[0],title:s[1],image:photos[s[2]],target:s[3],seedAmount:s[4],region:['서울','경기','제주'][i%3],start:date(o.startDays??-20),end:date(s[5]),review:o.review||'approved',publication:o.publication||'active',story:'한 끼의 식사, 한 권의 책, 곁을 지키는 작은 관심. 평범한 일상을 이어가는 데에는 함께하는 마음이 필요합니다. 우리 동네의 이웃들이 안정적으로 일상을 이어갈 수 있도록 여러분의 마음을 전해주세요.\n\n모인 기부금은 아래 사용 계획에 따라 사용하며, 활동 이후 결과보고를 통해 전달 과정과 집행 내역을 나누겠습니다. 이 사연은 서비스 체험을 위한 가상 예시이며 사진 속 인물은 실제 지원 대상자가 아닙니다.',budget:[{label:'물품 및 활동 지원',amount:s[3]*0.8},{label:'전달 및 운영 지원',amount:s[3]*0.2}],createdAt:date((o.startDays??-20)+i)};});
}
