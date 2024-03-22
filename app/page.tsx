'use client'

import {useEffect, useState} from "react";
import detectEthereumProvider from "@metamask/detect-provider";

const App = () => {

    const formatBalance = (rawBalance: string) => {
        return (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
    };

    const formatChainAsNum = (chainIdHex: string) => {
        return parseInt(chainIdHex);
    };

    const [hasProvider, setHasProvider] = useState<boolean | null>(null);
    const initialState = {
        accounts: [],
        balance: "",
        chainId: "",
    }; /* Updated */
    const [wallet, setWallet] = useState(initialState);

    useEffect(() => {
        const refreshAccounts = (accounts: any) => {
            if (accounts.length > 0) {
                updateWallet(accounts);
            } else {
                // if length 0, user is disconnected
                setWallet(initialState);
            }
        };

        const refreshChain = (chainId: any) => {               /* New */
            setWallet((wallet) => ({ ...wallet, chainId }));   /* New */
        };                                                     /* New */

        const getProvider = async () => {
            const provider = await detectEthereumProvider({ silent: true });
            setHasProvider(Boolean(provider));

            if (provider) {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                refreshAccounts(accounts);
                window.ethereum.on("accountsChanged", refreshAccounts);
                window.ethereum.on("chainChanged", refreshChain); /* New */
            }
        };

        getProvider();

        return () => {
            window.ethereum?.removeListener("accountsChanged", refreshAccounts);
            window.ethereum?.removeListener(
                "chainChanged",
                refreshChain
            ); /* New */
        };
    }, []);

    const updateWallet = async (accounts: any) => {
        const balance = formatBalance(
            await window.ethereum!.request({              /* New */
                method: "eth_getBalance",                 /* New */
                params: [accounts[0], "latest"],          /* New */
            })
        );                                                /* New */
        const chainId = await window.ethereum!.request({  /* New */
            method: "eth_chainId",                        /* New */
        });                                               /* New */
        setWallet({ accounts, balance, chainId });        /* Updated */
    };

    const handleConnect = async () => {
        let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        updateWallet(accounts);
    };

    return (
        <div className="relative bg-amber-400 h-[50vh] flex p-8">


            {window.ethereum?.isMetaMask && wallet.accounts.length < 1 && (
                <button onClick={handleConnect}>Connect MetaMask</button>
            )}

            {wallet.accounts.length > 0 && (
                <>                                                    {/* New */}
                    <div>Wallet Accounts: {wallet.accounts[0]}</div>
                    <div>Wallet Balance: {wallet.balance}</div>       {/* New */}
                                                             {/* New */}
                </>
            )}
        </div>
    );
};

export default App;

