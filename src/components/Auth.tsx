import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';

export function Auth({ onLogin }: { onLogin: () => void }) {
  const [isLogin, setIsLogin] = useState(true);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const payload = isLogin 
        ? { username, password }
        : { username, password, email, phone };
        
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (res.status === 503) {
        alert(data.error);
        return;
      }
      
      if (res.ok) {
        if (isLogin) onLogin();
        else {
          alert('회원가입 성공! 로그인해주세요.');
          setIsLogin(true);
        }
      } else {
        alert(data.error || '오류가 발생했습니다.');
      }
    } catch (err) {
      alert('서버 연결에 실패했습니다. DATABASE_URL이 설정되었는지 확인해주세요.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
      <Card className="w-full max-w-md shadow-[0_20px_60px_rgb(0,0,0,0.06)] border-0">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-200">
            <span className="text-white text-2xl font-bold">A</span>
          </div>
          <CardTitle className="text-2xl font-bold text-slate-900">
            {isLogin ? '관리자 로그인' : '관리자 회원가입'}
          </CardTitle>
          <p className="text-sm text-slate-500 mt-2">
            {isLogin ? '식단 관리 시스템에 오신 것을 환영합니다.' : '새로운 관리자 계정을 생성합니다.'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mt-6">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">아이디</label>
              <Input placeholder="admin" value={username} onChange={e => setUsername(e.target.value)} required />
            </div>
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">비밀번호</label>
              <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">비밀번호 확인</label>
                  <Input type="password" placeholder="••••••••" required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">이메일</label>
                  <Input type="email" placeholder="admin@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider ml-1">전화번호</label>
                  <Input type="tel" placeholder="010-0000-0000" value={phone} onChange={e => setPhone(e.target.value)} required />
                </div>
              </>
            )}

            <Button type="submit" className="w-full mt-4" size="lg">
              {isLogin ? '로그인' : '회원가입'}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'}
            </span>
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 font-semibold text-indigo-600 hover:text-indigo-700"
            >
              {isLogin ? '회원가입' : '로그인'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
