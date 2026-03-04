import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Search, UserCircle } from 'lucide-react';
import { UserCalendar } from './UserCalendar';

export function Dashboard() {
  const [searchUsername, setSearchUsername] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (searchUsername && searchPhone) {
      try {
        const res = await fetch(`/api/members/search?username=${searchUsername}&phone=${searchPhone}`);
        const data = await res.json();
        
        if (res.status === 503) {
          alert(data.error);
          return;
        }

        if (res.ok) {
          setSelectedUser({
            id: data.id,
            username: data.username,
            phone: data.phone,
            targetCalories: data.target_cal,
            targetWeight: data.target_weight,
            currentWeight: data.current_weight || 0,
          });
        } else {
          alert('회원을 찾을 수 없습니다.');
          setSelectedUser(null);
        }
      } catch (err) {
        alert('서버 연결에 실패했습니다.');
      }
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">대시보드</h2>
          <p className="text-slate-500 mt-2">회원의 식단 기록을 확인하고 피드백을 남겨보세요.</p>
        </div>
      </div>

      <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/50 backdrop-blur-xl">
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="flex gap-4 items-end">
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">회원 아이디 (Username)</label>
              <Input
                placeholder="user123"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value)}
                className="bg-white"
              />
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">전화번호</label>
              <Input
                placeholder="010-1234-5678"
                value={searchPhone}
                onChange={(e) => setSearchPhone(e.target.value)}
                className="bg-white"
              />
            </div>
            <Button type="submit" size="lg" className="w-32 shadow-md shadow-indigo-200">
              <Search className="mr-2 h-4 w-4" />
              검색
            </Button>
          </form>
        </CardContent>
      </Card>

      {selectedUser ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-4 p-6 bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100">
            <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
              <UserCircle size={32} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{selectedUser.username}님</h3>
              <p className="text-slate-500">{selectedUser.phone} • ID: {selectedUser.id}</p>
            </div>
            <div className="ml-auto flex gap-6 text-right">
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">목표 칼로리</p>
                <p className="text-lg font-bold text-slate-900">{selectedUser.targetCalories} kcal</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">목표 체중</p>
                <p className="text-lg font-bold text-slate-900">{selectedUser.targetWeight || 0} kg</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">현재 체중</p>
                <p className="text-lg font-bold text-slate-900">{selectedUser.currentWeight} kg</p>
              </div>
            </div>
          </div>

          <UserCalendar user={selectedUser} />
        </div>
      ) : (
        <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 rounded-3xl border border-dashed border-slate-200">
          <Search size={48} className="mb-4 opacity-20" />
          <p>회원 아이디와 전화번호를 입력하여 검색해주세요.</p>
        </div>
      )}
    </div>
  );
}
