import {
    ConnectKitButton,
    ConnectKitProvider,
    getDefaultClient,
} from "connectkit";
import "./App.css";
import { createClient, useAccount, WagmiConfig } from "wagmi";
import {
    goerli,
    mainnet,
    polygon,
    polygonMumbai,
    bsc,
    bscTestnet,
} from "wagmi/chains";
import Test from "./Test";

function App() {
    const chains = [mainnet, goerli, polygon, polygonMumbai, bsc, bscTestnet];
    const client = createClient(
        getDefaultClient({
            appName: "Priori",
            autoConnect: true,
            chains,
        })
    );

    return (
        <WagmiConfig client={client}>
            <ConnectKitProvider
                theme="soft"
                customTheme={{
                    "--ck-overlay-background":
                        "var(--chakra-colors-blackAlpha-700)",
                    "--ck-overlay-backdrop-filter": "blur(10px)",
                }}
                options={{
                    hideNoWalletCTA: true,
                    hideTooltips: true,
                }}>
                <div className="app">
                    <ConnectKitButton />
                    <Test />
                </div>
            </ConnectKitProvider>
        </WagmiConfig>
    );
}

export default App;
