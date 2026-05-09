document.addEventListener('DOMContentLoaded', () => {
    const btnStake = document.getElementById('btn-stake');
    const logContent = document.getElementById('log-content');
    const txId = document.getElementById('tx-id').innerText;

    const nodes = {
        frontend: document.getElementById('node-frontend').querySelector('.node-card'),
        blockchain: document.getElementById('node-blockchain').querySelector('.node-card'),
        backend: document.getElementById('node-backend').querySelector('.node-card'),
        mongodb: document.getElementById('node-mongodb').querySelector('.node-card')
    };

    const conns = {
        frontendBlockchain: document.getElementById('conn-frontend-blockchain'),
        frontendBackend: document.getElementById('conn-frontend-backend'),
        backendMongodb: document.getElementById('conn-backend-mongodb')
    };

    const addLog = (msg, type = 'system') => {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
        entry.innerHTML = `<span class="time">[${time}]</span> <span class="msg">${msg}</span>`;
        logContent.appendChild(entry);
        logContent.scrollTop = logContent.scrollHeight;
    };

    const animatePacket = async (conn, reverse = false) => {
        const packet = conn.querySelector('.packet');
        packet.style.animation = 'none';
        packet.offsetHeight; // trigger reflow
        
        if (conn.classList.contains('connection-h')) {
            packet.style.animation = reverse ? 'packetMoveHRev 1s forwards' : 'packetMoveH 1s forwards';
        } else {
            packet.style.animation = 'packetMoveV 0.8s forwards';
        }
        
        return new Promise(resolve => setTimeout(resolve, 1000));
    };

    const runSimulation = async () => {
        btnStake.disabled = true;
        btnStake.style.opacity = '0.5';
        logContent.innerHTML = ''; // Clear logs
        
        // Step 1: React Frontend (User Signs)
        addLog('Initiating transaction in React Frontend...', 'active');
        nodes.frontend.classList.add('active');
        await new Promise(r => setTimeout(r, 1500));
        addLog(`User signed transaction. TX: ${txId.substring(0, 10)}...`, 'success');

        // Step 2: Move to Blockchain
        await animatePacket(conns.frontendBlockchain);
        nodes.frontend.classList.remove('active');
        nodes.blockchain.classList.add('active');
        addLog('SCAI Blockchain: Processing Smart Contract interaction...', 'active');
        await new Promise(r => setTimeout(r, 2000));
        addLog('Contract: Funds locked. Staking confirmed on-chain.', 'success');

        // Step 3: Receipt back to Frontend
        await animatePacket(conns.frontendBlockchain, true);
        nodes.blockchain.classList.remove('active');
        nodes.frontend.classList.add('active');
        addLog('Frontend: Received transaction receipt. Syncing with backend...', 'active');
        await new Promise(r => setTimeout(r, 1000));

        // Step 4: Frontend calls Backend
        await animatePacket(conns.frontendBackend);
        nodes.frontend.classList.remove('active');
        nodes.backend.classList.add('active');
        addLog('Express Backend: Verifying transaction status on-chain...', 'active');
        await new Promise(r => setTimeout(r, 1500));
        addLog('Backend: Transaction verified. Updating internal records...', 'success');

        // Step 5: Backend to MongoDB
        await animatePacket(conns.backendMongodb);
        nodes.backend.classList.remove('active');
        nodes.mongodb.classList.add('active');
        addLog('MongoDB: Saving intern staking profile...', 'active');
        await new Promise(r => setTimeout(r, 1200));
        addLog('Database: Profile updated (isStaking: true). Sync complete.', 'success');

        // Final State
        await new Promise(r => setTimeout(r, 500));
        addLog('--- STAKING PROCESS COMPLETED SUCCESSFULLY ---', 'success');
        
        // Reset after delay
        setTimeout(() => {
            Object.values(nodes).forEach(n => n.classList.remove('active'));
            btnStake.disabled = false;
            btnStake.style.opacity = '1';
        }, 3000);
    };

    btnStake.addEventListener('click', runSimulation);
});
