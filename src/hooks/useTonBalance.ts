import { useEffect, useState } from 'react';
import { useTonClient } from './useTonClient';
import { useTonConnect } from './useTonConnect';
import { useTonConnectUI } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

interface BalanceInfo {
  balance: string;
  balanceFormatted: string;
  usdValue: number;
  krwValue: number;
  loading: boolean;
}

export function useTonBalance(): BalanceInfo {
  const client = useTonClient();
  const { connected } = useTonConnect();
  const [tonConnectUI] = useTonConnectUI();
  const [balanceInfo, setBalanceInfo] = useState<BalanceInfo>({
    balance: '0',
    balanceFormatted: '0',
    usdValue: 0,
    krwValue: 0,
    loading: true
  });

  // TON 가격 조회 함수
  const fetchTonPrice = async (): Promise<{ usd: number; krw: number }> => {
    try {
      // Vite 프록시를 통해 CoinGecko API 호출
      const response = await fetch('/api/coingecko/simple/price?ids=the-open-network&vs_currencies=usd,krw');
      const data = await response.json();
      
      console.log('Price data:', data);
      
      return {
        usd: data['the-open-network']?.usd || 0,
        krw: data['the-open-network']?.krw || 0
      };
    } catch (error) {
      console.error('Failed to fetch TON price:', error);
      // 기본값으로 TON 가격 설정 (약 $3.07)
      return { usd: 3.07, krw: 4000 };
    }
  };

  // 잔액 조회 함수
  const fetchBalance = async () => {
    if (!client || !connected) {
      setBalanceInfo(prev => ({ ...prev, loading: false }));
      return;
    }

    try {
      setBalanceInfo(prev => ({ ...prev, loading: true }));

      // 연결된 지갑 주소 가져오기 (테스트넷)
      const walletAddress = tonConnectUI?.account?.address || (window as any).tonconnect?.account?.address;
      console.log('TonConnectUI account:', tonConnectUI?.account);
      console.log('Window tonconnect account:', (window as any).tonconnect?.account);
      console.log('Wallet address:', walletAddress);
      
      if (!walletAddress) {
        console.log('No wallet address found');
        setBalanceInfo(prev => ({ ...prev, loading: false }));
        return;
      }

      // 잔액 조회
      const address = Address.parse(walletAddress);
      console.log('Parsed address:', address.toString());
      
      const balance = await client.getBalance(address);
      console.log('Raw balance (nanoTON):', balance.toString());
      
      // TON 단위로 변환 (1 TON = 10^9 nanoTON)
      const tonBalance = Number(balance) / 1e9;
      // 소수점 둘째 자리까지 표시 (1.99로 정확히 표시)
      const balanceFormatted = Math.floor(tonBalance * 100) / 100;
      console.log('TON balance:', tonBalance);
      console.log('Formatted balance:', balanceFormatted);

      // 가격 정보 조회
      const priceInfo = await fetchTonPrice();
      console.log('Price info from API:', priceInfo);
      
      const usdValue = tonBalance * priceInfo.usd;
      const krwValue = tonBalance * priceInfo.krw;
      
      console.log('Calculation details:', {
        tonBalance: tonBalance,
        pricePerTon: priceInfo.usd,
        rawUsdValue: usdValue,
        roundedUsdValue: Math.round(usdValue * 100) / 100,
        tonkeeperExpected: 12.43
      });

      console.log('Final balance info:', {
        balance: balance.toString(),
        balanceFormatted,
        usdValue,
        krwValue
      });

      // USD 가치를 정확히 반올림 (2자리)
      const roundedUsdValue = Math.round(usdValue * 100) / 100;
      const roundedKrwValue = Math.round(krwValue);

      // 실제 잔액 사용 (하드코딩 제거)
      setBalanceInfo({
        balance: balance.toString(),
        balanceFormatted: balanceFormatted.toString(),
        usdValue: roundedUsdValue,
        krwValue: roundedKrwValue,
        loading: false
      });
    } catch (error) {
      console.error('Failed to fetch balance:', error);
      setBalanceInfo(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    fetchBalance();
    
    // 60초마다 잔액과 가격 업데이트 (API 요청 빈도 줄이기)
    const interval = setInterval(fetchBalance, 60000);
    
    return () => clearInterval(interval);
  }, [client, connected, tonConnectUI]);

  return balanceInfo;
}
