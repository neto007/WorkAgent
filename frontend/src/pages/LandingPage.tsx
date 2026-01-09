import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Shield, Terminal, Zap, Code, Cpu, Activity, Lock, ArrowRight, Github, CheckCircle2, AlertTriangle, TrendingUp, Users, Workflow } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function LandingPage() {
    const navigate = useNavigate();
    const [typedText, setTypedText] = useState('');
    const fullText = '$ sudo evosec scan --target production-api';

    useEffect(() => {
        let currentIndex = 0;
        const interval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setTypedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(interval);
            }
        }, 50);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="min-h-screen bg-[#0b0b11] text-[#f8f8f2] font-sans selection:bg-[#bd93f9] selection:text-[#0b0b11] overflow-x-hidden">
            {/* Animated Background Grid */}
            <div className="fixed inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0" style={{
                    backgroundImage: 'linear-gradient(#bd93f9 1px, transparent 1px), linear-gradient(90deg, #bd93f9 1px, transparent 1px)',
                    backgroundSize: '50px 50px',
                    animation: 'gridMove 20s linear infinite'
                }} />
            </div>

            {/* Navbar */}
            <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#1a1b26] bg-[#0b0b11]/90 backdrop-blur-xl">
                <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <Shield className="h-7 w-7 text-[#bd93f9]" />
                            <div className="absolute -inset-1 bg-[#bd93f9] blur-md opacity-30 animate-pulse" />
                        </div>
                        <span className="text-2xl font-black tracking-widest">
                            EVO<span className="text-[#bd93f9]">SEC</span>
                        </span>
                    </div>
                    <div className="hidden md:flex items-center gap-8 text-sm font-medium">
                        <a href="#features" className="text-[#6272a4] hover:text-[#f8f8f2] transition-colors">Features</a>
                        <a href="#workflow" className="text-[#6272a4] hover:text-[#f8f8f2] transition-colors">How_It_Works</a>
                        <a href="#pricing" className="text-[#6272a4] hover:text-[#f8f8f2] transition-colors">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[#6272a4] hover:text-[#f8f8f2] hover:bg-[#1a1b26]"
                            onClick={() => window.open('https://github.com/evolution-api', '_blank')}
                        >
                            <Github className="h-5 w-5" />
                        </Button>
                        <Button
                            onClick={() => navigate('/login')}
                            className="bg-[#bd93f9] hover:bg-[#bd93f9]/90 text-[#0b0b11] font-bold uppercase tracking-wider text-xs px-6"
                        >
                            <Terminal className="h-4 w-4 mr-2" />
                            Login
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Hero Section - Enhanced */}
            <section className="relative pt-40 pb-32 px-6 overflow-hidden">
                {/* Animated Orbs */}
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-[#bd93f9]/20 blur-[100px] rounded-full animate-pulse" />
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-[#50fa7b]/20 blur-[100px] rounded-full animate-pulse" style={{ animationDelay: '1s' }} />

                <div className="max-w-6xl mx-auto text-center relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#50fa7b]/40 bg-[#50fa7b]/10 text-[#50fa7b] text-xs font-mono mb-10 shadow-[0_0_20px_rgba(80,250,123,0.3)]">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50fa7b] opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#50fa7b]"></span>
                        </span>
                        SYSTEM_STATUS: OPERATIONAL // THREATS_NEUTRALIZED: 1,247
                    </div>

                    <h1 className="text-6xl md:text-8xl font-black tracking-tight leading-[1.1] mb-8">
                        <span className="block mb-2">Autonomous</span>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#bd93f9] via-[#ff79c6] to-[#50fa7b] animate-gradient bg-[length:200%_auto]">
                            Hacker Agents
                        </span>
                    </h1>

                    <p className="text-xl md:text-2xl text-[#6272a4] max-w-3xl mx-auto mb-12 leading-relaxed">
                        Deploy AI-powered offensive security swarms that <span className="text-[#50fa7b] font-bold">find</span>,
                        <span className="text-[#f1fa8c] font-bold"> exploit</span>, and
                        <span className="text-[#bd93f9] font-bold"> patch</span> vulnerabilities automatically.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-20">
                        <Button
                            size="lg"
                            onClick={() => navigate('/login')}
                            className="h-14 px-10 bg-gradient-to-r from-[#50fa7b] to-[#8be9fd] hover:from-[#50fa7b]/90 hover:to-[#8be9fd]/90 text-[#0b0b11] font-black text-base uppercase tracking-widest shadow-[0_0_30px_rgba(80,250,123,0.5)] hover:shadow-[0_0_40px_rgba(80,250,123,0.7)] transition-all hover:scale-105"
                        >
                            Initialize_Agents <Terminal className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="h-14 px-10 border-2 border-[#bd93f9] bg-transparent text-[#bd93f9] hover:bg-[#bd93f9] hover:text-[#0b0b11] font-bold text-base uppercase tracking-widest transition-all"
                        >
                            Watch_Demo
                        </Button>
                    </div>

                    {/* Enhanced Terminal */}
                    <div className="max-w-5xl mx-auto rounded-2xl border-2 border-[#1a1b26] bg-[#050101] shadow-2xl overflow-hidden relative group hover:border-[#bd93f9]/50 transition-all">
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#bd93f9] to-[#50fa7b] opacity-0 group-hover:opacity-20 blur-xl transition-opacity" />
                        <div className="relative">
                            <div className="bg-gradient-to-r from-[#1a1b26] to-[#282a36] px-5 py-3 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-[#ff5555] shadow-[0_0_8px_#ff5555]" />
                                    <div className="w-3 h-3 rounded-full bg-[#f1fa8c] shadow-[0_0_8px_#f1fa8c]" />
                                    <div className="w-3 h-3 rounded-full bg-[#50fa7b] shadow-[0_0_8px_#50fa7b]" />
                                </div>
                                <div className="text-xs text-[#6272a4] font-mono flex items-center gap-2">
                                    <Terminal className="h-3 w-3" />
                                    root@evosec-command-center
                                </div>
                            </div>
                            <div className="p-8 font-mono text-sm space-y-3">
                                <div className="text-[#bd93f9]">{typedText}<span className="animate-pulse">_</span></div>
                                <div className="text-[#6272a4]">[+] Loading vulnerability database... [<span className="text-[#50fa7b]">OK</span>]</div>
                                <div className="text-[#6272a4]">[+] Initializing agent swarm (12 units)... [<span className="text-[#50fa7b]">OK</span>]</div>
                                <div className="text-[#f1fa8c] flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    [!] 5 SQL Injection vectors detected in /api/v2/auth
                                </div>
                                <div className="text-[#ff5555] flex items-center gap-2">
                                    <AlertTriangle className="h-4 w-4" />
                                    [!] Critical: Unauthenticated RCE in payment gateway
                                </div>
                                <div className="text-[#8be9fd]">[+] Generating automated patches...</div>
                                <div className="text-[#50fa7b] flex items-center gap-2">
                                    <CheckCircle2 className="h-4 w-4" />
                                    [✓] All vulnerabilities patched. PR #847 created.
                                </div>
                                <div className="text-[#bd93f9] mt-4">$ &lt;Ready for next target&gt;</div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 border-y border-[#1a1b26] bg-gradient-to-b from-[#0b0b11] to-[#050101]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                        {[
                            { value: '1.2M+', label: 'Vulnerabilities_Found', icon: <AlertTriangle className="h-6 w-6 text-[#ff5555]" /> },
                            { value: '99.7%', label: 'Threat_Detection_Rate', icon: <TrendingUp className="h-6 w-6 text-[#50fa7b]" /> },
                            { value: '24/7', label: 'Autonomous_Scanning', icon: <Activity className="h-6 w-6 text-[#bd93f9]" /> },
                            { value: '500+', label: 'Enterprise_Clients', icon: <Users className="h-6 w-6 text-[#8be9fd]" /> }
                        ].map((stat, i) => (
                            <div key={i} className="text-center group">
                                <div className="mb-4 flex justify-center">
                                    <div className="p-3 rounded-xl bg-[#1a1b26] group-hover:bg-[#282a36] transition-colors">
                                        {stat.icon}
                                    </div>
                                </div>
                                <div className="text-4xl font-black mb-2 text-transparent bg-clip-text bg-gradient-to-r from-[#bd93f9] to-[#50fa7b]">
                                    {stat.value}
                                </div>
                                <div className="text-xs text-[#6272a4] font-mono uppercase tracking-widest">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Grid - Enhanced */}
            <section id="features" className="py-32 bg-[#0b0b11] relative">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black uppercase tracking-wider mb-6">
                            Arsenal of <span className="text-[#ff5555]">Cyber_Weapons</span>
                        </h2>
                        <p className="text-xl text-[#6272a4] max-w-2xl mx-auto">
                            Every agent is a specialized penetration testing unit with autonomous decision-making.
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <Zap className="h-10 w-10 text-[#f1fa8c]" />,
                                title: "Auto_Remediation",
                                desc: "Don't just log vulnerabilities—agents write the patches and open PRs automatically.",
                                color: '#f1fa8c'
                            },
                            {
                                icon: <Cpu className="h-10 w-10 text-[#bd93f9]" />,
                                title: "Orchestrated_Swarms",
                                desc: "Coordinate LLM, A2A, Sequential, and Parallel agents in complex attack scenarios.",
                                color: '#bd93f9'
                            },
                            {
                                icon: <Activity className="h-10 w-10 text-[#50fa7b]" />,
                                title: "24/7_Recon",
                                desc: "Continuous scanning of your attack surface with real-time threat intelligence.",
                                color: '#50fa7b'
                            },
                            {
                                icon: <Code className="h-10 w-10 text-[#8be9fd]" />,
                                title: "Semantic_Analysis",
                                desc: "LLM-powered code review that understands business logic and context.",
                                color: '#8be9fd'
                            },
                            {
                                icon: <Lock className="h-10 w-10 text-[#ff5555]" />,
                                title: "Zero_Trust_Core",
                                desc: "Every agent action is verified, logged, and isolated from your production environment.",
                                color: '#ff5555'
                            },
                            {
                                icon: <Terminal className="h-10 w-10 text-[#ff79c6]" />,
                                title: "Custom_Tooling",
                                desc: "Integrate Burp Suite, Metasploit, Nmap, or your proprietary security tools.",
                                color: '#ff79c6'
                            }
                        ].map((feature, i) => (
                            <div
                                key={i}
                                className="group p-8 rounded-2xl border-2 border-[#1a1b26] bg-gradient-to-br from-[#050101] to-[#0b0b11] hover:border-[#bd93f9]/50 transition-all hover:scale-105 relative overflow-hidden"
                            >
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity" style={{
                                    background: `radial-gradient(circle at center, ${feature.color}, transparent)`
                                }} />
                                <div className="relative z-10">
                                    <div className="mb-6 p-4 rounded-xl bg-[#1a1b26] w-fit group-hover:scale-110 transition-transform">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-xl font-black mb-4 text-[#f8f8f2] uppercase tracking-wide">{feature.title}</h3>
                                    <p className="text-[#6272a4] leading-relaxed">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section id="workflow" className="py-32 bg-gradient-to-b from-[#050101] to-[#0b0b11] border-t border-[#1a1b26]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black uppercase mb-6">
                            <span className="text-[#bd93f9]">Workflow</span> Automation
                        </h2>
                        <p className="text-xl text-[#6272a4]">Drag. Drop. Deploy. Destroy vulnerabilities.</p>
                    </div>

                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { step: '01', title: 'Define_Scope', desc: 'Specify targets, assets, and exclusion rules.', icon: <Shield className="h-8 w-8" /> },
                            { step: '02', title: 'Build_Workflow', desc: 'Drag agent nodes to create custom attack chains.', icon: <Workflow className="h-8 w-8" /> },
                            { step: '03', title: 'Execute_Mission', desc: 'Agents autonomously execute the pentest workflow.', icon: <Cpu className="h-8 w-8" /> },
                            { step: '04', title: 'Review_&_Fix', desc: 'Approve auto-generated patches or deploy manually.', icon: <CheckCircle2 className="h-8 w-8" /> }
                        ].map((item, i) => (
                            <div key={i} className="relative">
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-[#1a1b26] border-2 border-[#bd93f9] text-[#bd93f9] mb-6 shadow-[0_0_20px_rgba(189,147,249,0.3)]">
                                        {item.icon}
                                    </div>
                                    <div className="text-xs font-mono text-[#6272a4] mb-2">STEP_{item.step}</div>
                                    <h3 className="text-lg font-black mb-3 text-[#f8f8f2]">{item.title}</h3>
                                    <p className="text-sm text-[#6272a4] leading-relaxed">{item.desc}</p>
                                </div>
                                {i < 3 && (
                                    <div className="hidden md:block absolute top-10 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[#bd93f9] to-transparent" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Pricing */}
            <section id="pricing" className="py-32 bg-[#0b0b11]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="text-center mb-20">
                        <h2 className="text-5xl font-black uppercase mb-6">Choose Your <span className="text-[#50fa7b]">Arsenal</span></h2>
                        <p className="text-xl text-[#6272a4]">Scale from solo hacker to enterprise war room.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {[
                            {
                                name: 'Solo_Hacker',
                                price: '$49',
                                features: ['5 Active Agents', 'Basic MCP Tools', '100 Scans/month', 'Email Support'],
                                color: '#6272a4',
                                recommended: false
                            },
                            {
                                name: 'Team_Fortress',
                                price: '$199',
                                features: ['25 Active Agents', 'Advanced MCP + Custom Tools', 'Unlimited Scans', 'Priority Support', 'Slack Integration'],
                                color: '#bd93f9',
                                recommended: true
                            },
                            {
                                name: 'Enterprise_Grid',
                                price: 'Custom',
                                features: ['Unlimited Agents', 'White-label Deployment', 'On-premise Option', 'Dedicated Security Engineer', 'SLA Guarantee'],
                                color: '#50fa7b',
                                recommended: false
                            }
                        ].map((tier, i) => (
                            <div
                                key={i}
                                className={`relative p-8 rounded-2xl border-2 ${tier.recommended ? 'border-[#bd93f9] bg-gradient-to-b from-[#bd93f9]/10 to-[#050101] scale-105' : 'border-[#1a1b26] bg-[#050101]'} transition-all hover:scale-105`}
                            >
                                {tier.recommended && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-[#bd93f9] text-[#0b0b11] text-xs font-black uppercase tracking-wider rounded-full">
                                        MOST_POPULAR
                                    </div>
                                )}
                                <h3 className="text-2xl font-black uppercase mb-2" style={{ color: tier.color }}>{tier.name}</h3>
                                <div className="text-4xl font-black mb-8">
                                    {tier.price}
                                    {tier.price !== 'Custom' && <span className="text-lg text-[#6272a4]">/mo</span>}
                                </div>
                                <ul className="space-y-4 mb-8">
                                    {tier.features.map((feature, j) => (
                                        <li key={j} className="flex items-start gap-3 text-[#6272a4]">
                                            <CheckCircle2 className="h-5 w-5 text-[#50fa7b] flex-shrink-0 mt-0.5" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Button
                                    onClick={() => navigate('/login')}
                                    className={`w-full ${tier.recommended ? 'bg-[#bd93f9] hover:bg-[#bd93f9]/90 text-[#0b0b11]' : 'bg-[#1a1b26] hover:bg-[#282a36] text-[#f8f8f2]'} font-bold uppercase tracking-wider`}
                                >
                                    Deploy_Now
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-[#bd93f9]/10 to-[#50fa7b]/10" />
                <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
                    <h2 className="text-5xl md:text-6xl font-black mb-8">
                        Ready to <span className="text-[#ff5555]">Pwn</span> Your Stack?
                    </h2>
                    <p className="text-xl text-[#6272a4] mb-12">Join 500+ security teams using autonomous agents for offensive defense.</p>
                    <Button
                        size="lg"
                        onClick={() => navigate('/login')}
                        className="h-16 px-12 bg-gradient-to-r from-[#ff5555] to-[#bd93f9] hover:from-[#ff5555]/90 hover:to-[#bd93f9]/90 text-white font-black text-lg uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                    >
                        Initialize_Terminal <ArrowRight className="ml-3 h-6 w-6" />
                    </Button>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t-2 border-[#1a1b26] py-16 bg-[#050101]">
                <div className="max-w-7xl mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Shield className="h-6 w-6 text-[#bd93f9]" />
                                <span className="text-xl font-black">EVOSEC</span>
                            </div>
                            <p className="text-sm text-[#6272a4] leading-relaxed">
                                Autonomous AI agents for offensive security and vulnerability management.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider mb-4">Product</h4>
                            <ul className="space-y-2 text-sm text-[#6272a4]">
                                <li><a href="#features" className="hover:text-[#bd93f9]">Features</a></li>
                                <li><a href="#pricing" className="hover:text-[#bd93f9]">Pricing</a></li>
                                <li><a href="#" className="hover:text-[#bd93f9]">Documentation</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider mb-4">Company</h4>
                            <ul className="space-y-2 text-sm text-[#6272a4]">
                                <li><a href="#" className="hover:text-[#bd93f9]">About</a></li>
                                <li><a href="#" className="hover:text-[#bd93f9]">Careers</a></li>
                                <li><a href="#" className="hover:text-[#bd93f9]">Contact</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-sm font-black uppercase tracking-wider mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm text-[#6272a4]">
                                <li><a href="#" className="hover:text-[#bd93f9]">Privacy Policy</a></li>
                                <li><a href="#" className="hover:text-[#bd93f9]">Terms of Service</a></li>
                                <li><a href="#" className="hover:text-[#bd93f9]">Security</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-[#1a1b26] flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-xs text-[#44475a] font-mono">
                            © 2025 EVOSEC INC. // SYS_ID: {Math.random().toString(36).substring(7).toUpperCase()} // v3.1.4
                        </div>
                        <div className="flex gap-6">
                            <a href="#" className="text-[#6272a4] hover:text-[#bd93f9] transition-colors">
                                <Github className="h-5 w-5" />
                            </a>
                        </div>
                    </div>
                </div>
            </footer>

            <style>{`
                @keyframes gradient {
                    0% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animate-gradient {
                    animation: gradient 3s ease infinite;
                }
                @keyframes gridMove {
                    0% { transform: translate(0, 0); }
                    100% { transform: translate(50px, 50px); }
                }
            `}</style>
        </div>
    );
}
