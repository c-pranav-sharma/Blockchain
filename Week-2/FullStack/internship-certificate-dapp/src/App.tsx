import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Award, 
  Plus, 
  ExternalLink, 
  Database, 
  ShieldCheck, 
  RefreshCw,
  Search,
  User,
  Hash,
  Link as LinkIcon
} from 'lucide-react';

// Types
interface NFTRecord {
  _id: string;
  tokenId: number;
  ownerAddress: string;
  metadataURI: string;
  transactionHash: string;
  contractAddress: string;
  mintedAt: string;
}

const API_BASE_URL = 'http://localhost:5002/api/nfts';

const App: React.FC = () => {
  const [records, setRecords] = useState<NFTRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    tokenId: '',
    ownerAddress: '',
    metadataURI: '',
    transactionHash: '',
    contractAddress: '0x95222290DD9278Aa3ddd389Cc1E1d165CC4BAfe5' // Default for demo
  });

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await axios.get(API_BASE_URL);
      if (response.data.success) {
        setRecords(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const response = await axios.post(`${API_BASE_URL}/record`, {
        ...formData,
        tokenId: parseInt(formData.tokenId)
      });
      if (response.data.success) {
        setRecords([response.data.data, ...records]);
        setShowForm(false);
        setFormData({
          tokenId: '',
          ownerAddress: '',
          metadataURI: '',
          transactionHash: '',
          contractAddress: '0x95222290DD9278Aa3ddd389Cc1E1d165CC4BAfe5'
        });
      }
    } catch (error) {
      console.error('Error submitting record:', error);
      alert('Failed to record NFT. Make sure the backend is running and Token ID is unique.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter(r => 
    r.ownerAddress.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.tokenId.toString().includes(searchTerm)
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 min-h-screen">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent flex items-center gap-3"
          >
            <Award className="text-indigo-400 h-10 w-10" />
            NFT Certificate Issuer
          </motion.h1>
          <p className="text-slate-400 mt-2">Manage and verify internship certificates on the blockchain.</p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={() => setShowForm(!showForm)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="h-5 w-5" />
            {showForm ? 'Cancel' : 'Issue Certificate'}
          </button>
          <button 
            onClick={fetchRecords}
            className="p-3 glass hover:bg-white/5 transition-colors"
            title="Refresh"
          >
            <RefreshCw className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </header>

      {/* Stats / Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {[
          { label: 'Total Issued', value: records.length, icon: ShieldCheck, color: 'text-emerald-400' },
          { label: 'Contract Address', value: '0x9522...fe5', icon: Database, color: 'text-indigo-400' },
          { label: 'Network', value: 'Sepolia Testnet', icon: RefreshCw, color: 'text-cyan-400' },
        ].map((stat, i) => (
          <div key={i} className="glass p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl bg-slate-900/50 ${stat.color}`}>
              <stat.icon className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
              <p className="text-xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="glass p-8 mb-12 border-indigo-500/30"
          >
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Award className="text-indigo-400" />
              New Certificate Details
            </h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <Hash className="h-3 w-3" /> Token ID
                </label>
                <input 
                  type="number" 
                  name="tokenId"
                  value={formData.tokenId}
                  onChange={handleInputChange}
                  className="input-field" 
                  placeholder="e.g. 101"
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <User className="h-3 w-3" /> Recipient Address
                </label>
                <input 
                  type="text" 
                  name="ownerAddress"
                  value={formData.ownerAddress}
                  onChange={handleInputChange}
                  className="input-field" 
                  placeholder="0x..."
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <LinkIcon className="h-3 w-3" /> Metadata URI (IPFS)
                </label>
                <input 
                  type="text" 
                  name="metadataURI"
                  value={formData.metadataURI}
                  onChange={handleInputChange}
                  className="input-field" 
                  placeholder="ipfs://..."
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-400 flex items-center gap-2">
                  <ExternalLink className="h-3 w-3" /> Transaction Hash
                </label>
                <input 
                  type="text" 
                  name="transactionHash"
                  value={formData.transactionHash}
                  onChange={handleInputChange}
                  className="input-field" 
                  placeholder="0x..."
                  required 
                />
              </div>
              <div className="md:col-span-2 pt-4">
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="btn-primary w-full flex items-center justify-center gap-2"
                >
                  {submitting ? <RefreshCw className="animate-spin h-5 w-5" /> : 'Confirm and Store Record'}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* List Section */}
      <div className="glass p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-xl font-bold">Issued Certificates</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by Token ID or Address..."
              className="input-field pl-10 w-full md:w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="h-12 w-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Fetching blockchain records...</p>
          </div>
        ) : filteredRecords.length === 0 ? (
          <div className="text-center py-20 text-slate-500">
            <Database className="h-16 w-16 mx-auto mb-4 opacity-20" />
            <p>No records found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {filteredRecords.map((record) => (
                <motion.div 
                  key={record._id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="glass p-6 certificate-card relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-4">
                    <div className="bg-indigo-500/20 text-indigo-400 text-[10px] font-black px-2 py-1 rounded uppercase tracking-tighter">
                      #{record.tokenId}
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-4">
                    <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <Award className="text-indigo-400 h-6 w-6" />
                    </div>
                    
                    <div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Owner Address</p>
                      <p className="font-mono text-sm text-slate-300 break-all">{record.ownerAddress}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">Minted On</p>
                        <p className="text-xs text-slate-400">{new Date(record.mintedAt).toLocaleDateString()}</p>
                      </div>
                      <div className="flex items-end justify-end">
                        <a 
                          href={`https://sepolia.etherscan.io/tx/${record.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-bold"
                        >
                          Etherscan <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <footer className="mt-20 text-center text-slate-600 text-sm">
        <p>© 2026 Blockchain Internship Program • Powered by SecureChain Node.js & MongoDB</p>
      </footer>
    </div>
  );
};

export default App;
