import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Server, 
  Wallet, 
  Cpu, 
  Layers, 
  CheckCircle2, 
  Send, 
  Database,
  ArrowRight,
  ShieldCheck,
  Activity
} from 'lucide-react';

// Types
type NodeStatus = 'idle' | 'processing' | 'completed';
type Step = 1 | 2 | 3 | 4 | 5;

interface NodeInfo {
  id: Step;
  label: string;
  sublabel: string;
  icon: React.ElementType;
}

const NODES: NodeInfo[] = [
  { id: 1, label: 'Express API', sublabel: 'Payload Creation', icon: Server },
  { id: 2, label: 'Ethers Wallet', sublabel: 'Signing TX', icon: Wallet },
  { id: 3, label: 'RPC Provider', sublabel: 'Broadcasting', icon: Cpu },
  { id: 4, label: 'Mempool', sublabel: 'Queued', icon: Layers },
  { id: 5, label: 'Smart Contract', sublabel: 'Mint Success', icon: ShieldCheck },
];

const App: React.FC = () => {
  const [tokenType, setTokenType] = useState('Task Token (ERC20)');
  const [address, setAddress] = useState('0x71C7656EC7ab88b098defB751B7401B5f6d8976F');
  const [isMinting, setIsMinting] = useState(false);
  const [currentStep, setCurrentStep] = useState<Step | 0>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string | null>(null);

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const handleMint = async () => {
    if (isMinting) return;
    
    setIsMinting(true);
    setCurrentStep(1);
    setTxHash(null);
    setLogs([]);
    addLog(`Initiating mint for ${tokenType}...`);

    // Step 1: API
    await sleep(1500);
    addLog('API: Constructed transaction payload { data, to, value }');
    setCurrentStep(2);

    // Step 2: Wallet
    await sleep(1500);
    addLog('Wallet: Transaction signed with Private Key. Nonce: 42');
    setCurrentStep(3);

    // Step 3: RPC
    await sleep(1500);
    addLog('RPC: Broadcasting raw transaction to SecureChain network...');
    setCurrentStep(4);

    // Step 4: Mempool
    await sleep(2000);
    addLog('Mempool: Transaction picked up by miners. Processing...');
    setCurrentStep(5);

    // Step 5: Success
    await sleep(1000);
    const hash = '0x' + Math.random().toString(16).slice(2, 66);
    setTxHash(hash);
    addLog(`Success: Token minted to ${address.slice(0, 6)}...${address.slice(-4)}`);
    addLog(`TX Hash: ${hash}`);
    setIsMinting(false);
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  return (
    <div className="min-h-screen p-8 flex flex-col items-center">
      <header className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold mb-2 bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent"
        >
          Web3 Minting Simulator
        </motion.h1>
        <p className="text-slate-400">Node.js → SecureChain Pipeline Lifecycle</p>
      </header>

      {/* Control Panel */}
      <div className="glass p-6 w-full max-w-4xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-400">Token Type</label>
          <select 
            className="input-field"
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value)}
            disabled={isMinting}
          >
            <option>Task Token (ERC20)</option>
            <option>Certificate (ERC721)</option>
            <option>Achievement (SBT)</option>
          </select>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-slate-400">Recipient Wallet</label>
          <input 
            type="text" 
            className="input-field font-mono text-sm"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            disabled={isMinting}
          />
        </div>

        <div className="flex items-end">
          <button 
            className="btn-primary w-full flex items-center justify-center gap-2"
            onClick={handleMint}
            disabled={isMinting}
          >
            {isMinting ? (
              <>
                <Activity className="animate-spin h-4 w-4" />
                Processing...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Execute Mint API
              </>
            )}
          </button>
        </div>
      </div>

      {/* Visual Pipeline */}
      <div className="pipeline-container glass py-16 px-8 mb-12 relative overflow-hidden">
        <div className="pipeline-line"></div>
        
        {/* Data Packet Animation */}
        <AnimatePresence>
          {isMinting && currentStep > 0 && currentStep < 6 && (
            <motion.div
              key={currentStep}
              initial={{ left: `${(currentStep - 1) * 25}%`, opacity: 0 }}
              animate={{ left: `${(currentStep - 1) * 25}%`, opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="absolute top-1/2 -translate-y-1/2 z-10"
              style={{ marginLeft: '40px' }}
            >
              <div className="w-8 h-8 bg-indigo-500 rounded-lg shadow-[0_0_20px_#6366f1] flex items-center justify-center">
                <Database className="text-white h-4 w-4 animate-pulse" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {NODES.map((node) => {
          const Icon = node.icon;
          const isActive = currentStep === node.id;
          const isCompleted = currentStep > node.id;

          return (
            <div key={node.id} className="flex flex-col items-center relative z-20 w-1/5">
              <motion.div 
                animate={{ 
                  scale: isActive ? 1.1 : 1,
                  borderColor: isActive ? '#6366f1' : isCompleted ? '#10b981' : 'rgba(255,255,255,0.1)'
                }}
                className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 border-2 glass transition-all duration-300 ${isActive ? 'node-active' : ''}`}
              >
                {isCompleted ? (
                  <CheckCircle2 className="text-success h-8 w-8" />
                ) : (
                  <Icon className={`${isActive ? 'text-indigo-400' : 'text-slate-500'} h-8 w-8`} />
                )}
              </motion.div>
              <h3 className={`text-sm font-bold text-center ${isActive ? 'text-indigo-400' : 'text-slate-300'}`}>
                {node.label}
              </h3>
              <p className="text-[10px] text-slate-500 text-center uppercase tracking-wider mt-1">
                {node.sublabel}
              </p>
            </div>
          );
        })}
      </div>

      {/* Logs & Result */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass p-6">
          <div className="flex items-center gap-2 mb-4 text-slate-400">
            <Activity className="h-4 w-4" />
            <h3 className="text-sm font-semibold uppercase tracking-widest">Transaction Logs</h3>
          </div>
          <div className="log-container h-48 pr-2">
            {logs.length === 0 ? (
              <p className="text-slate-600 italic text-sm">System ready for transaction...</p>
            ) : (
              logs.map((log, i) => (
                <div key={i} className="log-entry text-indigo-300">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="glass p-6 flex flex-col justify-center relative overflow-hidden">
          {txHash ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="w-16 h-16 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="text-success h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Mint Successful!</h3>
              <p className="text-sm text-slate-400 mb-4">Transaction has been finalized on SecureChain.</p>
              <div className="bg-black/30 p-3 rounded-lg border border-success/30">
                <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Transaction Hash</p>
                <p className="font-mono text-xs text-indigo-300 break-all">{txHash}</p>
              </div >
            </motion.div>
          ) : (
            <div className="text-center text-slate-500">
              <Cpu className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="italic">Awaiting transaction finality...</p>
            </div>
          )}
          
          {/* Decorative background circle */}
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-500/5 rounded-full blur-3xl"></div>
        </div>
      </div>
      
      <footer className="mt-20 text-slate-600 text-xs text-center">
        <p>© 2026 SecureChain Ecosystem • Simulator v1.0.0</p>
        <p className="mt-1">RPC Connection: <span className="text-success">Connected</span> • Provider: Infura/Alchemy (Simulated)</p>
      </footer>
    </div>
  );
};

export default App;
