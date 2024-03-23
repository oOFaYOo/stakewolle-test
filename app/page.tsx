'use client'

import {useEffect, useState} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import {Paper, TextField, Button} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
                setWallet(initialState);
            }
        };

        const refreshChain = (chainId: any) => {
            setWallet((wallet) => ({...wallet, chainId}));
        };

        const getProvider = async () => {
            const provider = await detectEthereumProvider({silent: true});
            setHasProvider(Boolean(provider));

            if (provider) {
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                refreshAccounts(accounts);
                window.ethereum.on("accountsChanged", refreshAccounts);
                window.ethereum.on("chainChanged", refreshChain);
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
            await window.ethereum!.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            })
        );
        const chainId = await window.ethereum!.request({
            method: "eth_chainId",
        });
        setWallet({accounts, balance, chainId});
    };

    const handleConnect = async () => {
        let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        updateWallet(accounts);
    };

    return (

        <form className="bg-neutral-100/70 shadow-xl justify-evenly items-center rounded-xl h-[50vh] w-[50vw] flex flex-col gap-2 p-4">
            <div className={'flex flex-col w-full'}>
                <h2>Account:</h2>
                <p className={'opacity-50'}>{wallet.accounts[0]}</p>
            </div>
            {wallet.accounts.length > 0 && (
                <div className={'flex flex-col w-full text-xl'}>
                    <h2>BALANCE:</h2>
                    <p className={'opacity-70'}>{wallet.balance}</p>
                </div>
            )}
            <div className={'flex w-full justify-between gap-8 items-center'}>
                <TextField name={'amount'} fullWidth id="outlined-basic" label="Amount" variant="outlined" required/>
                <ArrowForwardIcon fontSize={'medium'} className={'bg-[#1976d2] text-white rounded-full'} />
                <TextField name={'to'} fullWidth id="outlined-basic" label="To" variant="outlined" required/>
            </div>
            <Button type={'submit'} className={'w-[100px]'} variant="contained">send</Button>
        </form>
    );
};

export default App;

