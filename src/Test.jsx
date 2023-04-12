import React, { useEffect, useMemo } from "react";
import EthersAdapter from "@safe-global/safe-ethers-lib";
import { ethers } from "ethers";
import { useAccount, useSigner } from "wagmi";
import Safe from "@safe-global/safe-core-sdk";
import SafeServiceClient from "@safe-global/safe-service-client";
import { parseUnits, Interface } from "ethers/lib/utils";
import { OperationType } from "@safe-global/safe-core-sdk-types";

const getIsNativeToken = address => parseInt(address, 16) === 0;
const safeParseUnits = (value, decimals) => {
    try {
        return parseUnits(value, decimals);
    } catch (err) {
        console.error("Error parsing units", err);
        return 0;
    }
};
const encodeERC20TransferData = (to, value) => {
    const erc20Abi = ["function transfer(address to, uint256 value)"];
    const contractInterface = new Interface(erc20Abi);
    return contractInterface.encodeFunctionData("transfer", [to, value]);
};

const getSafeTransactionData = (
    amount,
    assetAddress,
    decimals,
    toAddress,
    nonce
) => {
    const isNativeToken = getIsNativeToken(assetAddress);
    const amountParsed = safeParseUnits(String(amount), decimals).toString();
    const data = {
        nonce,
        operation: OperationType.Call,
        safeTxGas: 0,
        baseGas: 0,
        gasPrice: 0,
    };
    if (isNativeToken)
        return {
            to: toAddress,
            data: "0x",
            value: amountParsed,
            ...data,
        };
    return {
        to: assetAddress,
        data: encodeERC20TransferData(toAddress, amountParsed),
        value: "0",
        ...data,
    };
};

const Test = () => {
    const safeAddress = "0xAb66A5e9502c19D95b34Ef2fA67d727c578577aa";
    const txServiceUrl = "https://safe-transaction.goerli.gnosis.io";
    const asset = {
        address: "0x4fde37d01aa58b20c044b09f9adddca6b1127343",
        decimals: 18,
    };

    const { address, isConnecting, isDisconnected } = useAccount();
    const { data: signer, isLoading } = useSigner();
    const ethAdapter = useMemo(() => {
        if (signer)
            return new EthersAdapter({
                ethers,
                signerOrProvider: signer,
            });
        return null;
    }, [signer, isLoading]);

    const onClick = async () => {
        console.log("Click");
        const signerAddress = await ethAdapter?.getSignerAddress();
        const safeSdk = await Safe.create({
            ethAdapter,
            safeAddress,
        });
        const safeService = new SafeServiceClient({
            txServiceUrl,
            ethAdapter,
        });
        const nonce = await safeService.getNextNonce(safeAddress);

        const safeTransactionData = getSafeTransactionData(
            "10",
            asset.address,
            asset.decimals,
            "0x946300C5D5A33A5fF8C9931594f91109b272e6d1",
            nonce
        );

        console.log({
            signerAddress,
            safeSdk,
            safeService,
            nonce,
            safeTransactionData,
        });
        const safeTransaction = await safeSdk.createTransaction({
            safeTransactionData,
        });
        const safeTxHash = await safeSdk.getTransactionHash(safeTransaction);
        const senderSignature = await safeSdk
            .signTypedData(safeTransaction)
            .catch(error => {
                console.log("Sign failed >> ", error);
                throw new Error("Sign failed");
            });

        console.log({ safeTxHash, senderSignature });
    };
    if (isDisconnected) return null;
    return (
        <div>
            <p>Address : {address}</p>
            <button onClick={onClick}>Initate Txn</button>
        </div>
    );
};

export default Test;
