import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { db, getPublicPath } from '../firebase.js'
import Icon from './shared/Icon.jsx'

const ScheduleSystem = ({ onBack, currentBranch, isManager, getPublicPath, triggerNotify }) => {
const defaultShiftRules = [
  { code: 'A-5', name: '早班A5', type: 'morning' },
  { code: 'A-6', name: '早班A6', type: 'morning' },
  { code: 'P1', name: '晚班P1', type: 'evening' },
  { code: 'P4', name: '晚班P4', type: 'evening' },
  { code: 'P5', name: '晚班P5', type: 'evening' },
  { code: 'P6', name: '晚班P6', type: 'evening' },
  { code: 'F', name: '全天班', type: 'full' },
  { code: '特', name: '特休', type: 'off' },
  { code: 'X', name: '排休', type: 'off' },
  { code: '/', name: '劃休', type: 'off' }
];

const [scheduleData, setScheduleData] = useState({
  shiftRules: defaultShiftRules,
  roleColors: {},
  months: {} // 存放各月份獨立資料
});
const [currentDate, setCurrentDate] = useState(new Date()); 
const [newShiftCode, setNewShiftCode] = useState('');
const [newShiftType, setNewShiftType] = useState('morning');
const [showSettings, setShowSettings] = useState(false);
const [selectedCell, setSelectedCell] = useState(null);

// 標記修改模式狀態
const [isHighlightMode, setIsHighlightMode] = useState(false);

// 節日編輯專用狀態
const [holidayInputText, setHolidayInputText] = useState('');
const [holidayInputIsRed, setHolidayInputIsRed] = useState(true);

const [draggedStaffId, setDraggedStaffId] = useState(null);
const [overStaffId, setOverStaffId] = useState(null);
const [isDownloading, setIsDownloading] = useState(false);
const [previewImage, setPreviewImage] = useState(null);
const tableRef = useRef(null);

// 同步該分店的班表資料
useEffect(() => {
  const docRef = db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`));
  const unsubscribe = docRef.onSnapshot(doc => {
    if (doc.exists) {
      setScheduleData(doc.data());
    } else {
      const defaultData = { shiftRules: defaultShiftRules, roleColors: {}, months: {} };
      if(isManager) docRef.set(defaultData);
      setScheduleData(defaultData);
    }
  });
  return () => unsubscribe();
}, [currentBranch, isManager]);

const { shiftRules = defaultShiftRules, roleColors = {} } = scheduleData;

const monthKey = useMemo(() => `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`, [currentDate]);
const activeMonthData = scheduleData.months?.[monthKey] || null;

const staffList = useMemo(() => {
  if (activeMonthData && activeMonthData.staffList) return activeMonthData.staffList;
  if (scheduleData.months) {
    const pastMonths = Object.keys(scheduleData.months)
      .filter(k => k < monthKey)
      .sort((a, b) => b.localeCompare(a));
    if (pastMonths.length > 0) {
      const latestPastMonth = pastMonths[0];
      return (scheduleData.months[latestPastMonth].staffList || []).map(s => ({...s, shifts: {}}));
    }
  }
  return scheduleData.staffList || []; 
}, [activeMonthData, scheduleData.months, scheduleData.staffList, monthKey]);

const holidays = useMemo(() => {
  if (activeMonthData && activeMonthData.holidays) return activeMonthData.holidays;
  if (!scheduleData.months) return scheduleData.holidays || {};
  return {};
}, [activeMonthData, scheduleData.months, scheduleData.holidays]);

// 解析舊版字串與新版物件的節日資料
const getHolidayData = useCallback((dateString) => {
  const h = holidays[dateString];
  if (!h) return null;
  if (typeof h === 'string') return { text: h, isRed: true };
  return h;
}, [holidays]);

const updateData = (updates) => {
  if (!isManager) return;
  db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`)).set(updates, { merge: true });
};

