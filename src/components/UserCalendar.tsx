import React, { useState, useEffect } from 'react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  isSameDay,
  addDays,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Flame, Scale, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Button } from './ui/Button';
import { cn } from '@/lib/utils';

// Mock data generator
const generateMockData = (date: Date) => {
  const random = Math.random();
  if (random > 0.3) {
    return {
      calories: Math.floor(Math.random() * 1000) + 1500,
      carbs: Math.floor(Math.random() * 100) + 150,
      protein: Math.floor(Math.random() * 50) + 80,
      fat: Math.floor(Math.random() * 30) + 40,
      meals: [
        { name: '아침', desc: '닭가슴살 100g, 고구마 1개', cal: 350 },
        { name: '점심', desc: '현미밥 1공기, 연어구이', cal: 600 },
        { name: '저녁', desc: '샐러드, 삶은 계란 2개', cal: 400 },
      ],
      feedback: random > 0.7 ? '단백질 섭취가 아주 좋습니다!' : '',
    };
  }
  return null;
};

export function UserCalendar({ user }: { user: any }) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [feedbackText, setFeedbackText] = useState('');
  const [records, setRecords] = useState<any[]>([]);
  const [selectedDayData, setSelectedDayData] = useState<any>(null);

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const monthStr = format(currentDate, 'yyyy-MM');
        const res = await fetch(`/api/diet-records?memberId=${user.id}&month=${monthStr}`);
        if (res.ok) {
          const data = await res.json();
          setRecords(data);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchRecords();
  }, [currentDate, user.id]);

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  const onDateClick = (day: Date) => {
    setSelectedDate(day);
    const dateStr = format(day, 'yyyy-MM-dd');
    const record = records.find(r => {
      // Handle timezone differences if record_date is ISO string
      const rDate = new Date(r.record_date);
      return format(rDate, 'yyyy-MM-dd') === dateStr;
    });
    
    if (record) {
      setSelectedDayData({
        calories: record.calories,
        carbs: record.carbs,
        protein: record.protein,
        fat: record.fat,
        meals: record.meals || [],
        feedback: record.feedback || ''
      });
      setFeedbackText(record.feedback || '');
    } else {
      setSelectedDayData(null);
      setFeedbackText('');
    }
  };

  const handleFeedbackSubmit = async () => {
    try {
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const res = await fetch('/api/diet-records/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId: user.id, date: dateStr, feedback: feedbackText })
      });
      const data = await res.json();
      
      if (res.status === 503) {
        alert(data.error);
        return;
      }

      if (res.ok) {
        alert('피드백이 전송되었습니다.');
        setRecords(records.map(r => {
          const rDate = new Date(r.record_date);
          if (format(rDate, 'yyyy-MM-dd') === dateStr) {
            return { ...r, feedback: feedbackText };
          }
          return r;
        }));
      } else {
        alert('피드백 전송 실패');
      }
    } catch (e) {
      alert('서버 연결 실패');
    }
  };

  const renderHeader = () => {
    return (
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
          {format(currentDate, 'yyyy년 M월')}
        </h2>
        <div className="flex gap-2">
          <Button variant="outline" size="icon" onClick={prevMonth} className="rounded-full shadow-sm">
            <ChevronLeft size={20} />
          </Button>
          <Button variant="outline" size="icon" onClick={nextMonth} className="rounded-full shadow-sm">
            <ChevronRight size={20} />
          </Button>
        </div>
      </div>
    );
  };

  const renderDays = () => {
    const days = [];
    const date = ['일', '월', '화', '수', '목', '금', '토'];

    for (let i = 0; i < 7; i++) {
      days.push(
        <div key={i} className="text-center font-semibold text-xs text-slate-400 uppercase tracking-wider py-2">
          {date[i]}
        </div>
      );
    }
    return <div className="grid grid-cols-7 mb-2">{days}</div>;
  };

  const renderCells = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const rows = [];
    let days = [];
    let day = startDate;
    let formattedDate = '';

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        formattedDate = format(day, 'd');
        const cloneDay = day;
        const isSelected = isSameDay(day, selectedDate);
        const isCurrentMonth = isSameMonth(day, monthStart);
        
        const dateStr = format(day, 'yyyy-MM-dd');
        const record = records.find(r => {
          const rDate = new Date(r.record_date);
          return format(rDate, 'yyyy-MM-dd') === dateStr;
        });
        const hasData = !!record;
        const mockCal = hasData ? record.calories : null;

        days.push(
          <div
            key={day.toString()}
            onClick={() => onDateClick(cloneDay)}
            className={cn(
              "min-h-[60px] md:min-h-[100px] p-1 md:p-2 border border-slate-100/50 transition-all cursor-pointer relative group flex flex-col items-center md:items-start",
              !isCurrentMonth ? "bg-slate-50/50 text-slate-300" : "bg-white hover:bg-slate-50",
              isSelected && "ring-2 ring-indigo-500 ring-inset bg-indigo-50/30",
              i === 0 && "rounded-l-xl md:rounded-l-2xl",
              i === 6 && "rounded-r-xl md:rounded-r-2xl"
            )}
          >
            <span
              className={cn(
                "inline-flex items-center justify-center w-6 h-6 md:w-8 md:h-8 rounded-full text-xs md:text-sm font-semibold mb-1 transition-colors",
                isSelected ? "bg-indigo-600 text-white shadow-md shadow-indigo-200" : "text-slate-700 group-hover:bg-slate-200"
              )}
            >
              {formattedDate}
            </span>
            
            {mockCal && isCurrentMonth && (
              <div className="absolute bottom-1 left-1 right-1 md:bottom-2 md:left-2 md:right-2 flex justify-center md:justify-start">
                <div className="flex items-center justify-center gap-0.5 md:gap-1 text-[9px] md:text-xs font-medium text-orange-500 bg-orange-50 px-1 md:px-2 py-0.5 md:py-1 rounded-md md:rounded-lg w-full md:w-auto truncate">
                  <Flame size={10} className="shrink-0 hidden md:block" />
                  <span className="truncate">{mockCal}</span>
                </div>
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7 gap-1 mb-1" key={day.toString()}>
          {days}
        </div>
      );
      days = [];
    }
    return <div>{rows}</div>;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white">
          <CardContent className="p-3 md:p-8">
            {renderHeader()}
            {renderDays()}
            {renderCells()}
          </CardContent>
        </Card>
      </div>

      <div className="space-y-6">
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
          <CardHeader className="pb-4">
            <CardTitle className="text-xl font-bold flex items-center gap-2">
              {format(selectedDate, 'M월 d일 (E)', { locale: ko })} 식단
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDayData ? (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Flame size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">섭취 칼로리</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {selectedDayData.calories} <span className="text-sm font-medium text-slate-500">kcal</span>
                    </div>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100">
                    <div className="flex items-center gap-2 text-emerald-600 mb-1">
                      <Scale size={16} />
                      <span className="text-xs font-bold uppercase tracking-wider">현재 체중</span>
                    </div>
                    <div className="text-2xl font-black text-slate-900">
                      {user.currentWeight} <span className="text-sm font-medium text-slate-500">kg</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center justify-between">
                    영양소 요약
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">목표 달성률 85%</span>
                  </h4>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500" />
                        <span className="text-slate-600 font-medium">탄수화물</span>
                      </div>
                      <span className="font-bold text-slate-900">{selectedDayData.carbs}g</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-slate-600 font-medium">단백질</span>
                      </div>
                      <span className="font-bold text-slate-900">{selectedDayData.protein}g</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-orange-500" />
                        <span className="text-slate-600 font-medium">지방</span>
                      </div>
                      <span className="font-bold text-slate-900">{selectedDayData.fat}g</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">상세 식단</h4>
                  {selectedDayData.meals.map((meal: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-xl shadow-sm">
                      <div>
                        <p className="font-bold text-sm text-slate-900">{meal.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{meal.desc}</p>
                      </div>
                      <span className="font-bold text-sm text-slate-900 bg-slate-50 px-2 py-1 rounded-lg">{meal.cal} kcal</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p>기록된 식단 데이터가 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-400 to-orange-400" />
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <span className="text-yellow-500">⚡</span> 피드백 전송
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <textarea
                className="w-full min-h-[120px] p-4 rounded-2xl border border-slate-200 bg-slate-50 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all resize-none placeholder:text-slate-400"
                placeholder="회원에게 전달할 피드백을 입력하세요..."
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
              />
              <Button onClick={handleFeedbackSubmit} className="w-full shadow-md shadow-indigo-200" size="lg">
                <Send size={16} className="mr-2" />
                피드백 보내기
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
