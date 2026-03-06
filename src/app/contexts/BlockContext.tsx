import React, { createContext, useContext, useState, ReactNode } from 'react';

type BlockType = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'All';

interface BlockContextType {
  activeBlock: BlockType;
  setActiveBlock: (block: BlockType) => void;
}

const BlockContext = createContext<BlockContextType | undefined>(undefined);

export function BlockProvider({ children }: { children: ReactNode }) {
  const [activeBlock, setActiveBlock] = useState<BlockType>('All');

  return (
    <BlockContext.Provider value={{ activeBlock, setActiveBlock }}>
      {children}
    </BlockContext.Provider>
  );
}

export function useBlock() {
  const context = useContext(BlockContext);
  if (context === undefined) {
    throw new Error('useBlock must be used within a BlockProvider');
  }
  return context;
}