// 請替換原本的 updateMonthData
const updateMonthData = async (updateCallback) => {
  if (!isManager) return;
  const docRef = db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`));

  try {
    await db.runTransaction(async (transaction) => {
      const docSnap = await transaction.get(docRef);

      // 情境 1：如果該分店「完全沒有」班表文件 (全新分店)
      if (!docSnap.exists) {
        const currentMonthData = { staffList: [], holidays: {} };
        const updatedMonthData = updateCallback(currentMonthData);
        const finalMonthData = { ...currentMonthData, ...updatedMonthData };
  
        transaction.set(docRef, {
          shiftRules: defaultShiftRules,
          roleColors: {},
          months: { [monthKey]: finalMonthData }
        });
        return; // 直接寫入並結束，不報錯
      }

      const data = docSnap.data();
      const currentMonthData = (data.months && data.months[monthKey]) 
        ? data.months[monthKey] 
        : { staffList: [], holidays: {} };

      const updatedMonthData = updateCallback(currentMonthData);
      const finalMonthData = { ...currentMonthData, ...updatedMonthData };

      // 情境 2：文件存在，但這家分店是「舊版資料」，還沒建立 months 結構
      if (data.months === undefined) {
        // 使用 set + merge 安全建立母資料夾
        transaction.set(docRef, {
          months: { [monthKey]: finalMonthData }
        }, { merge: true });
      } 
      // 情境 3：正常情況，已有 months 結構
      else {
        // 使用 update 覆寫單月，這樣「清空節日 (delete)」的操作才會在資料庫確實生效
        transaction.update(docRef, {
          [`months.${monthKey}`]: finalMonthData
        });
      }
    });
  } catch (e) {
    console.error("更新班表失敗: ", e);
    triggerNotify("排班儲存異常，請稍後再試", "error");
  }
};

const setShiftRules = (newRules) => updateData({ shiftRules: newRules });
const addShiftRule = () => {
  if (!newShiftCode.trim()) return;
  const code = newShiftCode.trim().toUpperCase();
  if (shiftRules.some(r => r.code === code)) return triggerNotify('班別代碼已存在！', 'error');
  setShiftRules([...shiftRules, { code, name: code, type: newShiftType }]);
  setNewShiftCode('');
};
const removeShiftRule = (codeToRemove) => setShiftRules(shiftRules.filter(r => r.code !== codeToRemove));

const daysInMonth = useMemo(() => {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(year, month, i + 1);
    return {
      dateNum: i + 1,
      dayOfWeek: ['日', '一', '二', '三', '四', '五', '六'][date.getDay()],
      isWeekend: date.getDay() === 0 || date.getDay() === 6,
      dateString: `${year}-${String(month + 1).padStart(2, '0')}-${String(i + 1).padStart(2, '0')}`
    };
  });
}, [currentDate]);

const changeMonth = (offset) => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + offset, 1));

const updateShift = (staffId, dateString, value) => {
  if (!isManager) return;
  const safeValue = value || '';
  
  // 使用 callback 拿取最新的 latestMonthData
  updateMonthData((latestMonthData) => {
    const currentStaffList = latestMonthData.staffList || [];
    const newStaffList = currentStaffList.map(staff => 
      staff.id === staffId 
        ? { ...staff, shifts: { ...(staff.shifts || {}), [dateString]: safeValue } } 
        : staff
    );
    return { staffList: newStaffList };
  });
};

// 切換格子黃色背景標記功能
const toggleCellColor = (staffId, dateString) => {
  if (!isManager) return;
  const cellKey = `${staffId}_${dateString}`;
  
  updateMonthData((latestMonthData) => {
    const currentColors = latestMonthData.cellColors || {};
    const newColors = { ...currentColors };

    if (newColors[cellKey] === 'bg-yellow-300') {
      delete newColors[cellKey];
    } else {
      newColors[cellKey] = 'bg-yellow-300';
    }
    return { cellColors: newColors };
  });
};
const addStaff = () => {
  if (!isManager) return;
  const newId = Date.now().toString(); 
  
  updateMonthData((latestMonthData) => {
    const currentStaffList = latestMonthData.staffList || [];
    return { staffList: [...currentStaffList, { id: newId, title: '新職位', name: '新員工', shifts: {} }] };
  });
};

const updateStaffInfo = (id, field, value) => {
  if (!isManager) return;
  
  updateMonthData((latestMonthData) => {
    const currentStaffList = latestMonthData.staffList || [];
    const newStaffList = currentStaffList.map(staff => 
      staff.id === id ? { ...staff, [field]: value } : staff
    );
    return { staffList: newStaffList };
  });
};

const removeStaff = (id) => {
  if (!isManager) return;
  if(window.confirm('確定刪除此人員本月班表？')) {
    updateMonthData((latestMonthData) => {
      const currentStaffList = latestMonthData.staffList || [];
      return { staffList: currentStaffList.filter(staff => staff.id !== id) };
    });
  }
};

const importPreviousData = () => {
  if (!isManager) return;
  
  // 找出所有過去的月份並由近到遠排序
  const pastMonths = scheduleData.months 
    ? Object.keys(scheduleData.months).filter(k => k < monthKey).sort((a, b) => b.localeCompare(a)) 
    : [];

  if (pastMonths.length === 0) {
    triggerNotify("找不到過去的月份資料可供載入", "error");
    return;
  }

  const lastMonthKey = pastMonths[0];
  const lastStaffList = scheduleData.months[lastMonthKey].staffList || [];

  if (lastStaffList.length === 0) {
    triggerNotify(`上個月 (${lastMonthKey}) 沒有人員資料`, "error");
    return;
  }

  if (window.confirm(`確定要載入 ${lastMonthKey} 的人員名單與職位嗎？\n(注意：這會清空當月已排的班表，並套用上月名單)`)) {
    // 複製人員，但清空 shifts (班別) 以便重新排班
    const importedStaff = lastStaffList.map(staff => ({
      ...staff,
      shifts: {} 
    }));

    updateMonthData((latestMonthData) => {
      return { staffList: importedStaff };
    });
    triggerNotify(`已成功載入 ${lastMonthKey} 人員名單！`, "success");
  }
};

const openHolidayEdit = (dateString) => {
  if (!isManager) return;
  const h = getHolidayData(dateString);
  setHolidayInputText(h ? h.text : '');
  setHolidayInputIsRed(h ? h.isRed : true);
  setSelectedCell({ type: 'holiday', date: dateString });
};

const saveHoliday = (dateString) => {
  if (!isManager) return;
  
  updateMonthData((latestMonthData) => {
    const currentHolidays = latestMonthData.holidays || {};
    const newHolidays = { ...currentHolidays };

    // 如果輸入為空，代表要刪除該節日
    if (holidayInputText.trim() === '') {
      delete newHolidays[dateString];
    } else {
      newHolidays[dateString] = { 
        text: holidayInputText.trim(), 
        isRed: holidayInputIsRed 
      };
    }

    return { holidays: newHolidays };
  });
  
  setSelectedCell(null);
};

// 修改：刪除特殊節日
const deleteHoliday = (dateString) => {
  if (!isManager) return;
  
  updateMonthData((latestMonthData) => {
    const currentHolidays = latestMonthData.holidays || {};
    const newHolidays = { ...currentHolidays };
    delete newHolidays[dateString];

    return { holidays: newHolidays };
  });
  
  setSelectedCell(null);
};
const handleDragStart = (id) => { if (!isManager) return; setDraggedStaffId(id); };
const handleDragOver = (e, id) => { e.preventDefault(); if (!isManager) return; if (id !== draggedStaffId) setOverStaffId(id); };
const handleDragEnd = () => {
  if (!isManager) return;
  if (draggedStaffId !== null && overStaffId !== null && draggedStaffId !== overStaffId) {

    updateMonthData((latestMonthData) => {
      const currentStaffList = latestMonthData.staffList || [];
      const newList = [...currentStaffList];
      const fromIndex = newList.findIndex(s => s.id === draggedStaffId);
      const toIndex = newList.findIndex(s => s.id === overStaffId);

      if (fromIndex !== -1 && toIndex !== -1) {
        const [moved] = newList.splice(fromIndex, 1);
        newList.splice(toIndex, 0, moved);
        return { staffList: newList };
      }
      return {}; // 沒變動就回傳空物件
    });
  }
  setDraggedStaffId(null);
  setOverStaffId(null);
};

const calculateOffDays = (shifts = {}) => {
  let count = 0;
  daysInMonth.forEach(day => {
    const code = shifts[day.dateString];
    if (!code) return;
    const rule = shiftRules.find(r => r.code === code);
    if (rule && rule.type === 'off') {
      count++;
    } else if (code === 'X' || code === '/' || code === '特') {
      count++;
    }
  });
  return count;
};

const calculateDailyStats = (dateString) => {
  let morning = 0; let evening = 0; let total = 0;
  staffList.forEach(staff => {
    const shifts = staff.shifts || {};
    const shiftCode = shifts[dateString] || '';
    if (shiftCode === '') { morning++; evening++; total++; return; }
    const rule = shiftRules.find(r => r.code === shiftCode);
    if (rule) {
      if (rule.type === 'morning' || rule.type === 'full') morning++;
      if (rule.type === 'evening' || rule.type === 'full') evening++;
      if (rule.type !== 'off') total++;
    } else if (shiftCode !== 'X' && shiftCode !== '/' && shiftCode !== '特') {
      total++;
    }
  });
  return { morning, evening, total };
};

const getTitleColorStyle = useCallback((title) => {
  if (!title) return { backgroundColor: '#f8fafc', color: '#64748b' };
  if (roleColors[title]) {
    const bg = roleColors[title];
    const hex = bg.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16) || 255;
    const g = parseInt(hex.substr(2, 2), 16) || 255;
    const b = parseInt(hex.substr(4, 2), 16) || 255;
    const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
    const text = (yiq >= 128) ? '#1e293b' : '#ffffff';
    return { backgroundColor: bg, color: text };
  }
  const colors = [
    {bg: '#dcfce7', text: '#065f46'}, {bg: '#dbeafe', text: '#3730a3'}, 
    {bg: '#ffedd5', text: '#c2410c'}, {bg: '#fce7f3', text: '#be123c'}, 
    {bg: '#e0e7ff', text: '#3f0071'}, {bg: '#f3e8ff', text: '#4338ca'}, 
    {bg: '#cffafe', text: '#1e40af'}, 
  ];
  let hash = 0;
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash);
  const colorIdx = Math.abs(hash) % colors.length;
  return { backgroundColor: colors[colorIdx].bg, color: colors[colorIdx].text };
}, [roleColors]);

const getCellBg = useCallback((dateString, isWeekend) => {
  const h = getHolidayData(dateString);
  if (h && h.isRed) return 'bg-red-100';
  if (h && !h.isRed) return 'bg-slate-100';
  if (isWeekend) return 'bg-rose-50';
  return 'bg-white';
}, [getHolidayData]);

const getHeaderBg = useCallback((dateString, isWeekend) => {
  const h = getHolidayData(dateString);
  if (h && h.isRed) return 'bg-red-200 text-brand-red font-black';
  if (h && !h.isRed) return 'bg-slate-200 text-slate-700 font-black';
  if (isWeekend) return 'bg-rose-100 text-brand-red font-black';
  return 'bg-slate-100 text-slate-800 font-bold';
}, [getHolidayData]);

// 存為圖片功能 (進階修正：確保不裁切與防破圖)
const handleDownloadImage = async () => {
  if (!tableRef.current) return;
  
  setIsDownloading(true);
  triggerNotify("正在展開表格並準備拍攝，請稍候...", "info");
  
  // 給 React 一點時間將輸入框 (input) 轉換為純文字 (div)，避免字體偏移
  setTimeout(async () => {
    const target = tableRef.current;
    const parent = target.parentElement;
    
    // 暫存原本的佈局樣式
    const originalOverflow = parent.style.overflow;
    const originalWidth = parent.style.width;
    const originalPosition = parent.style.position;
    
    // 強制完全展開容器，避免 html2canvas 裁切可視範圍以外的內容
    parent.style.overflow = 'visible';
    parent.style.width = 'max-content';
    parent.style.position = 'static';
    
    try {
      const canvas = await window.html2canvas(target, {
        scale: 2, 
        useCORS: true,
        backgroundColor: '#ffffff',
        width: target.scrollWidth,
        height: target.scrollHeight,
        windowWidth: target.scrollWidth,
        windowHeight: target.scrollHeight
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.9);
      
      // 開啟預覽對話框，提供手機端安全長按儲存
      setPreviewImage(imgData);
      triggerNotify("班表截圖成功！", "success");
    } catch (error) {
      console.error("產生圖片失敗", error);
      triggerNotify("下載圖片失敗，請稍後再試", "error");
    } finally {
      // 恢復所有原始樣式與編輯模式
      parent.style.overflow = originalOverflow;
      parent.style.width = originalWidth;
      parent.style.position = originalPosition;
      setIsDownloading(false);
    }
  }, 500);
};

const handlePrint = () => {
  const monthStr = `${currentDate.getMonth() + 1}月`;
  const yearMonthTitle = `${currentDate.getFullYear()}年 ${monthStr} 班表`;
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>${currentBranch} - ${yearMonthTitle}</title>
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+TC:wght@400;700;900&display=swap');
        @page { size: landscape; margin: 5mm; }
        body { font-family: 'Noto Sans TC', sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0; color: #1e293b; }
        h1 { text-align: center; font-size: 20px; font-weight: 900; margin-bottom: 12px; color: #b9121b; letter-spacing: 2px; }
        table { width: 100%; border-collapse: collapse; text-align: center; table-layout: fixed; }
        th, td { border: 1px solid #475569; padding: 2px 0; overflow: hidden; white-space: nowrap; font-size: 10px; font-weight: 700; }
        .bg-header { background-color: #a7f3d0 !important; font-size: 12px; }
        .bg-header-dark { background-color: #34d399 !important; color: white; font-size: 11px; }
        .bg-weekend { background-color: #ffe4e6 !important; color: #e11d48 !important; }
        .bg-holiday { background-color: #fecaca !important; color: #b91c1c !important; } 
        .text-holiday { color: #b91c1c !important; font-size: 12px; writing-mode: vertical-lr; letter-spacing: 1px; font-weight: 900; margin: 0 auto; padding-top: 2px;}
        .bg-gray { background-color: #f8fafc !important; }
        .bg-dark { background-color: #1e293b !important; color: white !important; font-size: 11px; }
        .bg-orange { background-color: #ffedd5 !important; color: #9a3412 !important; font-size: 11px; }
        .bg-indigo { background-color: #e0e7ff !important; color: #3730a3 !important; font-size: 11px; }
        .print-footer { text-align: right; font-size: 9px; color: #94a3b8; margin-top: 10px; }
      </style>
    </head>
    <body>
      <h1>${currentBranch} - ${yearMonthTitle}</h1>
      <table>
        <colgroup>
          <col style="width: 60px;" />
          <col style="width: 65px;" />
          <col style="width: 28px;" />
          ${daysInMonth.map(() => `<col />`).join('')}
        </colgroup>
        <thead>
          <tr>
            <th colspan="3" class="bg-header">${monthStr}</th>
            ${daysInMonth.map(d => {
              const h = getHolidayData(d.dateString);
              return `<th class="${(h && h.isRed) ? 'bg-holiday' : ((h && !h.isRed) ? 'bg-gray' : (d.isWeekend ? 'bg-weekend' : 'bg-gray'))}">${d.dateNum}</th>`;
            }).join('')}
          </tr>
          <tr>
            <th class="bg-header-dark">職稱</th>
            <th class="bg-header-dark">姓名</th>
            <th class="bg-header-dark">休假</th>
            ${daysInMonth.map(d => {
              const h = getHolidayData(d.dateString);
              return `<th class="${(h && h.isRed) ? 'bg-holiday' : ((h && !h.isRed) ? 'bg-gray' : (d.isWeekend ? 'bg-weekend' : 'bg-gray'))}">${d.dayOfWeek}</th>`;
            }).join('')}
          </tr>
          <tr>
            <th colspan="3" style="text-align:right; font-size: 9px; color: #94a3b8; font-weight: normal; padding-right: 4px;">特殊節日 ➔</th>
            ${daysInMonth.map(d => {
              const h = getHolidayData(d.dateString);
              return `<th class="${(h && h.isRed) ? 'bg-holiday' : ((h && !h.isRed) ? 'bg-gray' : (d.isWeekend ? 'bg-weekend' : ''))}" style="height: 60px; vertical-align: top;">
                ${h ? `<div class="text-holiday" style="${!h.isRed ? 'color:#475569 !important;' : ''}">${h.text}</div>` : ''}
              </th>`;
            }).join('')}
          </tr>
        </thead>
        <tbody>
          ${staffList.map((staff, idx) => {
            const roleStyle = getTitleColorStyle(staff.title);
            return `
            <tr>
              <td style="font-weight:bold; font-size: 11px; background-color: ${roleStyle.backgroundColor} !important; color: ${roleStyle.color} !important;">${staff.title}</td>
              <td class="${idx % 2 === 0 ? 'bg-gray' : ''}" style="font-size: 13px; letter-spacing: 1px;">${staff.name}</td>
              <td class="bg-gray" style="color:#475569; font-size: 11px;">${calculateOffDays(staff.shifts)}</td>
              ${daysInMonth.map(d => {
                const shift = (staff.shifts || {})[d.dateString] || '';
                const h = getHolidayData(d.dateString);
                const cellKey = `${staff.id}_${d.dateString}`;
                const isHighlighted = (activeMonthData?.cellColors || {})[cellKey] === 'bg-yellow-300';
                
                let tdClass = (h && h.isRed) ? 'bg-holiday' : ((h && !h.isRed) ? 'bg-gray' : (d.isWeekend ? 'bg-weekend' : ''));
                let tdStyle = "text-transform: uppercase; font-size: 10px;";
                
                if (isHighlighted) {
                  tdClass = '';
                  tdStyle += " background-color: #fde047 !important;";
                }
                
                return `<td class="${tdClass}" style="${tdStyle}">${shift}</td>`;
              }).join('')}
            </tr>
            `;
          }).join('')}
        </tbody>
        <tfoot>
          <tr>
            <td colspan="3" class="bg-orange" style="text-align: right; padding-right: 4px;">早班總人數</td>
            ${daysInMonth.map(d => `<td class="bg-orange">${calculateDailyStats(d.dateString).morning || ''}</td>`).join('')}
          </tr>
          <tr>
            <td colspan="3" class="bg-indigo" style="text-align: right; padding-right: 4px;">晚班總人數</td>
            ${daysInMonth.map(d => `<td class="bg-indigo">${calculateDailyStats(d.dateString).evening || ''}</td>`).join('')}
          </tr>
          <tr>
            <td colspan="3" class="bg-dark" style="text-align: right; padding-right: 4px;">當日總人數</td>
            ${daysInMonth.map(d => `<td class="bg-dark">${calculateDailyStats(d.dateString).total || ''}</td>`).join('')}
          </tr>
        </tfoot>
      </table>
      <div class="print-footer">EATJOY 廚務管理系統 - 列印時間：${new Date().toLocaleString()}</div>
    </body>
    </html>
  `;
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => { 
    printWindow.print(); 
    printWindow.close(); 
  }, 500);
};

