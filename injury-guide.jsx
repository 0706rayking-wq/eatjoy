window.InjuryGuide = function InjuryGuide({onBack,BackButton}) {
 const [active,setActive]=React.useState('現場救護');
 const sections={
  '現場救護':{pages:'第 2–3、7 頁',items:[
   ['1. 停止危險作業','先確保現場安全，停止危險作業。'],
   ['2. 救護、安排就醫','確認傷勢，必要時立即撥打 119；協助就醫，不得因回報、行政程序或責任判定延誤。'],
   ['3. 立即內部通報','所有疑似職災，立即通知部門最高主管、總部及後勤。現場人員不得自行承諾賠償或補償。'],
   ['4. 保存證據與紀錄','備份監視器原始檔、照片，整理事故經過及通報紀錄，呈報總部。'],
   ['5. 關懷與追蹤','定期確認就醫、傷勢及復原情形；事故、醫療、保險、補償與結案資料均須留存。']]},
  '通報判斷':{pages:'第 4–5 頁',items:[
   ['內部通報不等於法定通報','疑似職災一律內部回報；後勤另確認是否符合勞動場所職災法定通報條件，不可等待保險核定才處理。'],
   ['死亡災害','發生死亡事故。'],['同一事故 3 人以上','罹災人數達 3 人以上。'],['1 人以上需住院','罹災人數 1 人以上，且經醫院診斷需住院治療；依職安署說明，不包含單純留院觀察。'],['其他指定災害','中央主管機關指定公告的其他災害。'],
   ['知悉後 8 小時內','符合條件時，由雇主依法向所在轄區勞動檢查機構通報。保存通報時間與回執；疑義立即向後勤及轄區機構確認。']],link:['職安署：通報條件與方式','https://www.osha.gov.tw/48110/48461/48463/48511/56440/post']},
  '保險補償':{pages:'第 4、6–7 頁',items:[
   ['後勤先確認','核對事故經過、投保、出勤與薪資；協助準備職業傷病門診單／住院申請書、不能工作證明，向員工收集診斷書、收據及報案單（如有）。'],
   ['職災保險｜勞保局審核','符合不能工作、未取得原有薪資且在治療中等條件者，自不能工作第 4 日起請領傷病給付。前 60 日按平均月投保薪資發給，之後按 70%，合計最長 2 年。不是以實領薪資直接計算，也不是每件事故自動核給。'],
   ['公司團保｜另外申請','有投保時，依公司保單向承保公司提出申請；依條款及審核結果給付，不得保證核賠。'],
   ['公司法定補償｜分開核算','責任及範圍依個案事實與法令認定；必要醫療費用、不能工作期間工資補償，由相關部門依醫療證明及法定標準審核。保險給付抵充依法辦理，不自行相減或口頭承諾。'],
   ['追蹤至結案','追蹤補件、核定結果、補償處理與復原情況，保留完整紀錄。']],link:['勞保局：職保傷病給付說明','https://www.bli.gov.tw/0107053.html']},
  '通勤事故':{pages:'第 8–9 頁',items:[
   ['先協助，不自行認定','依原規範所列職業傷病審查準則第 4、17 條逐項確認；主管不得口頭認定「一定算／一定不算職災」。'],
   ['時間與路線','核對實際上下班、加班、打卡時間及提早／延後原因；確認住居所與工作場所間的合理路徑，不限唯一最短路線。'],
   ['通勤目的與排除事由','釐清是否以往返工作為主要目的，是否涉及非日常必要私人活動，以及無照、闖紅燈、酒駕、逆向或危險駕駛等法定情事；實際適用須依法審查。'],
   ['部門主管','通知總部，保存班表及可取得的證據。'],['行政部門','協助事故陳述及保險文件；疑義向勞保局或主管機關確認。'],['會計部門','依事實、醫療證明及法令審核不能工作期間的工資補償。'],['認定權限','職災保險認定與給付交由勞保局審查，以正式核定為準；公司無保險核定權限。']]},
  '勞檢準備':{pages:'第 10–12 頁',items:[
   ['1. 核對通知','確認檢查機構、承辦人、日期、地點、要求文件，以及是否涉及停工或現場保全。'],
   ['2. 通知內部','通知部門主管及總部；重大案件同步通知法律顧問。'],
   ['3. 建立事故資料夾','依原始紀錄整理時間軸、現場證據、員工與設備資料、原因分析及改善進度。'],
   ['4. 安排陪同','指定熟悉現場的主管，配合查核與訪談，不得阻礙檢查。'],
   ['5. 準備改善佐證','隔離危險區、停用設備、修繕、重新訓練、複查照片與完成日期。'],
   ['資料提供範圍','以檢查通知及個案相關性為準，不是每案全部必備。醫療與個人資訊僅提供與檢查目的相關部分。']]},
  '文件清單':{pages:'第 4、11–13 頁',items:[
   ['事故與通報','通報時間、回執、內部事故報告、調查紀錄、原因分析、改善計畫。'],
   ['現場證據','監視器原始檔與備份、照片、平面圖、設備位置。'],
   ['人事與出勤','勞工名冊、聘僱與職務資料、班表、打卡、工作指派、投保及薪資資料。'],
   ['醫療與申請','救護／送醫紀錄、必要診斷資料、不能工作證明、醫療收據、職業傷病就醫文件、報案單（如有）。'],
   ['設備與職安','機具操作 SOP、維護保養、故障報修、安全裝置、自動檢查、巡檢、危害辨識與風險評估紀錄。'],
   ['訓練與防護','新進／在職訓練、簽到、危害告知、操作資格及個人防護具紀錄，如防切割手套、防滑鞋。'],
   ['申請、補償與結案','勞保及團保申請／補件／核定、補償核算、改善照片、完成日期及後續追蹤。']]}
 };
 const content=sections[active];
 return <div className="p-4 pb-10 text-left injury-guide">
  <style>{`.injury-guide{color:var(--t1,#1e293b);overflow-wrap:anywhere}.injury-guide .ig-tabs{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:6px;margin:16px 0}.injury-guide .ig-tabs button{min-height:44px;border:1px solid var(--gold-border,#cbd5e1);border-radius:6px;font-size:14px;background:var(--s1,#fff);color:var(--t1,#1e293b)}.injury-guide .ig-tabs button[aria-pressed=true]{background:rgb(var(--brand-red,185 18 27));color:#fff!important}.injury-guide article{padding:16px 0;border-bottom:1px solid var(--gold-border,#e2e8f0)}.injury-guide article p{font-size:14px;line-height:1.8;color:var(--t2,#475569);margin-top:6px}.injury-guide a{text-decoration:underline;display:inline-flex;align-items:center;min-height:44px}.injury-guide h2{font-size:18px}.injury-guide h3{font-size:16px}`}</style>
  <BackButton onClick={onBack} title="職災處理規範"/>
  <section className="py-4 border-b"><h2 className="font-bold">先救護，再處理行政程序</h2><p className="text-sm mt-2 leading-relaxed">疑似職災立即通報主管、總部及後勤；不得自行承諾賠償或保證核賠。</p><a href="tel:119">緊急救護 119</a></section>
  <nav className="ig-tabs" aria-label="職災規範分類">{Object.keys(sections).map(name=><button type="button" key={name} aria-pressed={active===name} onClick={()=>setActive(name)}>{name}</button>)}</nav>
  <section aria-label={active}><h2 className="font-bold">{active}</h2><p className="text-xs mt-1" style={{color:'var(--t3,#64748b)'}}>原規範：{content.pages}</p>{content.items.map(([title,body])=><article key={title}><h3 className="font-bold">{title}</h3><p>{body}</p></article>)}{content.link&&<a href={content.link[1]} target="_blank" rel="noopener noreferrer">{content.link[0]}</a>}</section>
  <footer className="mt-5 text-xs leading-relaxed" style={{color:'var(--t3,#64748b)'}}>依人事部《員工職業災害處理標準作業流程》整理；來源檔未標示版本日期。通報及傷病給付另參照官方說明（2026-10-31 查核）。本頁供作業查閱，不是案件通報或核定紀錄；個案由人事／後勤及主管機關依法確認。</footer>
 </div>;
};
