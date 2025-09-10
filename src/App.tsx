import './App.css';
import { TonConnectButton } from '@tonconnect/ui-react';
import { useTonConnect } from './hooks/useTonConnect';
import { useCounterContract } from './hooks/useCounterContract';
import { useTonBalance } from './hooks/useTonBalance';
import '@twa-dev/sdk';

function App() {
  const { connected } = useTonConnect();
  const { value, address, sendIncrement } = useCounterContract();
  const { balanceFormatted, usdValue, krwValue, loading } = useTonBalance();

  return (
    <div className='App'>
      <div className='Container'>
        <TonConnectButton />
        
        <div className='Card'>
          <b>🧪 Testnet 설정</b>
          <div className='TestnetGuide'>
            <p>1. <strong>Tonkeeper</strong> 지갑을 테스트넷 모드로 설정</p>
            <p>2. <strong>테스트넷 TON</strong> 받기:</p>
            <div className='FaucetLinks'>
              <a href="https://testnet.toncenter.com/faucet" target="_blank" rel="noopener noreferrer">
                🔗 TON Center Faucet
              </a>
              <a href="https://t.me/testgiver_ton_bot" target="_blank" rel="noopener noreferrer">
                🤖 Telegram Bot
              </a>
            </div>
          </div>
        </div>
        
        {connected && (
          <div className='Card'>
            <b>💰 Wallet Balance (Testnet)</b>
            <div className='BalanceInfo'>
              <div className='BalanceAmount'>
                {loading ? 'Loading...' : `${balanceFormatted} TON`}
              </div>
              <div className='BalanceValue'>
                {loading ? 'Loading...' : `$${usdValue.toFixed(2)} USD`}
              </div>
              <div className='BalanceValue'>
                {loading ? 'Loading...' : `₩${krwValue.toLocaleString()} KRW`}
              </div>
            </div>
            <div className='TestnetInfo'>
              <small>💡 테스트넷 TON이 필요합니다</small>
            </div>
          </div>
        )}
        
        <div className='Card'>
          <b>Counter Address</b>
          <div className='Hint'>{address?.slice(0, 30) + '...'}</div>
        </div>
        
        <div className='Card'>
          <b>Counter Value</b>
          <div>{value ?? 'Loading...'}</div>
        </div>
        
        <button
          className={`Button ${connected ? 'Active' : 'Disabled'}`}
          onClick={() => {
            if (connected) {
              sendIncrement();
            }
          }}
          disabled={!connected}
        >
          Increment
        </button>
      </div>
    </div>
  );
}

export default App;