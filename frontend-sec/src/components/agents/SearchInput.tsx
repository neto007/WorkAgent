/*
 * @author: Davidson Gomes
 * @file: /components/agents/SearchInput.tsx
 * FlowSec Theme
 */
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
    value,
    onChange,
    placeholder = 'Search agents...'
}) => {
    return (
        <div className="relative w-full">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-[#6272a4]" />
            </div>
            <Input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className={
                    "pl-11 h-11 bg-[#1a1b26] border-[#44475a]/50 text-[#f8f8f2] placeholder:text-[#6272a4] " +
                    "focus:border-[#bd93f9] focus:ring-2 focus:ring-[#bd93f9]/20 " +
                    "font-jetbrains text-sm transition-all duration-200 " +
                    "hover:border-[#6272a4]"
                }
            />
        </div>
    );
};

export default SearchInput;
