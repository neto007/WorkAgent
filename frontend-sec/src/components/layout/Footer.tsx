import React from 'react';

const Footer: React.FC = () => {
    return (
        <footer className="h-10 border-t border-[#1a1b26] bg-[#050101] px-6 flex items-center justify-between text-[9px] font-black uppercase tracking-widest text-[#6272a4]">
            <span>ShieldAI v1.0.0</span>
            <span>SYSTEM_STATUS: ONLINE</span>
        </footer>
    );
};

export default Footer;