return (
  <div className="page-enter pb-24" onClick={() => setSelectedCell(null)}>
    <div className="p-3 sm:p-4 border-b bg-white/80 backdrop-blur sticky top-[60px] z-40 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
      <div className="flex items-center gap-3 w-full md:w-auto">
        <button onClick={onBack} className="p-2 sm:p-2.5 glass-panel rounded-xl sm:rounded-2xl border border-slate-300 active:scale-90 transition-all bg-white shadow-sm shrink-0"><Icon name="arrow-left" size={20}/></button>
        <h2 className="text-lg sm:text-xl font-black text-slate-800 tracking-tighter truncate">{currentBranch} <span className="text-brand-red">排班系統</span></h2>
      </div>
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
        <button onClick={handleDownloadImage} disabled={isDownloading} className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-blue-500 text-white rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap disabled:opacity-50">
          <Icon name="image" size={14} /> {isDownloading ? "處理中" : "存為圖片"}
        </button>
        <button onClick={handlePrint} className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-emerald-600 text-white rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap">
          <Icon name="printer" size={14} /> 列印
        </button>
        {isManager && (
          <>
            <button onClick={importPreviousData} className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-indigo-600 text-white rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap">
              <Icon name="copy" size={14} /> 載入上月
            </button>
            <button onClick={() => setIsHighlightMode(!isHighlightMode)} className={`flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap ${isHighlightMode ? 'bg-yellow-400 text-yellow-900 border border-yellow-500 shadow-inner' : 'bg-slate-100 text-slate-700 border border-slate-300'}`}>
              <Icon name="edit-3" size={14} /> {isHighlightMode ? '結束標記' : '標記修改'}
            </button>
            <button onClick={addStaff} className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-slate-800 text-white rounded-xl active:scale-95 transition-all shadow-sm text-xs sm:text-sm font-bold whitespace-nowrap"><Icon name="plus" size={14} /> 新增</button>
            <button onClick={() => setShowSettings(!showSettings)} className="flex-1 md:flex-none justify-center flex items-center gap-1.5 px-3 py-2 sm:py-2.5 bg-slate-100 text-slate-700 rounded-xl border border-slate-300 active:scale-95 transition-all text-xs sm:text-sm font-bold whitespace-nowrap"><Icon name="settings" size={14} /> 設定</button>
          </>
        )}
      </div>
    </div>

    <div className="p-4">
      {isManager && showSettings && (
        <div className="mb-4 p-5 bg-blue-50 border border-blue-200 rounded-3xl shadow-sm text-left animate-in slide-in-from-top-2">
          <h3 className="font-black text-blue-800 mb-3 flex items-center gap-2 text-sm"><Icon name="settings" size={16} /> 班別代碼與統計歸類設定</h3>
          <div className="flex flex-wrap gap-2 mb-4">
            {shiftRules.map((rule, idx) => (
              <div key={idx} className="flex items-center bg-white py-1.5 px-3 rounded-xl shadow-sm border border-blue-200 text-xs font-bold group">
                <span className="w-8 text-center text-blue-700">{rule.code}</span>
                <span className="mx-2 text-slate-300">|</span>
                <select value={rule.type} onChange={(e) => { const newRules = [...shiftRules]; newRules[idx].type = e.target.value; setShiftRules(newRules); }} className="outline-none bg-transparent text-slate-600 cursor-pointer appearance-none">
                  <option value="morning">早班</option><option value="evening">晚班</option><option value="full">全天(早+晚)</option><option value="off">休假(不計入)</option>
                </select>
                <button onClick={() => removeShiftRule(rule.code)} className="ml-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Icon name="trash-2" size={14} /></button>
              </div>
            ))}
          </div>
          <div className="pt-3 border-t border-blue-200 flex flex-wrap items-center gap-2">
            <input type="text" value={newShiftCode} onChange={(e) => setNewShiftCode(e.target.value)} placeholder="代碼 (例: A-7)" className="px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none w-28 uppercase font-bold" maxLength={4} />
            <select value={newShiftType} onChange={(e) => setNewShiftType(e.target.value)} className="px-3 py-2 text-xs rounded-xl border border-slate-300 outline-none font-bold">
              <option value="morning">歸類：早班</option><option value="evening">歸類：晚班</option><option value="full">歸類：全天</option><option value="off">歸類：休假</option>
            </select>
            <button onClick={addShiftRule} disabled={!newShiftCode.trim()} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl active:scale-95 disabled:opacity-50 transition-colors shadow-sm flex items-center gap-1"><Icon name="plus" size={14} /> 新增班別</button>
          </div>

          <div className="mt-6 pt-4 border-t border-blue-200">
            <h3 className="font-black text-blue-800 mb-3 flex items-center gap-2 text-sm"><Icon name="palette" size={16} /> 職位顏色自訂</h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(staffList.map(s => s.title).filter(Boolean))).map(role => (
                <div key={role} className="flex items-center bg-white py-1 pl-3 pr-2 rounded-xl shadow-sm border border-blue-200 text-xs font-bold gap-2">
                  <span className="text-slate-700 max-w-[80px] truncate" title={role}>{role}</span>
                  <input 
                    type="color" 
                    value={roleColors[role] || '#ffffff'} 
                    onChange={(e) => updateData({ roleColors: { ...(roleColors || {}), [role]: e.target.value } })}
                    className="w-6 h-6 p-0 border-0 rounded cursor-pointer bg-transparent"
                  />
                  {roleColors[role] && (
                    <button onClick={() => {
                      const newColors = {...roleColors};
                      delete newColors[role];
                      // 避免 merge:true 無法刪除屬性，改用 update 覆寫
                      db.doc(getPublicPath(`schedules_data/branch_${currentBranch}`)).update({
                        roleColors: newColors
                      }).catch(() => {
                        updateData({ roleColors: newColors });
                      });
                    }} className="text-slate-300 hover:text-red-500"><Icon name="x" size={14} /></button>
                  )}
                </div>
              ))}
              {Array.from(new Set(staffList.map(s => s.title).filter(Boolean))).length === 0 && <span className="text-xs text-slate-500">尚無職位，請先於下方班表新增人員。</span>}
            </div>
            <p className="text-[10px] text-blue-500 mt-2">提示：點擊色塊可自訂該職位的背景顏色，未設定則使用系統自動配色。列印時也會自動套用！</p>
          </div>
        </div>
      )}

      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-400 overflow-hidden mb-8">
        <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-400">
          <button onClick={() => changeMonth(-1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-90 transition-all text-slate-600 border border-slate-300"><Icon name="chevron-left" size={18} /></button>
          <div className="font-black text-slate-800 flex items-center gap-2 text-xl"><Icon name="calendar" size={20} className="text-brand-red" /> {currentDate.getFullYear()} 年 {currentDate.getMonth() + 1} 月</div>
          <button onClick={() => changeMonth(1)} className="p-2 bg-white rounded-xl shadow-sm active:scale-90 transition-all text-slate-600 border border-slate-300"><Icon name="chevron-right" size={18} /></button>
        </div>

        <div className="overflow-x-auto overflow-y-visible custom-scrollbar bg-white relative pb-2 w-full">
          <div ref={tableRef} className="w-max min-w-full bg-white relative">
            <table className="w-full border-collapse min-w-max text-xs select-none">
              <thead>
                <tr>
                  <th colSpan={3} className="bg-emerald-100 border border-slate-500 p-2 text-lg font-black tracking-widest sticky left-0 top-0 z-[60] shadow-sm" style={{ height: '40px' }}>{currentDate.getMonth() + 1}月</th>
                  {daysInMonth.map(day => (
                    <th key={`date-${day.dateNum}`} className={`border border-slate-500 p-1 text-center font-black text-base w-9 sticky top-0 z-[50] shadow-sm ${getHeaderBg(day.dateString, day.isWeekend)}`} style={{ height: '40px' }}>{day.dateNum}</th>
                  ))}
                </tr>
                <tr>
                  <th className="bg-emerald-500 border border-slate-500 p-1 w-[76px] sticky left-0 z-[60] text-white font-black shadow-sm" style={{ top: '40px', height: '40px' }}>職稱</th>
                  <th className="bg-emerald-500 border border-slate-500 p-1 w-[80px] sticky left-[76px] z-[60] text-white font-black shadow-sm" style={{ top: '40px', height: '40px' }}>姓名</th>
                  <th className="bg-emerald-500 border border-slate-500 p-1 w-[40px] text-xs leading-tight sticky left-[156px] z-[60] text-white font-black shadow-sm" style={{ top: '40px', height: '40px' }}>休假<br/>天數</th>
                  {daysInMonth.map(day => (
                    <th key={`day-${day.dateNum}`} className={`border border-slate-500 p-1 text-center sticky z-[50] shadow-sm font-bold text-sm ${getHeaderBg(day.dateString, day.isWeekend)}`} style={{ top: '40px', height: '40px' }}>{day.dayOfWeek}</th>
                  ))}
                </tr>
                <tr>
                  <th colSpan={3} className="bg-white border border-slate-500 p-1 text-right text-xs text-slate-400 font-bold sticky left-0 z-[60] shadow-sm" style={{ top: '80px', height: '60px' }}>{isManager && !isDownloading ? '特殊節日 (點擊設定) ➔' : '特殊節日 ➔'}</th>
                  {daysInMonth.map(day => {
                    const h = getHolidayData(day.dateString);
                    return (
                      <th key={`holiday-${day.dateNum}`} onClick={(e) => { e.stopPropagation(); openHolidayEdit(day.dateString); }} className={`border border-slate-500 p-0 text-center align-top relative sticky z-[50] shadow-sm ${isManager && !isDownloading ? 'cursor-pointer hover:bg-yellow-50' : ''} ${getCellBg(day.dateString, day.isWeekend)}`} style={{ top: '80px', height: '60px' }}>
                        {isManager && !isDownloading && selectedCell?.type === 'holiday' && selectedCell?.date === day.dateString ? (
                          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[140px] z-[100] bg-white border-2 border-slate-300 shadow-2xl p-2 rounded-xl flex flex-col gap-2" onClick={e=>e.stopPropagation()}>
                            <input autoFocus type="text" value={holidayInputText} onChange={(e) => setHolidayInputText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && saveHoliday(day.dateString)} className="w-full text-xs border border-slate-200 rounded p-1.5 outline-none font-bold text-slate-800 text-center" placeholder="節日或備註" />
                            <label className="flex items-center justify-center gap-1.5 text-[10px] text-slate-600 cursor-pointer bg-slate-50 py-1.5 rounded border border-slate-100">
                              <input type="checkbox" checked={holidayInputIsRed} onChange={(e) => setHolidayInputIsRed(e.target.checked)} className="accent-brand-red w-3.5 h-3.5 rounded"/>
                              標示為紅字休假
                            </label>
                            <div className="flex gap-1.5">
                              <button onClick={() => deleteHoliday(day.dateString)} className="flex-1 py-1.5 bg-slate-100 text-slate-500 text-xs font-bold rounded hover:bg-red-50 hover:text-red-500 border border-slate-200 active:scale-95 transition-all">清空</button>
                              <button onClick={() => saveHoliday(day.dateString)} className="flex-[1.5] py-1.5 bg-brand-red text-white text-xs font-bold rounded shadow-sm active:scale-95 transition-all">儲存</button>
                            </div>
                          </div>
                        ) : (
                          h && <div className={`writing-vertical-lr font-black text-[13px] mx-auto pt-1 tracking-widest ${h.isRed ? 'text-brand-red' : 'text-slate-600'}`}>{h.text}</div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {staffList.map((staff, index) => {
                  const isDragging = draggedStaffId === staff.id;
                  const isOver = overStaffId === staff.id;
                  return (
                  <tr 
                    key={staff.id} 
                    draggable={isManager && !isDownloading}
                    onDragStart={() => handleDragStart(staff.id)}
                    onDragOver={(e) => handleDragOver(e, staff.id)}
                    onDragEnd={handleDragEnd}
                    className={`${isManager && !isDownloading ? 'group cursor-grab active:cursor-grabbing' : ''} ${isDragging ? 'opacity-40' : ''} ${isOver ? 'border-y-2 border-brand-red shadow-sm relative z-20' : ''}`}
                  >
                    <td className={`border border-slate-500 p-0 sticky left-0 z-[30] transition-colors`} style={getTitleColorStyle(staff.title)}>
                      <div className="flex items-center h-full">
                        {isManager && !isDownloading && <div className="pl-1 opacity-50 shrink-0"><Icon name="grip-vertical" size={14} /></div>}
                        {isDownloading ? (
                          <div className={`w-full h-full min-h-[36px] flex items-center justify-center text-[11px] font-bold ${isManager ? 'pl-1' : 'pl-2'}`}>
                            {staff.title}
                          </div>
                        ) : (
                          <SyncInput value={staff.title} onChange={(val) => updateStaffInfo(staff.id, 'title', val)} readOnly={!isManager} className={`w-full h-full py-2 pr-1 ${isManager ? 'pl-1' : 'pl-2'} bg-transparent text-center outline-none font-bold ${isManager ? '' : 'cursor-default'}`} />
                        )}
                      </div>
                    </td>
                    <td className={`border border-slate-500 p-0 sticky left-[76px] z-[30] bg-white group-hover:bg-blue-50 relative`}>
                      {isDownloading ? (
                        <div className="w-full h-full min-h-[36px] px-0.5 flex items-center justify-center font-black text-sm text-slate-800">
                          {staff.name}
                        </div>
                      ) : (
                        <SyncInput value={staff.name} onChange={(val) => updateStaffInfo(staff.id, 'name', val)} readOnly={!isManager} className={`w-full h-full px-0.5 py-2 bg-transparent text-center font-black text-sm outline-none ${isManager ? 'text-slate-800' : 'text-slate-700 cursor-default'}`} />
                      )}
                      {isManager && !isDownloading && <button onClick={() => removeStaff(staff.id)} className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 text-white bg-red-500 hover:bg-red-600 transition-opacity p-0.5 rounded-bl-lg shadow-sm z-10"><Icon name="x" size={10} /></button>}
                    </td>
                    <td className="border border-slate-500 p-1 text-center font-black text-lg text-slate-700 bg-slate-100 sticky left-[156px] z-[30]">{calculateOffDays(staff.shifts)}</td>
                    {daysInMonth.map(day => {
                      const cellKey = `${staff.id}_${day.dateString}`;
                      const isHighlighted = (activeMonthData?.cellColors || {})[cellKey] === 'bg-yellow-300';
                      const baseBg = getCellBg(day.dateString, day.isWeekend);
                      const finalBg = isHighlighted ? 'bg-yellow-300' : baseBg;
                      
                      return (
                        <td key={`${staff.id}-${day.dateNum}`} 
                          onClick={() => { if (isHighlightMode) toggleCellColor(staff.id, day.dateString); }}
                          className={`border border-slate-500 p-0 relative ${finalBg} ${isHighlightMode ? 'cursor-pointer hover:opacity-80' : ''}`}>
                          {isDownloading ? (
                            <div className="w-full h-full min-h-[36px] flex items-center justify-center font-black uppercase text-[14px] text-slate-800">
                              {(staff.shifts || {})[day.dateString] || ''}
                            </div>
                          ) : (
                            <SyncInput 
                              value={(staff.shifts || {})[day.dateString] || ''} 
                              onChange={(val) => updateShift(staff.id, day.dateString, val.toUpperCase())} 
                              readOnly={!isManager || isHighlightMode} 
                              className={`w-full h-[36px] text-center bg-transparent outline-none font-black uppercase text-[14px] ${isManager && !isHighlightMode ? 'focus:bg-yellow-100 focus:ring-1 focus:ring-blue-400 text-slate-800' : 'text-slate-700 cursor-default'} ${isHighlightMode ? 'pointer-events-none' : ''}`} 
                              maxLength={4} 
                            />
                          )}
                        </td>
                      );
                    })}
                  </tr>
                  );
                })}
              </tbody>
              <tfoot className="font-bold text-[10px] sticky bottom-0 z-[40] shadow-[0_-4px_10px_rgba(0,0,0,0.15)]">
                <tr>
                  <td colSpan={3} className="border border-slate-500 p-2 text-right bg-orange-50 text-orange-800 sticky left-0 z-[60] text-sm">早班總人數 (含全天)</td>
                  {daysInMonth.map(day => <td key={`morning-${day.dateNum}`} className="border border-slate-500 p-1 text-center bg-orange-50 text-orange-800 font-black text-lg">{calculateDailyStats(day.dateString).morning || ''}</td>)}
                </tr>
                <tr>
                  <td colSpan={3} className="border border-slate-500 p-2 text-right bg-indigo-50 text-indigo-800 sticky left-0 z-[60] text-sm">晚班總人數 (含全天)</td>
                  {daysInMonth.map(day => <td key={`evening-${day.dateNum}`} className="border border-slate-500 p-1 text-center bg-indigo-50 text-indigo-800 font-black text-lg">{calculateDailyStats(day.dateString).evening || ''}</td>)}
                </tr>
                <tr>
                  <td colSpan={3} className="border border-slate-500 p-2 text-right bg-slate-800 text-white sticky left-0 z-[60] font-black text-sm">當日總上班人數</td>
                  {daysInMonth.map(day => <td key={`total-${day.dateNum}`} className="border border-slate-500 p-1 text-center bg-slate-800 text-white font-black text-lg">{calculateDailyStats(day.dateString).total || ''}</td>)}
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>
    </div>
    
    {/* 新增：高畫質圖片預覽 Modal，用於修復 iOS 無法直接下載的問題 */}
    {previewImage && (
      <div className="fixed inset-0 z-[100000] bg-slate-900/95 flex flex-col items-center justify-center p-4 sm:p-8 animate-in fade-in">
        <div className="w-full max-w-6xl flex flex-col sm:flex-row justify-between items-center mb-4 gap-4">
          <p className="text-white font-black text-sm bg-brand-red px-5 py-2.5 rounded-full shadow-lg text-center leading-relaxed">
            💡 手機用戶請「長按圖片」選擇儲存至相簿
          </p>
          <button onClick={() => setPreviewImage(null)} className="text-white bg-slate-700 hover:bg-slate-600 px-6 py-2.5 rounded-full font-black shadow-lg transition-all active:scale-95 text-sm">
            關閉預覽
          </button>
        </div>
        <div className="overflow-auto w-full max-w-6xl bg-white rounded-2xl shadow-2xl custom-scrollbar border-4 border-slate-800" style={{ maxHeight: 'calc(100vh - 180px)' }}>
          <img src={previewImage} alt="班表圖片預覽" className="w-max min-w-full" style={{ touchAction: 'pan-x pan-y' }} />
        </div>
        <div className="mt-6 flex justify-center w-full max-w-6xl">
          <button onClick={() => {
            const link = document.createElement('a');
            link.download = `${currentBranch}-${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月班表.jpg`;
            link.href = previewImage;
            link.click();
          }} className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3.5 rounded-2xl font-black shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all text-sm">
            <Icon name="download" size={18} /> 電腦版點此下載圖片
          </button>
        </div>
      </div>
    )}
  </div>
);
};

// --- 進階菜單前台展示元件 ---

export default ScheduleSystem
