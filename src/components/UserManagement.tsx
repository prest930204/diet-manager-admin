import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Plus, Trash2, Edit2, Search } from 'lucide-react';

export function UserManagement() {
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/members')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) setUsers(data);
      })
      .catch(console.error);
  }, []);

  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '', phone: '', targetCal: '', targetWeight: '' });

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newUser, targetCal: Number(newUser.targetCal), targetWeight: Number(newUser.targetWeight) })
      });
      const data = await res.json();
      
      if (res.status === 503) {
        alert(data.error);
        return;
      }

      if (res.ok) {
        setUsers([...users, { ...newUser, target_cal: Number(newUser.targetCal), target_weight: Number(newUser.targetWeight) }]);
        setIsAddingUser(false);
        setNewUser({ username: '', password: '', phone: '', targetCal: '', targetWeight: '' });
      } else {
        alert(data.error || '추가 실패');
      }
    } catch (err) {
      alert('서버 연결 실패');
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;
    try {
      const res = await fetch(`/api/members/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setUsers(users.filter(u => u.id !== id));
      }
    } catch (err) {
      alert('삭제 실패');
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">회원 관리</h2>
          <p className="text-slate-500 mt-2">회원 계정을 추가하거나 삭제하고 데이터를 관리합니다.</p>
        </div>
        <Button onClick={() => setIsAddingUser(!isAddingUser)} size="lg" className="shadow-md shadow-indigo-200">
          <Plus size={20} className="mr-2" />
          {isAddingUser ? '취소' : '새 회원 추가'}
        </Button>
      </div>

      {isAddingUser && (
        <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/50 backdrop-blur-xl animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-slate-900">새 회원 등록</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">아이디 (Username)</label>
                <Input
                  required
                  placeholder="user_id"
                  value={newUser.username}
                  onChange={e => setNewUser({ ...newUser, username: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">비밀번호</label>
                <Input
                  required
                  type="password"
                  placeholder="••••••••"
                  value={newUser.password}
                  onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">전화번호</label>
                <Input
                  required
                  placeholder="010-0000-0000"
                  value={newUser.phone}
                  onChange={e => setNewUser({ ...newUser, phone: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">목표 칼로리 (kcal)</label>
                <Input
                  required
                  type="number"
                  placeholder="2000"
                  value={newUser.targetCal}
                  onChange={e => setNewUser({ ...newUser, targetCal: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">목표 체중 (kg)</label>
                <Input
                  required
                  type="number"
                  placeholder="70"
                  value={newUser.targetWeight}
                  onChange={e => setNewUser({ ...newUser, targetWeight: e.target.value })}
                  className="bg-white"
                />
              </div>
              <div className="md:col-span-2 flex justify-end mt-4">
                <Button type="submit" size="lg" className="w-full md:w-auto shadow-md shadow-indigo-200">
                  등록 완료
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">회원 정보</th>
                <th className="px-6 py-4 font-semibold tracking-wider">연락처</th>
                <th className="px-6 py-4 font-semibold tracking-wider">목표 칼로리</th>
                <th className="px-6 py-4 font-semibold tracking-wider">목표 체중</th>
                <th className="px-6 py-4 font-semibold tracking-wider text-right">관리</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="bg-white border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                        {user.username ? user.username[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{user.phone}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                      {user.target_cal || user.targetCal} kcal
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                      {user.target_weight || 0} kg
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="text-slate-400 hover:text-indigo-600 hover:bg-indigo-50">
                        <Edit2 size={16} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
