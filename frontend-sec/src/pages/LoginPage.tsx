import React, { useState, useEffect, useRef, type FormEvent } from 'react';
import { Mail, Lock, LogIn, Cpu, AlertCircle, Loader2, User, CheckCircle2 } from 'lucide-react';
import { login, register, forgotPassword, getMe } from '@/services/authService';
import { useAuth } from '@/contexts/AuthContext';

type TabType = 'login' | 'register' | 'forgot';

const LoginPage: React.FC = () => {
    const auth = useAuth();
    const [activeTab, setActiveTab] = useState<TabType>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState('');

    // Login state
    const [loginData, setLoginData] = useState({
        email: '',
        password: '',
    });

    // Register state
    const [registerData, setRegisterData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        name: '',
    });

    // Forgot password state
    const [forgotEmail, setForgotEmail] = useState('');

    // Success states
    const [showRegisterSuccess, setShowRegisterSuccess] = useState(false);
    const [showForgotSuccess, setShowForgotSuccess] = useState(false);
    const [redirectSeconds, setRedirectSeconds] = useState(5);
    const redirectTimer = useRef<number | undefined | ReturnType<typeof setTimeout>>(undefined);

    // Handle login
    const handleLogin = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            console.log('🔐 Attempting login...');
            const response = await login({
                email: loginData.email,
                password: loginData.password,
            });

            console.log('✅ Login response:', response.data);
            const { data } = response;

            if (data.access_token && data.refresh_token) {
                console.log('🔑 Tokens received, fetching user data...');
                // Buscar dados do usuário
                const meResponse = await getMe();
                console.log('👤 User data:', meResponse.data);

                // Atualizar AuthContext com tokens e usuário
                auth.login(data.access_token, data.refresh_token, meResponse.data);
                console.log('✅ Auth context updated, redirecting...');

                // Redirecionar para página protegida
                window.location.href = '/agents';
            }
        } catch (error: any) {
            console.error('❌ Login error:', error);
            let errorDetail = 'Check your credentials and try again.';
            if (error?.response?.data) {
                if (typeof error.response.data.detail === 'string') {
                    errorDetail = error.response.data.detail;
                } else if (error.response.data.detail) {
                    errorDetail = JSON.stringify(error.response.data.detail);
                }
            }
            setLoginError(errorDetail);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle register
    const handleRegister = async (e: FormEvent) => {
        e.preventDefault();

        if (!registerData.password) {
            setLoginError('Password required');
            return;
        }

        if (registerData.password.length < 8) {
            setLoginError('Password must be at least 8 characters long');
            return;
        }

        if (registerData.password !== registerData.confirmPassword) {
            setLoginError('Passwords don\'t match');
            return;
        }

        setIsLoading(true);
        setLoginError('');

        try {
            await register({
                email: registerData.email,
                password: registerData.password,
                name: registerData.name,
            });

            setShowRegisterSuccess(true);
            setRedirectSeconds(5);
            if (redirectTimer.current) clearTimeout(redirectTimer.current);
            redirectTimer.current = setInterval(() => {
                setRedirectSeconds((s) => s - 1);
            }, 1000);
        } catch (error: any) {
            let errorMessage = 'Unable to register. Please try again.';
            if (error?.response?.data) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.detail) {
                    errorMessage = JSON.stringify(error.response.data.detail);
                }
            }
            setLoginError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Handle forgot password
    const handleForgotPassword = async (e: FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setLoginError('');

        try {
            await forgotPassword({ email: forgotEmail });
            setShowForgotSuccess(true);
            setRedirectSeconds(5);
            if (redirectTimer.current) clearTimeout(redirectTimer.current);
            redirectTimer.current = setInterval(() => {
                setRedirectSeconds((s) => s - 1);
            }, 1000);
        } catch (error: any) {
            let errorMessage = 'Unable to send the reset password email. Please try again.';
            if (error?.response?.data) {
                if (typeof error.response.data.detail === 'string') {
                    errorMessage = error.response.data.detail;
                } else if (error.response.data.detail) {
                    errorMessage = JSON.stringify(error.response.data.detail);
                }
            }
            setLoginError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    // Auto redirect after success
    useEffect(() => {
        if ((showRegisterSuccess || showForgotSuccess) && redirectSeconds === 0) {
            setShowRegisterSuccess(false);
            setShowForgotSuccess(false);
            setActiveTab('login');
            setRedirectSeconds(5);
            if (redirectTimer.current) clearTimeout(redirectTimer.current);
        }
    }, [showRegisterSuccess, showForgotSuccess, redirectSeconds]);

    useEffect(() => {
        if (!(showRegisterSuccess || showForgotSuccess) && redirectTimer.current) {
            clearInterval(redirectTimer.current);
        }
    }, [showRegisterSuccess, showForgotSuccess]);

    // Success screens
    if (showRegisterSuccess) {
        return (
            <div className="grid-bg min-h-screen flex items-center justify-center p-4 bg-[#050101]">
                <div className="w-full max-w-md bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-[#50fa7b] mx-auto mb-6" />
                    <h2 className="text-[14px] font-black uppercase tracking-widest text-[#f8f8f2] mb-4">
                        Registration_Successful
                    </h2>
                    <p className="text-[10px] text-[#6272a4] font-bold mb-2">
                        Please check your email to verify your account.
                    </p>
                    <p className="text-[9px] text-[#bd93f9] font-bold">
                        Redirecting in {redirectSeconds} seconds...
                    </p>
                </div>
            </div>
        );
    }

    if (showForgotSuccess) {
        return (
            <div className="grid-bg min-h-screen flex items-center justify-center p-4 bg-[#050101]">
                <div className="w-full max-w-md bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-12 text-center">
                    <CheckCircle2 className="w-16 h-16 text-[#50fa7b] mx-auto mb-6" />
                    <h2 className="text-[14px] font-black uppercase tracking-widest text-[#f8f8f2] mb-4">
                        Email_Sent
                    </h2>
                    <p className="text-[10px] text-[#6272a4] font-bold mb-2">
                        Check your inbox to reset your password.
                    </p>
                    <p className="text-[9px] text-[#bd93f9] font-bold">
                        Redirecting in {redirectSeconds} seconds...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="grid-bg min-h-screen flex items-center justify-center p-4 bg-[#050101]">
            <div className="w-full max-w-md">
                {/* Logo/Header */}
                <div className="text-center mb-8">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-[#bd93f9] rounded flex items-center justify-center shadow-[0_0_15px_rgba(189,147,249,0.4)]">
                            <Cpu size={24} className="text-black" />
                        </div>
                        <h1 className="text-2xl font-black tracking-[0.2em] uppercase italic text-[#6272a4]">
                            EVO<span className="text-[#ff79c6]">AI</span>
                        </h1>
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#6272a4]">
                        Security Architecture Platform
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex bg-[#1a1b26] p-1 rounded-lg border border-[#282a36] mb-6">
                    <button
                        onClick={() => { setActiveTab('login'); setLoginError(''); }}
                        className={`flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'login'
                            ? 'bg-[#bd93f9] text-black shadow-[0_0_10px_rgba(189,147,249,0.3)]'
                            : 'text-[#6272a4] hover:text-[#bd93f9]'
                            }`}
                    >
                        Login
                    </button>
                    <button
                        onClick={() => { setActiveTab('register'); setLoginError(''); }}
                        className={`flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'register'
                            ? 'bg-[#bd93f9] text-black shadow-[0_0_10px_rgba(189,147,249,0.3)]'
                            : 'text-[#6272a4] hover:text-[#bd93f9]'
                            }`}
                    >
                        Register
                    </button>
                    <button
                        onClick={() => { setActiveTab('forgot'); setLoginError(''); }}
                        className={`flex-1 px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded transition-all ${activeTab === 'forgot'
                            ? 'bg-[#bd93f9] text-black shadow-[0_0_10px_rgba(189,147,249,0.3)]'
                            : 'text-[#6272a4] hover:text-[#bd93f9]'
                            }`}
                    >
                        Forgot
                    </button>
                </div>

                {/* Login Card */}
                <div className="bg-[#0b0b11] border border-[#1a1b26] rounded-lg p-8 shadow-2xl">
                    {/* Login Tab */}
                    {activeTab === 'login' && (
                        <>
                            <h2 className="text-[11px] font-black text-[#bd93f9] uppercase tracking-widest mb-6">
                                System Access
                            </h2>
                            <form onSubmit={handleLogin} className="space-y-6">
                                <div>
                                    <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Email_Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="email"
                                            type="email"
                                            value={loginData.email}
                                            onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="user@domain.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Auth_Token
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="password"
                                            type="password"
                                            value={loginData.password}
                                            onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#bd93f9] focus:ring-1 focus:ring-[#bd93f9] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                {loginError && (
                                    <div className="flex items-center gap-2 p-3 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded text-[#ff5555] text-[10px] font-bold">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{loginError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#bd93f9] hover:bg-[#ff79c6] text-black font-black py-3 px-4 rounded transition-all shadow-[0_0_15px_rgba(189,147,249,0.3)] hover:shadow-[0_0_20px_rgba(255,121,198,0.4)] text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Authenticating...
                                        </>
                                    ) : (
                                        <>
                                            <LogIn className="h-4 w-4" />
                                            Initialize_Session
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Register Tab */}
                    {activeTab === 'register' && (
                        <>
                            <h2 className="text-[11px] font-black text-[#50fa7b] uppercase tracking-widest mb-6">
                                Create_Account
                            </h2>
                            <form onSubmit={handleRegister} className="space-y-6">
                                <div>
                                    <label htmlFor="register-name" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Full_Name
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <User className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="register-name"
                                            type="text"
                                            value={registerData.name}
                                            onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#50fa7b] focus:ring-1 focus:ring-[#50fa7b] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-email" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Email_Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="register-email"
                                            type="email"
                                            value={registerData.email}
                                            onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#50fa7b] focus:ring-1 focus:ring-[#50fa7b] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="user@domain.com"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="register-password"
                                            type="password"
                                            value={registerData.password}
                                            onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#50fa7b] focus:ring-1 focus:ring-[#50fa7b] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="register-confirm-password" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Confirm_Password
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Lock className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="register-confirm-password"
                                            type="password"
                                            value={registerData.confirmPassword}
                                            onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#50fa7b] focus:ring-1 focus:ring-[#50fa7b] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="••••••••••••"
                                        />
                                    </div>
                                </div>

                                {loginError && (
                                    <div className="flex items-center gap-2 p-3 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded text-[#ff5555] text-[10px] font-bold">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{loginError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#50fa7b] hover:bg-[#8be9fd] text-black font-black py-3 px-4 rounded transition-all shadow-[0_0_15px_rgba(80,250,123,0.3)] hover:shadow-[0_0_20px_rgba(139,233,253,0.4)] text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Creating...
                                        </>
                                    ) : (
                                        <>
                                            <User className="h-4 w-4" />
                                            Create_Account
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Forgot Password Tab */}
                    {activeTab === 'forgot' && (
                        <>
                            <h2 className="text-[11px] font-black text-[#ffb86c] uppercase tracking-widest mb-6">
                                Password_Recovery
                            </h2>
                            <form onSubmit={handleForgotPassword} className="space-y-6">
                                <div>
                                    <label htmlFor="forgot-email" className="block text-[10px] font-black uppercase tracking-widest text-[#6272a4] mb-2">
                                        Email_Address
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Mail className="h-4 w-4 text-[#6272a4]" />
                                        </div>
                                        <input
                                            id="forgot-email"
                                            type="email"
                                            value={forgotEmail}
                                            onChange={(e) => setForgotEmail(e.target.value)}
                                            required
                                            disabled={isLoading}
                                            className="block w-full pl-10 pr-3 py-3 bg-[#050101] border border-[#282a36] rounded text-[#f8f8f2] placeholder-[#6272a4] focus:outline-none focus:border-[#ffb86c] focus:ring-1 focus:ring-[#ffb86c] transition-all font-mono text-sm disabled:opacity-50"
                                            placeholder="user@domain.com"
                                        />
                                    </div>
                                </div>

                                {loginError && (
                                    <div className="flex items-center gap-2 p-3 bg-[#ff5555]/10 border border-[#ff5555]/30 rounded text-[#ff5555] text-[10px] font-bold">
                                        <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                        <span>{loginError}</span>
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-2 bg-[#ffb86c] hover:bg-[#f1fa8c] text-black font-black py-3 px-4 rounded transition-all shadow-[0_0_15px_rgba(255,184,108,0.3)] hover:shadow-[0_0_20px_rgba(241,250,140,0.4)] text-[10px] uppercase tracking-widest disabled:opacity-50"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="h-4 w-4 animate-spin" />
                                            Sending...
                                        </>
                                    ) : (
                                        <>
                                            <Mail className="h-4 w-4" />
                                            Send_Recovery_Link
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Bottom Info */}
                <div className="mt-6 text-center">
                    <p className="text-[8px] font-black uppercase tracking-widest text-[#6272a4]">
                        SECURE_CONNECTION_ESTABLISHED
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
