'use client'

import {useEffect, useState} from "react";
import detectEthereumProvider from "@metamask/detect-provider";
import {Paper, TextField, Button} from "@mui/material";
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

const App = () => {

    const formatBalance = (rawBalance: string) => {
        return (parseInt(rawBalance) / 1000000000000000000).toFixed(2);
    };

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

            if (provider) {
                // @ts-ignore
                const accounts = await window.ethereum.request({
                    method: "eth_accounts",
                });
                refreshAccounts(accounts);
                // @ts-ignore
                window.ethereum.on("accountsChanged", refreshAccounts);
                // @ts-ignore
                window.ethereum.on("chainChanged", refreshChain);
            }
        };

        getProvider();

        return () => {
            // @ts-ignore
            window.ethereum?.removeListener("accountsChanged", refreshAccounts);
            // @ts-ignore
            window.ethereum?.removeListener(
                "chainChanged",
                refreshChain
            );
        };
    }, []);

    const updateWallet = async (accounts: any) => {
        const balance = formatBalance(
            // @ts-ignore
            await window.ethereum!.request({
                method: "eth_getBalance",
                params: [accounts[0], "latest"],
            })
        );
        // @ts-ignore
        const chainId = await window.ethereum!.request({
            method: "eth_chainId",
        });
        setWallet({accounts, balance, chainId});
    };

    const handleConnect = async () => {
        // @ts-ignore
        let accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
        });
        updateWallet(accounts);
    };
    handleConnect();

    return (

        <form className="bg-neutral-100/70 shadow-xl justify-evenly items-center rounded-xl sm:h-[50vh] md:w-[50vw]
        flex flex-col gap-2 p-4 w-[90%] h-[80vh]" onSubmit={async (e) => {
            e.preventDefault();
            const data = new FormData(e.target as HTMLFormElement);
            data.set('from', `${wallet.accounts[0]}`);
            // @ts-ignore
            await window.ethereum.request({
                "method": "eth_sendTransaction",
                "params": [Object.fromEntries(data)]
            });
        }}>
            <div className={'flex flex-col w-full'}>
                <h2>Account:</h2>
                <p title={wallet.accounts[0]} className={'opacity-50 overflow-hidden text-ellipsis'}>{wallet.accounts[0]}</p>
            </div>
            {wallet.accounts.length > 0 && (
                <div className={'flex flex-col w-full text-xl'}>
                    <h2>BALANCE:</h2>
                    <p className={'opacity-70'}>{wallet.balance}</p>
                </div>
            )}
            <div className={'flex w-full justify-between sm:gap-8 gap-2 items-center sm:flex-row flex-col'}>
                <TextField name={'amount'} fullWidth id="outlined-basic" label="Amount" variant="outlined" required/>
                <ArrowForwardIcon fontSize={'medium'} className={'bg-[#1976d2] text-white rounded-full'} />
                <TextField name={'to'} fullWidth id="outlined-basic" label="To" variant="outlined" required/>
            </div>
            <Button type={'submit'} className={'w-[100px]'} variant="contained">send</Button>
        </form>
    );
};

export default App;